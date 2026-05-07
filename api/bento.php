<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

/**
 * @return non-falsy-string|null
 */
function bento_normalize_image(?string $raw): ?string
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
    if (
        preg_match('#^/uploads/bento/[a-f0-9]{20}\.(webp|jpg)$#i', $p)
        || preg_match('#^/bento-default/im[1-6]\.jpeg$#i', $p)
    ) {
        return $p;
    }

    return null;
}

function bento_delete_file(?string $webPath): void
{
    if ($webPath === null || $webPath === '') {
        return;
    }
    if (!preg_match('#^/uploads/bento/[a-f0-9]{20}\.(webp|jpg)$#i', $webPath)) {
        return;
    }
    $base = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'bento';
    $name = basename($webPath);
    $full = $base . DIRECTORY_SEPARATOR . $name;
    if (is_file($full)) {
        @unlink($full);
    }
}

function bento_sanitize_svg(string $raw): ?string
{
    $s = trim($raw);
    if (stripos($s, '<svg') === false) {
        return null;
    }
    $s = preg_replace('#<script\b[^>]*>.*?</script>#is', '', $s);
    $s = preg_replace('#<iframe\b[^>]*>.*?</iframe>#is', '', $s);
    $s = preg_replace('#\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)#i', '', $s);
    if (strlen($s) > 100000) {
        $s = substr($s, 0, 100000);
    }
    if (stripos($s, '<svg') === false) {
        return null;
    }

    return $s;
}

function bento_normalize_layout(string $raw): string
{
    $l = strtolower(trim($raw));

    return $l === 'wide' ? 'wide' : 'normal';
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = db()->query(
        'SELECT id, sort_order, title, body, icon_svg, image, layout FROM bento_cards ORDER BY sort_order ASC, id ASC'
    );
    /** @var list<array<string, string|int|null>> $rows */
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_out(['cards' => $rows]);
}

if ($method === 'POST') {
    require_admin();
    $in = read_json();
    $id = isset($in['id']) ? (int) $in['id'] : 0;

    $title = mb_substr(strip_tags(trim((string) ($in['title'] ?? ''))), 0, 300);
    $body = mb_substr(strip_tags(trim((string) ($in['body'] ?? ''))), 0, 20000);
    $svg = bento_sanitize_svg((string) ($in['icon_svg'] ?? ''));
    if ($svg === null || $svg === '') {
        json_out(['error' => 'Вставьте корректную SVG-иконку (целиком тег <svg>…</svg>)'], 422);
    }
    $layout = bento_normalize_layout((string) ($in['layout'] ?? 'normal'));
    $sortOrder = isset($in['sort_order']) ? (int) $in['sort_order'] : 0;
    if ($sortOrder < 0) {
        $sortOrder = 0;
    }
    if ($sortOrder > 9999) {
        $sortOrder = 9999;
    }

    if ($title === '' || $body === '') {
        json_out(['error' => 'Заполните заголовок и текст карточки'], 422);
    }

    $pdo = db();

    if ($id > 0) {
        $sel = $pdo->prepare('SELECT image FROM bento_cards WHERE id = :id');
        $sel->execute([':id' => $id]);
        $prev = $sel->fetch(PDO::FETCH_ASSOC);
        if ($prev === false) {
            json_out(['error' => 'Карточка не найдена'], 404);
        }
        $oldImg = isset($prev['image']) ? (string) $prev['image'] : '';

        $newImg = $oldImg;
        if (array_key_exists('image', $in)) {
            $rawImg = $in['image'];
            if ($rawImg === null || (is_string($rawImg) && trim($rawImg) === '')) {
                $newImg = '';
                if ($oldImg !== '') {
                    bento_delete_file($oldImg);
                }
            } else {
                $norm = bento_normalize_image(is_string($rawImg) ? $rawImg : null);
                if ($norm === null) {
                    json_out(['error' => 'Некорректный путь к изображению'], 422);
                }
                if ($norm !== $oldImg && $oldImg !== '') {
                    bento_delete_file($oldImg);
                }
                $newImg = $norm;
            }
        }

        $stmt = $pdo->prepare(
            'UPDATE bento_cards SET sort_order = :ord, title = :title, body = :body, icon_svg = :svg, image = :img, layout = :layout WHERE id = :id'
        );
        $imgParam = $newImg === '' ? null : $newImg;
        $stmt->execute([
            ':ord' => $sortOrder,
            ':title' => $title,
            ':body' => $body,
            ':svg' => $svg,
            ':img' => $imgParam,
            ':layout' => $layout,
            ':id' => $id,
        ]);
        json_out(['ok' => true, 'id' => $id]);
    }

    $imagePath = null;
    if (isset($in['image']) && trim((string) $in['image']) !== '') {
        $imagePath = bento_normalize_image((string) $in['image']);
        if ($imagePath === null) {
            json_out(['error' => 'Некорректное изображение'], 422);
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO bento_cards (sort_order, title, body, icon_svg, image, layout) VALUES (:ord, :title, :body, :svg, :img, :layout)'
    );
    $stmt->execute([
        ':ord' => $sortOrder,
        ':title' => $title,
        ':body' => $body,
        ':svg' => $svg,
        ':img' => $imagePath,
        ':layout' => $layout,
    ]);
    json_out(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);
}

if ($method === 'DELETE') {
    require_admin();
    $delId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($delId < 1) {
        json_out(['error' => 'Некорректный id'], 422);
    }
    $sel = db()->prepare('SELECT image FROM bento_cards WHERE id = :id');
    $sel->execute([':id' => $delId]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    if ($row === false) {
        json_out(['error' => 'Не найдено'], 404);
    }
    $img = isset($row['image']) ? (string) $row['image'] : '';
    if ($img !== '') {
        bento_delete_file($img);
    }
    $stmt = db()->prepare('DELETE FROM bento_cards WHERE id = :id');
    $stmt->execute([':id' => $delId]);
    json_out(['ok' => true]);
}

json_out(['error' => 'Метод не поддерживается'], 405);
