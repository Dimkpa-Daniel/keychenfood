// Import required packages
const express = require('express');
const mysql = require('mysql2/promise'); // Using the promise-based version of mysql2
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Enable CORS for all routes
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());
// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('docs'));

// --- Database Connection ---
// Create a connection pool to the database
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Security: Authentication Middleware ---
// This function will verify the JWT token sent by the client
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        // Save the decoded user information (like uid) to the request object
        req.user = decoded;
        next();
    });
};


// --- API Routes ---

// === User Routes ===

// POST /api/register - Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Form Validation: Check if required fields are present
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Security: Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Security: Use parameterized query to prevent SQL injection
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        // Handle potential errors, like a duplicate username/email
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// POST /api/login - Login a user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Find the user by username
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If credentials are valid, create a JWT token
        const token = jwt.sign(
            { uid: user.uid, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// === Recipe Routes (Public) ===

// GET /api/recipes - Get all recipes or search by name/type
app.get('/api/recipes', async (req, res) => {
    try {
        const { search } = req.query; // e.g., /api/recipes?search=chicken

        let sql = `
            SELECT r.rid, r.name, r.description, r.type, r.image, u.username AS owner
            FROM recipes r
            JOIN users u ON r.uid = u.uid
        `;
        const params = [];

        if (search) {
            sql += ' WHERE r.name LIKE ? OR r.type LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [recipes] = await db.query(sql, params);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});


// GET /api/recipes/:rid - Get a single recipe by its ID
app.get('/api/recipes/:rid', async (req, res) => {
    try {
        const { rid } = req.params;
        const [rows] = await db.query(
            `SELECT r.*, u.username AS owner
             FROM recipes r
             JOIN users u ON r.uid = u.uid
             WHERE r.rid = ?`,
            [rid]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipe', error: error.message });
    }
});


// === Recipe Routes (Protected - Require Login) ===

// POST /api/recipes - Add a new recipe
app.post('/api/recipes', verifyToken, async (req, res) => {
    try {
        const { name, description, type, cookingtime, ingredients, instructions, image } = req.body;
        const { uid } = req.user; // Get user ID from the verified token

        // Simple server-side validation
        if (!name || !ingredients || !instructions) {
             return res.status(400).json({ message: 'Name, ingredients, and instructions are required.' });
        }

        const sql = 'INSERT INTO recipes (name, description, type, cookingtime, ingredients, instructions, image, uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [name, description, type, cookingtime, ingredients, instructions, image, uid];

        const [result] = await db.query(sql, params);
        res.status(201).json({ message: 'Recipe added successfully', recipeId: result.insertId });

    } catch (error) {
        res.status(500).json({ message: 'Error adding recipe', error: error.message });
    }
});


// PUT /api/recipes/:rid - Update an existing recipe
app.put('/api/recipes/:rid', verifyToken, async (req, res) => {
    try {
        const { rid } = req.params;
        const { name, description, type, cookingtime, ingredients, instructions, image } = req.body;
        const loggedInUid = req.user.uid;

        // Authorization: Check if the user owns the recipe before updating
        const [recipeRows] = await db.query('SELECT uid FROM recipes WHERE rid = ?', [rid]);
        if (recipeRows.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        if (recipeRows[0].uid !== loggedInUid) {
            return res.status(403).json({ message: 'You are not authorized to edit this recipe.' });
        }

        // If authorized, proceed with the update
        const sql = `
            UPDATE recipes SET
            name = ?, description = ?, type = ?, cookingtime = ?,
            ingredients = ?, instructions = ?, image = ?
            WHERE rid = ?
        `;
        const params = [name, description, type, cookingtime, ingredients, instructions, image, rid];

        await db.query(sql, params);
        res.json({ message: 'Recipe updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error updating recipe', error: error.message });
    }
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});  


// ```

// ### **Part 4: Testing Your Application**

// **On Replit:**

// 1.  Make sure you have followed all the Replit setup steps above (created the Repl, uploaded files, set up the database and secrets).
// 2.  Go to the `Shell` tab.
// 3.  Install dependencies: `npm install`
// 4.  Run the server: `node server.js`
// 5.  A new window (WebView) will open on the right showing your `index.html` page. You can now test all the functionality. The URL in the address bar is public, so you can share it.

// **On VSCode (Local):**

// 1.  Make sure you have followed the local setup steps (XAMPP running, database created).
// 2.  Open the `virtual-kitchen` project in VSCode.
// 3.  Open the integrated terminal (`Ctrl+` or `Cmd+`).
// 4.  Install dependencies: `npm install`
// 5.  Run the server: `node server.js`
// 6.  Open your web browser and navigate to `http://localhost:3000`. You should see your website.

// Your backend is now complete. The final step is to write the frontend JavaScript (`public/js/script.js`) to interact with these API endpoints.