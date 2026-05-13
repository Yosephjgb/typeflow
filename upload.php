<?php
// upload.php - Profile Picture Upload API
header('Content-Type: application/json');
require_once 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

if (isset($_FILES['avatar'])) {
    $file = $_FILES['avatar'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    
    $fileExt = explode('.', $fileName);
    $fileActualExt = strtolower(end($fileExt));
    
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (in_array($fileActualExt, $allowed)) {
        if ($fileError === 0) {
            if ($fileSize < 2000000) { // 2MB limit
                $fileNameNew = "profile_" . $user_id . "_" . time() . "." . $fileActualExt;
                $fileDestination = 'uploads/' . $fileNameNew;
                
                if (move_uploaded_file($fileTmpName, $fileDestination)) {
                    // Update database
                    $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                    $stmt->execute([$fileNameNew, $user_id]);
                    
                    echo json_encode(['success' => true, 'avatar' => $fileNameNew]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error moving file']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'File too large (max 2MB)']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Error uploading file']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    }
}
?>
