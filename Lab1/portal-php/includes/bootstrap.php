<?php

declare(strict_types=1);

$configPath = dirname(__DIR__) . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    exit('Missing config.php. Copy config.example.php to config.php.');
}

$GLOBALS['PORTAL_CONFIG'] = require $configPath;
$config = $GLOBALS['PORTAL_CONFIG'];

require_once __DIR__ . '/php_legacy_compat.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('portal_sid');
    session_start();
}

require_once __DIR__ . '/db_pdo_sqlite.php';
portal_sqlite_bootstrap($config);

require_once __DIR__ . '/auth.php';
if (empty($_SESSION['user_id'])) {
    portal_try_remember_me($config);
}
