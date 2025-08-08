// // This script runs when the HTML document has been completely loaded and parsed.
// document.addEventListener('DOMContentLoaded', () => {

//     // --- State and Configuration ---
//     const apiUrl = 'http://localhost:3000'; // Or your Replit URL when deployed
//     const token = localStorage.getItem('token'); // Get the user's token from browser storage

//     // --- Helper Functions ---

//     /**
//      * Updates the navigation links based on whether a user is logged in.
//      */
//     const updateNavLinks = () => {
//         const loginLink = document.getElementById('login-link');
//         const registerLink = document.getElementById('register-link');
//         const addRecipeLink = document.getElementById('add-recipe-link');
//         const logoutButton = document.getElementById('logout-button');
//         const logoutButtonForm = document.getElementById('logout-button-form'); // Logout button on form pages

//         if (token) {
//             // User is logged in: Hide Login/Register, Show Add Recipe/Logout
//             if (loginLink) loginLink.style.display = 'none';
//             if (registerLink) registerLink.style.display = 'none';
//             if (addRecipeLink) addRecipeLink.style.display = 'block'; // Use 'block' or 'inline' as appropriate
//             if (logoutButton) logoutButton.style.display = 'block';
//             if (logoutButtonForm) logoutButtonForm.style.display = 'block';
//         } else {
//             // User is not logged in: Show Login/Register, Hide Add Recipe/Logout
//             if (loginLink) loginLink.style.display = 'block';
//             if (registerLink) registerLink.style.display = 'block';
//             if (addRecipeLink) addRecipeLink.style.display = 'none';
//             if (logoutButton) logoutButton.style.display = 'none';
//             if (logoutButtonForm) logoutButtonForm.style.display = 'none';
//         }
//     };

//     /**
//      * Logs the user out by clearing the token and reloading the page.
//      */
//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         alert('You have been logged out.');
//         window.location.href = 'index.html'; // Redirect to homepage
//     };


//     // --- Page-Specific Logic ---

//     // 1. Logic for the Homepage (index.html)
//     const recipeListContainer = document.getElementById('recipe-list');
//     if (recipeListContainer) {
//         const fetchAndDisplayRecipes = async (searchTerm = '') => {
//             try {
//                 let url = `${apiUrl}/api/recipes`;
//                 if (searchTerm) {
//                     // Append search term as a query parameter
//                     url += `?search=${encodeURIComponent(searchTerm)}`;
//                 }
//                 const response = await fetch(url);
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const recipes = await response.json();
                
//                 recipeListContainer.innerHTML = ''; // Clear previous results
//                 if (recipes.length === 0) {
//                     recipeListContainer.innerHTML = '<p>No recipes found. Try a different search!</p>';
//                     return;
//                 }

//                 recipes.forEach(recipe => {
//                     const recipeCard = document.createElement('a');
//                     recipeCard.href = `recipe.html?rid=${recipe.rid}`; // Link to the detail page
//                     recipeCard.className = 'recipe-card';
//                     recipeCard.innerHTML = `
//                         <img src="${recipe.image || 'https://via.placeholder.com/300x200.png?text=No+Image'}" alt="${recipe.name}">
//                         <div class="recipe-card-content">
//                             <h3>${recipe.name}</h3>
//                             <p><strong>Type:</strong> ${recipe.type}</p>
//                             <p>${recipe.description.substring(0, 100)}...</p>
//                         </div>
//                     `;
//                     recipeListContainer.appendChild(recipeCard);
//                 });
//             } catch (error) {
//                 console.error('Error fetching recipes:', error);
//                 recipeListContainer.innerHTML = '<p>Could not load recipes. Please try again later.</p>';
//             }
//         };

//         // Initial fetch when the page loads
//         fetchAndDisplayRecipes();

//         // Add event listener for the search button
//         const searchButton = document.getElementById('searchButton');
//         const searchInput = document.getElementById('searchInput');
//         searchButton.addEventListener('click', () => {
//             fetchAndDisplayRecipes(searchInput.value);
//         });
//         searchInput.addEventListener('keyup', (event) => {
//             if (event.key === 'Enter') {
//                 fetchAndDisplayRecipes(searchInput.value);
//             }
//         });
//     }

