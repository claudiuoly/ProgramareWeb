<?php

declare(strict_types=1);

function portal_mysqli_connect(): mysqli
{
    $c = $GLOBALS['PORTAL_CONFIG'];
    $host = (string) $c['mysql_host'];
    $port = (int) $c['mysql_port'];
    $db = (string) $c['mysql_name'];
    $user = (string) $c['mysql_user'];
    $pass = (string) $c['mysql_pass'];

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $link = mysqli_init();
    if ($link === false) {
        throw new RuntimeException('mysqli_init failed');
    }
    $link->real_connect($host, $user, $pass, $db, $port);
    $charset = (string) ($c['mysql_charset'] ?? 'utf8mb4');
    $link->set_charset($charset);
    return $link;
}
