<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['error' => 'Только POST'], 405);
}

$_SESSION = [];
session_destroy();
json_out(['ok' => true]);
