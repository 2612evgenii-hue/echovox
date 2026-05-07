<?php
declare(strict_types=1);

/** Собираем случайный вывод (notice/warning от PHP), чтобы в ответе оставался только JSON */
ob_start();

ini_set('display_errors', '0');

$root = dirname(__DIR__);
$sessDir = $root . '/data/sessions';
if (!is_dir($sessDir) && !mkdir($sessDir, 0755, true) && !is_dir($sessDir)) {
    // Fallback to default session path if project dir is not writable
    $sessDir = sys_get_temp_dir();
}
session_save_path($sessDir);

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
        && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https');

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'cookie_secure' => $https,
    'cookie_path' => '/',
]);

header('Content-Type: application/json; charset=utf-8');

/**
 * @param array<string, mixed> $data
 */
function json_out(array $data, int $code = 200): void
{
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** @return array<string, mixed> */
function read_json(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Данные по умолчанию: `api/bento-defaults.json` (деплой с PHP), локально ещё `data/bento-defaults.json`.
 * Генератор: `node scripts/gen-bento-defaults.mjs`.
 *
 * @return array{
 *   placeholderIconSvg: string,
 *   seedCards: list<array{title: string, body: string, layout: string, iconSvg: string, image: string}>
 * }
 */
function echovox_bento_defaults(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $path = __DIR__ . '/bento-defaults.json';
    if (!is_file($path)) {
        $path = dirname(__DIR__) . '/data/bento-defaults.json';
    }
    $raw = is_file($path) ? (string) file_get_contents($path) : '';
    /** @var mixed $j */
    $j = json_decode($raw, true);
    if (
        !is_array($j)
        || !isset($j['placeholderIconSvg'], $j['seedCards'])
        || !is_array($j['seedCards'])
    ) {
        $cache = [
            'placeholderIconSvg' =>
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
            'seedCards' => [],
        ];

        return $cache;
    }

    /** @var array{placeholderIconSvg: string, seedCards: list<array<string, string>>} $j */
    $cache = $j;

    return $cache;
}

/** Заполняет карточки bento тем же контентом, что раньше был захардкожен на лендинге. */
function echovox_seed_bento_if_empty(PDO $pdo): void
{
    $n = (int) $pdo->query('SELECT COUNT(*) FROM bento_cards')->fetchColumn();
    if ($n > 0) {
        return;
    }

    $defs = echovox_bento_defaults();
    /** @var list<array{title: string, body: string, layout: string, iconSvg: string, image: string}> $cards */
    $cards = $defs['seedCards'];
    if ($cards === []) {
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO bento_cards (sort_order, title, body, icon_svg, image, layout) VALUES (:ord, :title, :body, :svg, :img, :layout)'
    );

    foreach ($cards as $i => $c) {
        $stmt->execute([
            ':ord' => $i,
            ':title' => $c['title'],
            ':body' => $c['body'],
            ':svg' => $c['iconSvg'],
            ':img' => $c['image'],
            ':layout' => $c['layout'],
        ]);
    }
}

/** Обновляет строки из первого сида (круг + без картинки) до актуальных иконок Lucide и `/bento-default/im*.jpeg`. */
function echovox_migrate_bento_placeholder_icons(PDO $pdo): void
{
    $defs = echovox_bento_defaults();
    $placeholder = $defs['placeholderIconSvg'];
    /** @var list<array{title: string, body: string, layout: string, iconSvg: string, image: string}> $cards */
    $cards = $defs['seedCards'];
    if ($cards === []) {
        return;
    }

    $stmt = $pdo->query(
        'SELECT id, sort_order, icon_svg, image FROM bento_cards ORDER BY sort_order ASC, id ASC'
    );
    /** @var list<array{id: string|int, sort_order: string|int, icon_svg: string, image: string|null}> $rows */
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $upd = $pdo->prepare(
        'UPDATE bento_cards SET icon_svg = :svg, image = :img WHERE id = :id'
    );

    foreach ($rows as $row) {
        if (trim((string) $row['icon_svg']) !== $placeholder) {
            continue;
        }
        $img = $row['image'];
        if ($img !== null && trim((string) $img) !== '') {
            continue;
        }
        $ord = (int) $row['sort_order'];
        if ($ord < 0 || $ord >= count($cards)) {
            continue;
        }
        $c = $cards[$ord];
        $upd->execute([
            ':svg' => $c['iconSvg'],
            ':img' => $c['image'],
            ':id' => $row['id'],
        ]);
    }
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dir = dirname(__DIR__) . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_out(['error' => 'Не удалось создать каталог данных'], 500);
    }

    $path = $dir . '/echovox.sqlite';
    $pdo = new PDO('sqlite:' . $path, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            image TEXT
        )'
    );

    $cols = $pdo->query('PRAGMA table_info(news)')->fetchAll(PDO::FETCH_ASSOC);
    $hasImage = false;
    foreach ($cols as $col) {
        if (($col['name'] ?? '') === 'image') {
            $hasImage = true;
            break;
        }
    }
    if (!$hasImage) {
        $pdo->exec('ALTER TABLE news ADD COLUMN image TEXT');
    }
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS bento_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            icon_svg TEXT NOT NULL,
            image TEXT,
            layout TEXT NOT NULL DEFAULT \'normal\'
        )'
    );

    echovox_seed_bento_if_empty($pdo);
    echovox_migrate_bento_placeholder_icons($pdo);

    return $pdo;
}

function is_admin(): bool
{
    return !empty($_SESSION['admin']) && $_SESSION['admin'] === true;
}

function require_admin(): void
{
    if (!is_admin()) {
        json_out(['error' => 'Требуется вход'], 401);
    }
}