//     // 2. Logic for the Single Recipe Page (recipe.html)
//     const recipeDetailsContainer = document.getElementById('recipe-details');
//     if (recipeDetailsContainer) {
//         const urlParams = new URLSearchParams(window.location.search);
//         const recipeId = urlParams.get('rid');

//         if (recipeId) {
//             const fetchAndDisplaySingleRecipe = async () => {
//                 try {
//                     const response = await fetch(`${apiUrl}/api/recipes/${recipeId}`);
//                     if (!response.ok) {
//                          if(response.status === 404) {
//                             recipeDetailsContainer.innerHTML = '<p>Recipe not found.</p>';
//                         } else {
//                             throw new Error('Failed to fetch recipe details');
//                         }
//                         return;
//                     }
//                     const recipe = await response.json();
                    
//                     recipeDetailsContainer.innerHTML = `
//                         <h1>${recipe.name}</h1>
//                         <img src="${recipe.image || 'https://via.placeholder.com/600x400.png?text=No+Image'}" alt="${recipe.name}" style="width:100%; max-width:600px; border-radius:8px;">
//                         <p><strong>By:</strong> ${recipe.owner}</p>
//                         <p><strong>Type:</strong> ${recipe.type}</p>
//                         <p><strong>Cooking Time:</strong> ${recipe.cookingtime} minutes</p>
//                         <h3>Description</h3>
//                         <p>${recipe.description}</p>
//                         <h3>Ingredients</h3>
//                         <p style="white-space: pre-wrap;">${recipe.ingredients}</p>
//                         <h3>Instructions</h3>
//                         <p style="white-space: pre-wrap;">${recipe.instructions}</p>
//                     `;
//                 } catch (error) {
//                     console.error('Error fetching recipe:', error);
//                     recipeDetailsContainer.innerHTML = '<p>Could not load recipe details. Please try again later.</p>';
//                 }
//             };
//             fetchAndDisplaySingleRecipe();
//         } else {
//             recipeDetailsContainer.innerHTML = '<p>No recipe ID provided. Please go back to the homepage and select a recipe.</p>';
//         }
//     }
    
//     // 3. Logic for the Registration Page (register.html)
//     const registerForm = document.getElementById('register-form');
//     if (registerForm) {
//         registerForm.addEventListener('submit', async (e) => {
//             e.preventDefault(); // Prevent the form from submitting the traditional way
//             const messageEl = document.getElementById('register-message');
//             messageEl.textContent = ''; // Clear previous messages

//             const formData = new FormData(registerForm);
//             const data = Object.fromEntries(formData.entries());

//             try {
//                 const response = await fetch(`${apiUrl}/api/register`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(data),
//                 });
                
//                 const result = await response.json();

//                 if (!response.ok) {
//                     // The server responded with an error (e.g., username taken)
//                     throw new Error(result.message || 'Registration failed');
//                 }

//                 messageEl.style.color = 'green';
//                 messageEl.textContent = 'Registration successful! Redirecting to login...';
//                 setTimeout(() => {
//                     window.location.href = 'login.html';
//                 }, 2000);

//             } catch (error) {
//                 console.error('Registration error:', error);
//                 messageEl.style.color = 'var(--primary-color)';
//                 messageEl.textContent = error.message;
//             }
//         });
//     }

//     // 4. Logic for the Login Page (login.html)
//     const loginForm = document.getElementById('login-form');
//     if (loginForm) {
//         loginForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const messageEl = document.getElementById('login-message');
//             messageEl.textContent = '';

//             const formData = new FormData(loginForm);
//             const data = Object.fromEntries(formData.entries());

//             try {
//                 const response = await fetch(`${apiUrl}/api/login`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(data),
//                 });
                
//                 const result = await response.json();

//                 if (!response.ok) {
//                     throw new Error(result.message || 'Login failed');
//                 }
                
//                 // On successful login, save the token
//                 localStorage.setItem('token', result.token);

//                 messageEl.style.color = 'green';
//                 messageEl.textContent = 'Login successful! Redirecting...';
//                 setTimeout(() => {
//                     window.location.href = 'index.html';
//                 }, 1500);

