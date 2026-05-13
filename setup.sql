-- Create the database
CREATE DATABASE IF NOT EXISTS typeflow;
USE typeflow;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stats table
CREATE TABLE IF NOT EXISTS stats (
    user_id INT PRIMARY KEY,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    best_wpm INT DEFAULT 0,
    best_acc INT DEFAULT 0,
    history TEXT, -- Store history as a JSON string
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
