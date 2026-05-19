-- Create the database
CREATE DATABASE IF NOT EXISTS typeflow;
USE typeflow;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) UNIQUE,
    password     VARCHAR(255) NOT NULL,
    avatar       VARCHAR(255) DEFAULT 'default-avatar.png',
    reset_token  VARCHAR(64)  DEFAULT NULL,
    reset_expires DATETIME    DEFAULT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Create stats table
CREATE TABLE IF NOT EXISTS stats (
    user_id  INT PRIMARY KEY,
    xp       INT DEFAULT 0,
    level    INT DEFAULT 1,
    best_wpm INT DEFAULT 0,
    best_acc INT DEFAULT 0,
    history  TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Migration: run these if upgrading an existing install ──
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires DATETIME DEFAULT NULL;
