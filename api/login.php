<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['error' => 'Только POST'], 405);
}

$in = read_json();
$pass = trim((string) ($in['password'] ?? ''));
/** @var array{admin_password_sha256: string} $config */
$config = require __DIR__ . '/config.php';
$stored = $config['admin_password_sha256'];
$hash = hash('sha256', $pass);

if (strlen($stored) !== strlen($hash) || !hash_equals($stored, $hash)) {
    json_out(['error' => 'Неверный пароль'], 401);
}

$_SESSION['admin'] = true;
if (function_exists('session_regenerate_id')) {
    @session_regenerate_id(true);
}
json_out(['ok' => true]);
