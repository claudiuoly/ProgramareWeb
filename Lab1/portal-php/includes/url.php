<?php

declare(strict_types=1);

function portal_base_path(): string
{
    static $memo = null;
    if ($memo !== null) {
        return $memo;
    }
    $c = $GLOBALS['PORTAL_CONFIG'] ?? [];
    if (!empty($c['base_path']) && is_string($c['base_path'])) {
        $p = str_replace('\\', '/', $c['base_path']);
        return $memo = rtrim($p, '/') === '' ? '' : rtrim($p, '/');
    }
    $script = (string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php');
    $dir = str_replace('\\', '/', dirname($script));
    if ($dir === '/' || $dir === '.' || $dir === '') {
        return $memo = '';
    }
    return $memo = rtrim($dir, '/');
}

function portal_cookie_path(): string
{
    $b = portal_base_path();
    if ($b === '') {
        return '/';
    }
    return $b . '/';
}

function portal_url(string $path): string
{
    $path = $path !== '' && $path[0] !== '/' ? '/' . $path : $path;
    $base = portal_base_path();
    if ($base === '') {
        return $path;
    }
    return $base . $path;
}
