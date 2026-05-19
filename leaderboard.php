<?php
// leaderboard.php - Public Leaderboard API
header('Content-Type: application/json');
require_once 'db.php';

$limit = min((int)($_GET['limit'] ?? 20), 50);

try {
    // LEFT JOIN so users with no stats row still appear (they'll show 0 WPM)
    // Show everyone who has completed at least one test (best_wpm > 0),
    // but if nobody has played yet, fall back to all registered users.
    $stmt = $pdo->prepare("
        SELECT
            u.username,
            COALESCE(u.avatar, 'default-avatar.png') AS avatar,
            COALESCE(s.best_wpm, 0)    AS best_wpm,
            COALESCE(s.best_acc, 0.00) AS best_acc,
            COALESCE(s.level, 1)       AS level,
            COALESCE(s.xp, 0)          AS xp
        FROM users u
        LEFT JOIN stats s ON s.user_id = u.id
        ORDER BY best_wpm DESC, best_acc DESC
        LIMIT " . $limit . "
    ");
    $stmt->execute([]);
    $rows = $stmt->fetchAll();

    // Cast types so JSON is clean
    $rows = array_map(function($r) {
        return [
            'username' => $r['username'],
            'avatar'   => $r['avatar'],
            'best_wpm' => (int)$r['best_wpm'],
            'best_acc' => (float)$r['best_acc'],
            'level'    => (int)$r['level'],
            'xp'       => (int)$r['xp'],
        ];
    }, $rows);

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
