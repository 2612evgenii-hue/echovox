<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['error' => 'Только POST'], 405);
}

require_admin();

if (empty($_FILES['image']) || !is_array($_FILES['image'])) {
    json_out(['error' => 'Файл не получен'], 422);
}

$f = $_FILES['image'];
if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_out(['error' => 'Ошибка загрузки'], 422);
}

if (($f['size'] ?? 0) > 2_500_000) {
    json_out(['error' => 'Файл больше 2.5 МБ'], 422);
}

$tmp = (string) ($f['tmp_name'] ?? '');
if ($tmp === '' || !is_uploaded_file($tmp)) {
    json_out(['error' => 'Некорректная загрузка'], 422);
}

$blob = file_get_contents($tmp);
if ($blob === false || $blob === '') {
    json_out(['error' => 'Пустой файл'], 422);
}

if (!function_exists('imagecreatefromstring')) {
    json_out(['error' => 'GD не доступен на сервере'], 500);
}

$src = @imagecreatefromstring($blob);
if ($src === false) {
    json_out(['error' => 'Нужен JPEG, PNG или WebP'], 422);
}

$w = imagesx($src);
$h = imagesy($src);
if ($w < 1 || $h < 1) {
    imagedestroy($src);
    json_out(['error' => 'Некорректное изображение'], 422);
}

$maxW = 1120;
$dstW = $w;
$dstH = $h;
if ($w > $maxW) {
    $dstW = $maxW;
    $dstH = (int) round($h * ($maxW / $w));
}

$dst = imagecreatetruecolor($dstW, $dstH);
if ($dst === false) {
    imagedestroy($src);
    json_out(['error' => 'Не удалось обработать'], 500);
}

imagealphablending($dst, false);
imagesavealpha($dst, true);
$trans = imagecolorallocatealpha($dst, 0, 0, 0, 127);
imagefilledrectangle($dst, 0, 0, $dstW, $dstH, $trans);
imagealphablending($dst, true);

imagecopyresampled($dst, $src, 0, 0, 0, 0, $dstW, $dstH, $w, $h);
imagedestroy($src);

$dir = dirname(__DIR__) . '/uploads/bento';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
    imagedestroy($dst);
    json_out(['error' => 'Не удалось создать каталог uploads'], 500);
}

$name = bin2hex(random_bytes(10)) . '.webp';
$full = $dir . '/' . $name;

$ok = false;
if (function_exists('imagewebp')) {
    $ok = imagewebp($dst, $full, 82);
}
if (!$ok) {
    $name = bin2hex(random_bytes(10)) . '.jpg';
    $full = $dir . '/' . $name;
    imagealphablending($dst, true);
    $ok = imagejpeg($dst, $full, 86);
}
imagedestroy($dst);

if (!$ok) {
    json_out(['error' => 'Не удалось сохранить изображение'], 500);
}

$webPath = '/uploads/bento/' . $name;
json_out(['ok' => true, 'path' => $webPath]);
