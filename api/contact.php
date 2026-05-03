<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['error' => 'Только POST'], 405);
}

$in = read_json();
$name = trim((string) ($in['name'] ?? ''));
$phone = trim((string) ($in['phone'] ?? ''));
$message = trim((string) ($in['message'] ?? ''));

$phoneRe =
    '/^(\\+7|7|8)?[\\s\\-]?\\(?[489][0-9]{2}\\)?[\\s\\-]?[0-9]{3}[\\s\\-]?[0-9]{2}[\\s\\-]?[0-9]{2}$/';

if ($name === '' || $message === '' || !preg_match($phoneRe, $phone)) {
    json_out(['error' => 'Проверьте имя, телефон и сообщение'], 422);
}

$name = mb_substr(strip_tags($name), 0, 120);
$message = mb_substr(strip_tags($message), 0, 4000);

$stmt = db()->prepare(
    'INSERT INTO contacts (name, phone, message, created_at) VALUES (:n, :p, :m, :c)'
);
$stmt->execute([
    ':n' => $name,
    ':p' => $phone,
    ':m' => $message,
    ':c' => gmdate('c'),
]);

json_out(['ok' => true]);
