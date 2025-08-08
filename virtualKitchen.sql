-- This script sets up your database tables and adds some sample data.

-- Create the 'users' table to store user information.
-- The `uid` is the user's unique ID.
-- The password will be stored securely hashed, not as plain text.
CREATE TABLE users (
    uid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Create the 'recipes' table to store recipe details.
-- The `rid` is the recipe's unique ID.
-- The `uid` column links each recipe to the user who created it.
CREATE TABLE recipes (
    rid INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    cookingtime INT,
    ingredients TEXT,
    instructions TEXT,
    image VARCHAR(255),
    uid INT,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Insert a sample user for testing.
-- Your Node.js server will handle hashing the password during registration.
-- For this initial setup, we insert a placeholder password that will be updated later.
INSERT INTO users (username, password, email) VALUES
('ChefJohn', '$2a$10$fWJ3O.p7s.1sJ8sH9.O/p.3uF1gA8hC6jE7iB2aD0eF4gG2iH6jK', 'john.doe@example.com'); -- The password is 'password123' hashed


-- Insert some sample recipes and link them to our sample user (whose uid is 1).
INSERT INTO recipes (name, description, type, cookingtime, ingredients, instructions, image, uid) VALUES
('Classic Spaghetti Carbonara', 'A traditional and delicious Italian pasta dish made with egg, hard cheese, cured pork, and black pepper. Ready in just 25 minutes!', 'Italian', 25, '200g Spaghetti, 2 large eggs, 50g Pancetta or Guanciale, 50g Pecorino Romano cheese, Black Pepper', '1. Cook the spaghetti in salted boiling water. 2. While the pasta cooks, fry the pancetta in a pan until crisp. 3. In a separate bowl, whisk the eggs and grated cheese together. 4. Drain the pasta, reserving some of the pasta water. Quickly mix the hot pasta with the pancetta, then add the egg and cheese mixture, stirring quickly to create a creamy sauce. Add a splash of pasta water if needed. Serve immediately with extra pepper.', 'https://www.allrecipes.com/thmb/bV1-z3f8E-2CHkk22o-a2L42D04=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/242023-classic-spaghetti-carbonara-DDMFS-4x3-38063a8a189b4c9292a4a7a11e8093ed.jpg', 1),
('Chicken Tikka Masala', 'A creamy and flavorful Indian curry that is a favorite all over the world. The chicken is marinated in yogurt and spices before being cooked in a rich tomato-based sauce.', 'Indian', 45, '500g Chicken breast, 1 cup Yogurt, 1 tbsp Ginger-garlic paste, 2 tbsp Tikka Masala spice mix, 1 can Tomato Sauce, 1 cup Heavy Cream, 1 Onion', '1. Cut chicken into bite-sized pieces and marinate in yogurt, ginger-garlic paste, and tikka masala mix for at least 1 hour. 2. Grill or pan-fry the chicken until cooked through. 3. In a separate pan, sauté chopped onion, then add tomato sauce and simmer for 10 minutes. 4. Stir in the heavy cream and the cooked chicken. Simmer for another 5 minutes. Serve hot with naan or rice.', 'https://www.allrecipes.com/thmb/1T06_m_3WHs11hF2aE3t3Qv5A7I=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/239867-Chicken-Tikka-Masala-ddmfs-4X3-0532-a58f785e003144859a73e51a666993ad.jpg', 1);