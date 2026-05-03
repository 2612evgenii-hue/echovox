<?php
declare(strict_types=1);

ini_set('display_errors', '0');

$root = dirname(__DIR__);
$sessDir = $root . '/data/sessions';
if (!is_dir($sessDir) && !mkdir($sessDir, 0755, true) && !is_dir($sessDir)) {
    // Fallback to default session path if project dir is not writable
    $sessDir = sys_get_temp_dir();
}
session_save_path($sessDir);

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'cookie_secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'cookie_path' => '/',
]);

header('Content-Type: application/json; charset=utf-8');

/**
 * @param array<string, mixed> $data
 */
function json_out(array $data, int $code = 200): void
{
    http_response_code($code);
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
