<?php
// leaderboard.php - Public Leaderboard API
header('Content-Type: application/json');
require_once 'db.php';

$limit = min((int)($_GET['limit'] ?? 20), 50);


try {
    $stmt = $pdo->prepare("
        SELECT u.username, u.avatar, s.best_wpm, s.best_acc, s.level, s.xp
        FROM stats s
        JOIN users u ON u.id = s.user_id
        WHERE s.best_wpm > 0
        ORDER BY s.best_wpm DESC, s.best_acc DESC
        LIMIT ?
        
    ");
    $stmt->execute([$limit]);
    $rows = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $rows]);
    
}
catch (Exception $e)
{
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
