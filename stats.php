<?php
// stats.php - User Stats API
header('Content-Type: application/json');
require_once 'db.php';
session_start();

$user_id = $_SESSION['user_id'] ?? null;
$action = $_GET['action'] ?? 'load';

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if ($action === 'load') {
    $stmt = $pdo->prepare("SELECT xp, level, best_wpm as bestWpm, best_acc as bestAcc, history FROM stats WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $stats = $stmt->fetch();

    if ($stats) {
        $stats['history'] = json_decode($stats['history'], true);
        echo json_encode(['success' => true, 'data' => $stats]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No stats found']);
    }
} 

elseif ($action === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE stats SET xp = ?, level = ?, best_wpm = ?, best_acc = ?, history = ? WHERE user_id = ?");
    $stmt->execute([
        $data['xp'] ?? 0,
        $data['level'] ?? 1,
        $data['bestWpm'] ?? 0,
        $data['bestAcc'] ?? 0,
        json_encode($data['history'] ?? []),
        $user_id
    ]);

    echo json_encode(['success' => true]);
}
?>