//             } catch (error) {
//                 console.error('Login error:', error);
//                 messageEl.style.color = 'var(--primary-color)';
//                 messageEl.textContent = error.message;
//             }
//         });
//     }

//     // 5. Logic for the Add/Edit Recipe Page (add-recipe.html)
//     const recipeForm = document.getElementById('recipe-form');
//     if (recipeForm) {
//         // This page requires a user to be logged in
//         if (!token) {
//             alert('You must be logged in to add a recipe.');
//             window.location.href = 'login.html';
//             return; // Stop further execution
//         }
        
//         recipeForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const messageEl = document.getElementById('form-message');
//             messageEl.textContent = '';

//             const formData = new FormData(recipeForm);
//             const data = Object.fromEntries(formData.entries());
            
//             try {
//                 const response = await fetch(`${apiUrl}/api/recipes`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}` // Send the token for authentication
//                     },
//                     body: JSON.stringify(data)
//                 });
                
//                 const result = await response.json();

//                 if (!response.ok) {
//                     throw new Error(result.message || 'Failed to submit recipe.');
//                 }

//                 messageEl.style.color = 'green';
//                 messageEl.textContent = 'Recipe added successfully! Redirecting...';
//                 setTimeout(() => {
//                     window.location.href = 'index.html';
//                 }, 2000);

//             } catch (error) {
//                 console.error('Recipe submission error:', error);
//                 messageEl.style.color = 'var(--primary-color)';
//                 messageEl.textContent = error.message;
//             }
//         });
//     }

//     // --- Global Event Listeners ---
    
//     // Attach logout functionality to all logout buttons
//     const logoutButtons = document.querySelectorAll('#logout-button, #logout-button-form');
//     logoutButtons.forEach(button => button.addEventListener('click', handleLogout));
    
//     // Run initial setup functions
//     updateNavLinks();
// });



