<?php
// auth.php - Registration & Login API
header('Content-Type: application/json');
require_once 'db.php';
session_start();

// ─── CONFIG ───────────────────────────────────────────────
define('APP_NAME',   'TypeFlow');
define('APP_URL',    'http://yourdomain.com');   // ← update this
define('FROM_EMAIL', 'noreply@yourdomain.com');  // ← update this
// ──────────────────────────────────────────────────────────

$action = $_GET['action'] ?? '';
$data   = json_decode(file_get_contents('php://input'), true);

// REGISTER
if ($action === 'register') {
    $user  = trim(strtolower($data['username'] ?? ''));
    $pass  = $data['password'] ?? '';
    $email = trim(strtolower($data['email'] ?? ''));

    if (!$user || !$pass) {
        echo json_encode(['success' => false, 'message' => 'Username and password required']); exit;
    }
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']); exit;
    }
    if (strlen($pass) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']); exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$user]);
    if ($stmt->fetch()) { echo json_encode(['success' => false, 'message' => 'Username already taken']); exit; }

    if ($email) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) { echo json_encode(['success' => false, 'message' => 'Email already registered']); exit; }
    }

    $hashed = password_hash($pass, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->execute([$user, $hashed, $email ?: null]);
    $userId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO stats (user_id, history) VALUES (?, ?)");
    $stmt->execute([$userId, json_encode([])]);

    echo json_encode(['success' => true, 'message' => 'Account created!']);
}

// LOGIN
elseif ($action === 'login') {
    $user = $data['username'] ?? '';
    $pass = $data['password'] ?? '';

    $stmt   = $pdo->prepare("SELECT id, password, avatar FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $dbUser = $stmt->fetch();

    if ($dbUser && password_verify($pass, $dbUser['password'])) {
        $_SESSION['user_id']  = $dbUser['id'];
        $_SESSION['username'] = $user;
        $_SESSION['avatar']   = $dbUser['avatar'];
        echo json_encode(['success' => true, 'username' => $user, 'avatar' => $dbUser['avatar']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
}

// FORGOT PASSWORD — sends email with reset link
elseif ($action === 'forgot_password') {
    $identifier = trim(strtolower($data['identifier'] ?? ''));

    if (!$identifier) {
        echo json_encode(['success' => false, 'message' => 'Please enter your username or email']); exit;
    }

    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    // Always return success to avoid user enumeration
    if (!$user || !$user['email']) {
        echo json_encode(['success' => true, 'message' => 'If that account exists and has an email, a reset link has been sent.']); exit;
    }

    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + 3600);

    $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
    $stmt->execute([$token, $expires, $user['id']]);

    $resetUrl = APP_URL . "/reset-password.html?token=" . urlencode($token);
    $to       = $user['email'];
    $subject  = APP_NAME . ' — Password Reset Request';
    $body     = "Hi {$user['username']},\n\n"
              . "We received a request to reset your " . APP_NAME . " password.\n\n"
              . "Click the link below to set a new password (valid for 1 hour):\n"
              . $resetUrl . "\n\n"
              . "If you didn't request this, you can safely ignore this email.\n\n"
              . "— The " . APP_NAME . " Team";
    $headers  = "From: " . FROM_EMAIL . "\r\nReply-To: " . FROM_EMAIL . "\r\nX-Mailer: PHP/" . phpversion();

    $sent = mail($to, $subject, $body, $headers);

    if ($sent) {
        echo json_encode(['success' => true, 'message' => 'If that account exists and has an email, a reset link has been sent.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email could not be sent. Please ask your host to enable PHP mail() or configure SMTP.']);
    }
}

// RESET PASSWORD — validates token, sets new password
elseif ($action === 'reset_password') {
    $token       = $data['token']           ?? '';
    $newPass     = $data['newPassword']     ?? '';
    $confirmPass = $data['confirmPassword'] ?? '';

    if (!$token || !$newPass || !$confirmPass) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']); exit;
    }
    if (strlen($newPass) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']); exit;
    }
    if ($newPass !== $confirmPass) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']); exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Reset link is invalid or has expired. Please request a new one.']); exit;
    }

    $hashed = password_hash($newPass, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
    $stmt->execute([$hashed, $user['id']]);

    echo json_encode(['success' => true, 'message' => 'Password reset successfully! You can now log in.']);
}

// LOGOUT
elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}

// UPDATE PROFILE
elseif ($action === 'update_profile') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']); exit;
    }

    $userId  = $_SESSION['user_id'];
    $newPass = $data['newPassword'] ?? '';
    $oldPass = $data['oldPassword'] ?? '';

    if ($newPass) {
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($oldPass, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password incorrect']); exit;
        }

        $hashed = password_hash($newPass, PASSWORD_DEFAULT);
        $stmt   = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashed, $userId]);
    }

    echo json_encode(['success' => true, 'message' => 'Profile updated!']);
}

// CHECK SESSION
elseif ($action === 'check') {
    if (isset($_SESSION['username'])) {
        $stmt = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $row    = $stmt->fetch();
        $avatar = $row['avatar'] ?? 'default-avatar.png';
        $_SESSION['avatar'] = $avatar;

        echo json_encode(['loggedIn' => true, 'username' => $_SESSION['username'], 'avatar' => $avatar]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
}
?>
