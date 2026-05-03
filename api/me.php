<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_out(['error' => 'Только GET'], 405);
}

json_out(['ok' => is_admin()]);
