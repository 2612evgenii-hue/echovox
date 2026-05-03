<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

/**
 * @return non-falsy-string|null Relative web path /uploads/news/... or null if empty
 */
function news_normalize_image(?string $raw): ?string
{
    if ($raw === null) {
        return null;
    }
    $p = trim($raw);
    if ($p === '') {
        return null;
    }
    if (str_contains($p, '..')) {
        return null;
    }
    if (!preg_match('#^/uploads/news/[a-f0-9]{20}\.(webp|jpg)$#i', $p)) {
        return null;
    }

    return $p;
}

function news_delete_file(?string $webPath): void
{
    if ($webPath === null || $webPath === '') {
        return;
    }
    if (!preg_match('#^/uploads/news/[a-f0-9]{20}\.(webp|jpg)$#i', $webPath)) {
        return;
    }
    $base = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'news';
    $name = basename($webPath);
    $full = $base . DIRECTORY_SEPARATOR . $name;
    if (is_file($full)) {
        @unlink($full);
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = db()->query(
        'SELECT id, title, body, created_at, image FROM news ORDER BY datetime(created_at) DESC'
    );
    /** @var list<array<string, string|int|null>> $rows */
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_out(['news' => $rows]);
}

if ($method === 'POST') {
    require_admin();
    $in = read_json();
    $title = mb_substr(strip_tags(trim((string) ($in['title'] ?? ''))), 0, 200);
    $body = mb_substr(strip_tags(trim((string) ($in['body'] ?? ''))), 0, 20000);
    if ($title === '' || $body === '') {
        json_out(['error' => 'Заполните заголовок и текст'], 422);
    }
    $image = news_normalize_image(isset($in['image']) ? (string) $in['image'] : null);
    if ($image === null && isset($in['image']) && trim((string) $in['image']) !== '') {
        json_out(['error' => 'Некорректное изображение'], 422);
    }
    $created = gmdate('c');
    $stmt = db()->prepare(
        'INSERT INTO news (title, body, created_at, image) VALUES (:title, :body, :created, :image)'
    );
    $stmt->execute([
        ':title' => $title,
        ':body' => $body,
        ':created' => $created,
        ':image' => $image,
    ]);
    json_out(['ok' => true, 'id' => (int) db()->lastInsertId()]);
}

if ($method === 'DELETE') {
    require_admin();
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id < 1) {
        json_out(['error' => 'Некорректный id'], 422);
    }
    $sel = db()->prepare('SELECT image FROM news WHERE id = :id');
    $sel->execute([':id' => $id]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    $img = isset($row['image']) ? (string) $row['image'] : '';
    if ($img !== '') {
        news_delete_file($img);
    }
    $stmt = db()->prepare('DELETE FROM news WHERE id = :id');
    $stmt->execute([':id' => $id]);
    json_out(['ok' => true]);
}

json_out(['error' => 'Метод не поддерживается'], 405);
