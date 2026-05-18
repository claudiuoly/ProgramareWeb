<?php

declare(strict_types=1);

function portal_security_lab_vulnerable(): bool
{
    $c = $GLOBALS['PORTAL_CONFIG'] ?? [];
    return (($c['security_lab_vulnerable'] ?? false) === true);
}

function portal_csrf_token(): string
{
    if (!empty($_SESSION['portal_csrf']) && is_string($_SESSION['portal_csrf'])) {
        return $_SESSION['portal_csrf'];
    }
    $_SESSION['portal_csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['portal_csrf'];
}

function portal_csrf_verify(): bool
{
    $sent = $_POST['csrf_token'] ?? '';
    if (!is_string($sent) || $sent === '') {
        return false;
    }
    $stored = $_SESSION['portal_csrf'] ?? '';
    return is_string($stored) && $stored !== '' && hash_equals($stored, $sent);
}

function portal_csrf_abort_if_invalid(): void
{
    if (portal_security_lab_vulnerable()) {
        return;
    }
    if (!portal_csrf_verify()) {
        http_response_code(403);
        exit('CSRF verification failed.');
    }
}

function portal_csrf_field(): string
{
    if (portal_security_lab_vulnerable()) {
        return '';
    }
    $t = htmlspecialchars(portal_csrf_token(), ENT_QUOTES, 'UTF-8');

    return '<input type="hidden" name="csrf_token" value="' . $t . '">';
}
