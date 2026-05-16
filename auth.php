<?php
// auth.php - Registration & Login API
header('Content-Type: application/json');
require_once 'db.php';
session_start();

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

if ($action === 'register') {
    $user = $data['username'] ?? '';
    $pass = $data['password'] ?? '';
    $email = $data['email'] ?? '';

    if (!$user || !$pass) {
        echo json_encode(['success' => false, 'message' => 'Username and password required']);
        exit;
    }

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$user]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username already taken']);
        exit;
    }

    // Hash password
    $hashed = password_hash($pass, PASSWORD_DEFAULT);

    // Insert user
    $stmt = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->execute([$user, $hashed, $email]);
    $userId = $pdo->lastInsertId();

    // Initialize stats
    $stmt = $pdo->prepare("INSERT INTO stats (user_id, history) VALUES (?, ?)");
    $stmt->execute([$userId, json_encode([])]);

    echo json_encode(['success' => true, 'message' => 'Account created!']);
} 

elseif ($action === 'login') {
    $user = $data['username'] ?? '';
    $pass = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT id, password, avatar FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $dbUser = $stmt->fetch();

    if ($dbUser && password_verify($pass, $dbUser['password'])) {
        $_SESSION['user_id'] = $dbUser['id'];
        $_SESSION['username'] = $user;
        $_SESSION['avatar'] = $dbUser['avatar'];
        echo json_encode(['success' => true, 'username' => $user, 'avatar' => $dbUser['avatar']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
}

elseif ($action === 'forgot_password') {
    $user = $data['username'] ?? '';
    $newPass = $data['newPassword'] ?? '';
    $confirmPass = $data['confirmPassword'] ?? '';

    if (!$user || !$newPass || !$confirmPass) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    if (strlen($newPass) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }

    if ($newPass !== $confirmPass) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        exit;
    }

    // Check user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $found = $stmt->fetch();

    if (!$found) {
        echo json_encode(['success' => false, 'message' => 'Username not found']);
        exit;
    }

    // Reset password
    $hashed = password_hash($newPass, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
    $stmt->execute([$hashed, $user]);

    echo json_encode(['success' => true, 'message' => 'Password reset successfully!']);
}

elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}

elseif ($action === 'update_profile') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $newName = $data['displayName'] ?? '';
    $newPass = $data['newPassword'] ?? '';
    $oldPass = $data['oldPassword'] ?? '';

    // If changing password, verify old one
    if ($newPass) {
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($oldPass, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password incorrect']);
            exit;
        }

        $hashed = password_hash($newPass, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashed, $userId]);
    }

    echo json_encode(['success' => true, 'message' => 'Profile updated!']);
}

elseif ($action === 'check') {
    if (isset($_SESSION['username'])) {
        // Always re-fetch avatar from DB so it reflects any changes made
        $stmt = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $row = $stmt->fetch();
        $avatar = $row['avatar'] ?? 'default-avatar.png';

        // Keep session in sync
        $_SESSION['avatar'] = $avatar;

        echo json_encode([
            'loggedIn' => true,
            'username' => $_SESSION['username'],
            'avatar'   => $avatar
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
}
?>
