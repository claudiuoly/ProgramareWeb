<?php

declare(strict_types=1);

function portal_pdo_mysql(): PDO
{
    $c = $GLOBALS['PORTAL_CONFIG'];
    $host = (string) $c['mysql_host'];
    $port = (int) $c['mysql_port'];
    $name = (string) $c['mysql_name'];
    $user = (string) $c['mysql_user'];
    $pass = (string) $c['mysql_pass'];
    $charset = (string) ($c['mysql_charset'] ?? 'utf8mb4');

    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $name, $charset);
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}