document.addEventListener('DOMContentLoaded', () => {

    // --- Global Configuration & State ---
    const apiUrl = 'http://localhost:3000'; // Change this if you deploy to Replit
    const token = localStorage.getItem('token');
    
    // --- Helper Functions ---
    const loader = document.getElementById('loader-overlay');
    const showLoader = () => loader.style.display = 'flex';
    const hideLoader = () => loader.style.display = 'none';

    /**
     * Decodes the JWT token to get user information (like uid).
     * @returns {object|null} The decoded payload or null if no token exists.
     */
    const getDecodedToken = () => {
        if (!token) return null;
        try {
            // The payload is the part between the two dots.
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    };
    const currentUser = getDecodedToken();

    /**
     * Updates navigation links based on login status.
     */
    const updateNavLinks = () => {
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        const addRecipeLink = document.getElementById('add-recipe-link');
        const logoutButtons = document.querySelectorAll('#logout-button, #logout-button-form');

        if (token) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (addRecipeLink) addRecipeLink.style.display = 'block';
            logoutButtons.forEach(btn => btn.style.display = 'block');
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (addRecipeLink) addRecipeLink.style.display = 'none';
            logoutButtons.forEach(btn => btn.style.display = 'none');
        }
    };
    
    /**
     * Handles user logout.
     */
    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
    };
    
    /**
     * Toggles password visibility in a form.
     */
    const setupPasswordToggle = () => {
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                togglePassword.classList.toggle('fa-eye-slash');
            });
        }
    };
    
    // --- Page-Specific Logic ---

    const page = window.location.pathname.split('/').pop();

    // 1. Homepage Logic (index.html)
    if (page === 'index.html' || page === '') {
        const recipeListContainer = document.getElementById('recipe-list');
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');

        const showSkeletonLoaders = () => {
            recipeListContainer.innerHTML = ''; // Clear existing content
            for (let i = 0; i < 6; i++) {
                const skeletonCard = document.createElement('div');
                skeletonCard.className = 'recipe-card';
                skeletonCard.innerHTML = `
                    <div class="skeleton skeleton-img"></div>
                    <div class="recipe-card-content">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text skeleton-text-short"></div>
                    </div>
                `;
                recipeListContainer.appendChild(skeletonCard);
            }
        };

        const fetchAndDisplayRecipes = async (searchTerm = '') => {
            showSkeletonLoaders();
            try {
                let url = `${apiUrl}/api/recipes`;
                if (searchTerm) url += `?search=${encodeURIComponent(searchTerm)}`;
                
                const response = await fetch(url);
                const recipes = await response.json();

                console.log('API RECEIPE RESPONSE', recipes)
                
                recipeListContainer.innerHTML = ''; // Clear skeletons
                if (recipes.length === 0) {
                    recipeListContainer.innerHTML = '<p>No recipes found.</p>';
                    return;
                }

                recipes.forEach(recipe => {
                    const recipeCard = document.createElement('a');
                    recipeCard.href = `recipe.html?rid=${recipe.rid}`;
                    recipeCard.className = 'recipe-card';
                    recipeCard.innerHTML = `
                        <img src="${recipe.image || 'https://lh3.googleusercontent.com/gg-dl/AJfQ9KTPIjRJln2OnKnWAb2DB2Fjlv-MLiJ7RCBSVKCoeckiEYlUfYJAPztiGvctuU2I7OYM048gP3AKwJorC_r93s5OSeQHlxMzaaVbPvmZPBgLwilGCmCV47a5mRN_QQkJCkz-SNhmIFGtBnSc9sFftwpTEH3rezb_DQBxWp5V807JTXAS2g'}" alt="${recipe.name}">
                        <div class="recipe-card-content">
                            <h3>${recipe.name}</h3>
                            <p><strong>Type:</strong> ${recipe.type}</p>
                            <p>${recipe.description.substring(0, 100)}...</p>
                        </div>
                    `;
                    recipeListContainer.appendChild(recipeCard);
                });
            } catch (error) {
                console.error('Error fetching recipes:', error);
                recipeListContainer.innerHTML = '<p class="message error">Could not load recipes. Please try again later.</p>';
            }
        };

        fetchAndDisplayRecipes(); // Initial load
        searchButton.addEventListener('click', () => fetchAndDisplayRecipes(searchInput.value));
        searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && fetchAndDisplayRecipes(searchInput.value));
    }

    // 2. Single Recipe Page Logic (recipe.html)
    if (page === 'recipe.html') {
        const recipeDetailsContainer = document.getElementById('recipe-details');
        const recipeId = new URLSearchParams(window.location.search).get('rid');

        if (!recipeId) {
            recipeDetailsContainer.innerHTML = '<p class="message error">Recipe not found. Please select a recipe from the homepage.</p>';
        } else {
            const fetchAndDisplaySingleRecipe = async () => {
                showLoader();
                try {
                    const response = await fetch(`${apiUrl}/api/recipes/${recipeId}`);
                    if (!response.ok) throw new Error('Recipe not found');
                    
                    const recipe = await response.json();
                    
                    recipeDetailsContainer.innerHTML = `
                        <h1>${recipe.name}</h1>
                        <img src="${recipe.image || 'https://via.placeholder.com/600x400.png?text=No+Image'}" alt="${recipe.name}" style="width:100%; max-width:600px; border-radius:8px;">
                        <p><strong>By:</strong> ${recipe.owner}</p>
                        <p><strong>Type:</strong> ${recipe.type}</p>
                        <p><strong>Cooking Time:</strong> ${recipe.cookingtime} minutes</p>
                        <h3>Description</h3>
                        <p>${recipe.description}</p>
                        <h3>Ingredients</h3>
                        <pre>${recipe.ingredients}</pre>
                        <h3>Instructions</h3>
                        <pre>${recipe.instructions}</pre>
                        <div id="edit-button-container"></div>
                    `;

                    // Show edit button if the logged-in user is the owner
                    if (currentUser && currentUser.uid === recipe.uid) {
                        const editButtonContainer = document.getElementById('edit-button-container');
                        editButtonContainer.innerHTML = `<a href="add-recipe.html?edit=${recipe.rid}" class="edit-button">Edit This Recipe</a>`;
                    }
                } catch (error) {
                    console.error('Error fetching recipe:', error);
                    recipeDetailsContainer.innerHTML = '<p class="message error">Could not load recipe details.</p>';
                } finally {
                    hideLoader();
                }
            };
            fetchAndDisplaySingleRecipe();
        }
    }

    // 3. Registration Page Logic (register.html)
    if (page === 'register.html') {
        const registerForm = document.getElementById('register-form');
        const messageEl = document.getElementById('register-message');
        
        setupPasswordToggle();

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageEl.textContent = '';
            
            // Client-side validation
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                messageEl.className = 'message error';
                messageEl.textContent = 'Please enter a valid email address.';
                return;
            }
            if (password.length < 8) {
                messageEl.className = 'message error';
                messageEl.textContent = 'Password must be at least 8 characters long.';
                return;
            }
            
            showLoader();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${apiUrl}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                messageEl.className = 'message success';
                messageEl.textContent = 'Registration successful! Redirecting to login...';
                setTimeout(() => window.location.href = 'login.html', 2000);
            } catch (error) {
                messageEl.className = 'message error';
                messageEl.textContent = error.message;
            } finally {
                hideLoader();
            }
        });
    }

    // 4. Login Page Logic (login.html)
    if (page === 'login.html') {
        const loginForm = document.getElementById('login-form');
        const messageEl = document.getElementById('login-message');
        
        setupPasswordToggle();
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageEl.textContent = '';

            if (loginForm.username.value === '' || loginForm.password.value === '') {
                 messageEl.className = 'message error';
                 messageEl.textContent = 'Please enter both username and password.';
                 return;
            }

            showLoader();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${apiUrl}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                localStorage.setItem('token', result.token);
                messageEl.className = 'message success';
                messageEl.textContent = 'Login successful! Redirecting...';
                setTimeout(() => window.location.href = 'index.html', 1500);
            } catch (error) {
                messageEl.className = 'message error';
                messageEl.textContent = error.message;
            } finally {
                hideLoader();
            }
        });
    }

    // 5. Add/Edit Recipe Page Logic (add-recipe.html)
    if (page === 'add-recipe.html') {
        if (!token) {
            alert('You must be logged in to access this page.');
            window.location.href = 'login.html';
            return;
        }

        const recipeForm = document.getElementById('recipe-form');
        const formTitle = document.getElementById('form-title');
        const messageEl = document.getElementById('form-message');
        const recipeId = new URLSearchParams(window.location.search).get('edit');

        const populateForm = async (rid) => {
            showLoader();
            try {
                const response = await fetch(`${apiUrl}/api/recipes/${rid}`);
                if (!response.ok) throw new Error('Could not fetch recipe data for editing.');
                const recipe = await response.json();

                // Security check: Only allow owners to populate the form
                if (currentUser.uid !== recipe.uid) {
                    alert('You are not authorized to edit this recipe.');
                    window.location.href = 'index.html';
                    return;
                }

                // Populate the form fields
                recipeForm.rid.value = recipe.rid;
                recipeForm.name.value = recipe.name;
                recipeForm.description.value = recipe.description;
                recipeForm.type.value = recipe.type;
                recipeForm.cookingtime.value = recipe.cookingtime;
                recipeForm.ingredients.value = recipe.ingredients;
                recipeForm.instructions.value = recipe.instructions;
                recipeForm.image.value = recipe.image;
            } catch (error) {
                messageEl.className = 'message error';
                messageEl.textContent = error.message;
            } finally {
                hideLoader();
            }
        };

        if (recipeId) {
            formTitle.textContent = 'Edit Your Recipe';
            populateForm(recipeId);
        }

        recipeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoader();
            const formData = new FormData(recipeForm);
            const data = Object.fromEntries(formData.entries());
            
            const method = recipeId ? 'PUT' : 'POST';
            let url = recipeId ? `${apiUrl}/api/recipes/${recipeId}` : `${apiUrl}/api/recipes`;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                messageEl.className = 'message success';
                messageEl.textContent = `Recipe ${recipeId ? 'updated' : 'added'} successfully! Redirecting...`;
                setTimeout(() => window.location.href = 'index.html', 2000);
            } catch (error) {
                messageEl.className = 'message error';
                messageEl.textContent = error.message;
            } finally {
                hideLoader();
            }
        });
    }

    // --- Global Initializers ---
    updateNavLinks();
    const allLogoutButtons = document.querySelectorAll('#logout-button, #logout-button-form');
    allLogoutButtons.forEach(button => button.addEventListener('click', handleLogout));
});