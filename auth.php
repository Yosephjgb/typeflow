<?php
// auth.php
error_reporting(E_ALL);
ini_set('display_errors', 0);          // Never leak HTML errors into JSON
header('Content-Type: application/json');
require_once 'db.php';
session_start();

$action = $_GET['action'] ?? '';
$data   = json_decode(file_get_contents('php://input'), true) ?? [];

// ──────────────────────────────────────────────
// REGISTER
// ──────────────────────────────────────────────
if ($action === 'register') {
    $user  = trim($data['username'] ?? '');
    $pass  = $data['password'] ?? '';
    $email = trim($data['email'] ?? '');

    if (!$user || strlen($user) < 3) {
        echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters.']);
        exit;
    }
    if (!preg_match('/^[a-zA-Z]+$/', $user)) {
        echo json_encode(['success' => false, 'message' => 'Username: letters only, no numbers or symbols.']);
        exit;
    }
    if (!$pass || strlen($pass) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'A valid email address is required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$user]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
        exit;
    }

    $hashed = password_hash($pass, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->execute([$user, $hashed, $email]);
    $userId = $pdo->lastInsertId();

    // Create empty stats row
    $stmt = $pdo->prepare("INSERT INTO stats (user_id, history) VALUES (?, ?)");
    $stmt->execute([$userId, '[]']);

    echo json_encode(['success' => true, 'message' => 'Account created!']);
    exit;
}

// ──────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────
if ($action === 'login') {
    $user = trim($data['username'] ?? '');
    $pass = $data['password'] ?? '';

    if (!$user || !$pass) {
        echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, password, avatar FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $dbUser = $stmt->fetch();

    if ($dbUser && password_verify($pass, $dbUser['password'])) {
        $_SESSION['user_id']  = $dbUser['id'];
        $_SESSION['username'] = $user;
        $_SESSION['avatar']   = $dbUser['avatar'];
        echo json_encode(['success' => true, 'username' => $user, 'avatar' => $dbUser['avatar']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
    exit;
}

// ──────────────────────────────────────────────
// CHECK SESSION
// ──────────────────────────────────────────────
if ($action === 'check') {
    if (isset($_SESSION['user_id'])) {
        // Always read avatar from DB (not session) so uploads take effect immediately
        $stmt = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $row = $stmt->fetch();
        $avatar = $row['avatar'] ?? 'default-avatar.png';
        $_SESSION['avatar'] = $avatar; // keep session in sync
        echo json_encode([
            'loggedIn' => true,
            'username' => $_SESSION['username'],
            'avatar'   => $avatar
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
    exit;
}

// ──────────────────────────────────────────────
// LOGOUT
// ──────────────────────────────────────────────
if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// ──────────────────────────────────────────────
// FORGOT PASSWORD (email + new password)
// ──────────────────────────────────────────────
if ($action === 'forgot_password') {
    $email       = trim($data['email']           ?? '');
    $newPassword = trim($data['newPassword']     ?? '');
    $confirm     = trim($data['confirmPassword'] ?? '');

    if (!$email || !$newPassword || !$confirm) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
        exit;
    }
    if (strlen($newPassword) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }
    if ($newPassword !== $confirm) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $dbUser = $stmt->fetch();

    if (!$dbUser) {
        // Generic message so we don't reveal whether an email exists
        echo json_encode(['success' => false, 'message' => 'No account found with that email address.']);
        exit;
    }

    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashed, $dbUser['id']]);

    echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
    exit;
}

// ──────────────────────────────────────────────
// UPDATE PROFILE (change password while logged in)
// ──────────────────────────────────────────────
if ($action === 'update_profile') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in.']);
        exit;
    }

    $oldPass = $data['oldPassword'] ?? '';
    $newPass = $data['newPassword'] ?? '';

    if (!$oldPass || !$newPass) {
        echo json_encode(['success' => false, 'message' => 'Both old and new passwords are required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($oldPass, $row['password'])) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
        exit;
    }

    $hashed = password_hash($newPass, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashed, $_SESSION['user_id']]);

    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action.']);
?>
