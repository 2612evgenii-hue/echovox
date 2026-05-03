<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    require_admin();
    $stmt = db()->query(
        'SELECT id, name, phone, message, created_at FROM contacts ORDER BY id DESC'
    );
    /** @var array<int, array<string, mixed>> $rows */
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_out(['contacts' => $rows]);
}

if ($method === 'DELETE') {
    require_admin();
    $id = (int) ($_GET['id'] ?? 0);
    if ($id < 1) {
        json_out(['error' => 'Некорректный id'], 422);
    }
    $stmt = db()->prepare('DELETE FROM contacts WHERE id = ?');
    $stmt->execute([$id]);
    json_out(['ok' => true]);
}

json_out(['error' => 'Метод не поддерживается'], 405);
