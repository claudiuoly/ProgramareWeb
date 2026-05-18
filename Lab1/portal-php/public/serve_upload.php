<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/db_pdo_mysql.php';

portal_require_login();

$u = portal_session_user();
$config = $GLOBALS['PORTAL_CONFIG'];
$uploadReal = realpath((string) ($config['upload_dir'] ?? ''));

if ($uploadReal === false || !is_dir($uploadReal)) {
    http_response_code(500);
    exit('Upload directory unavailable.');
}

if (portal_security_lab_vulnerable()) {
    $rel = (string) ($_GET['path'] ?? '');
    $candidate = $uploadReal . DIRECTORY_SEPARATOR . $rel;
    if (!is_file($candidate) || !is_readable($candidate)) {
        http_response_code(404);
        exit('Not found.');
    }
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($candidate) . '"');
    readfile($candidate);
    exit;
}

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    exit('Bad request.');
}

$pdo = portal_pdo_mysql();
$stmt = $pdo->prepare(
    'SELECT stored_name, original_name, mime FROM uploads WHERE id = :id AND user_id = :uid LIMIT 1'
);
$stmt->execute([':id' => $id, ':uid' => $u['user_id']]);
$row = $stmt->fetch();
if (!$row) {
    http_response_code(404);
    exit('Not found.');
}

$storedBase = basename((string) $row['stored_name']);
$fileReal = realpath($uploadReal . DIRECTORY_SEPARATOR . $storedBase);

if (
    $fileReal === false
    || !is_file($fileReal)
    || !str_starts_with($fileReal, $uploadReal . DIRECTORY_SEPARATOR)
) {
    http_response_code(403);
    exit('Forbidden.');
}

$m = (string) ($row['mime'] ?? 'application/octet-stream');
header('Content-Type: ' . $m);
$dl = basename((string) $row['original_name']);
header('Content-Disposition: attachment; filename="' . str_replace(['"', "\r", "\n"], '', $dl) . '"');
readfile($fileReal);