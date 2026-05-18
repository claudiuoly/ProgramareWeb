<?php

declare(strict_types=1);

require_once __DIR__ . '/db_mysqli.php';
require_once __DIR__ . '/db_pdo_mysql.php';

const PORTAL_REMEMBER_COOKIE = 'portal_remember';

function portal_session_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    return [
        'user_id' => (int) $_SESSION['user_id'],
        'username' => (string) $_SESSION['username'],
        'role_name' => (string) $_SESSION['role_name'],
    ];
}

function portal_require_login(string $redirectTo = '/login.php'): void
{
    if (portal_session_user() !== null) {
        return;
    }
    $next = $_SERVER['REQUEST_URI'] ?? '/';
    header('Location: ' . $redirectTo . '?next=' . rawurlencode($next));
    exit;
}

function portal_require_role(string $roleName): void
{
    portal_require_login();
    $u = portal_session_user();
    if ($u === null || strcasecmp($u['role_name'], $roleName) !== 0) {
        http_response_code(403);
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>403</title></head><body><p>Forbidden.</p><p><a href="/profile_edit.php">Profile</a></p></body></html>';
        exit;
    }
}

function portal_find_user_by_username_mysqli(string $username): ?array
{
    $mysqli = portal_mysqli_connect();
    $sql = 'SELECT u.id, u.username, u.password_hash, r.name AS role_name
            FROM users u INNER JOIN roles r ON r.id = u.role_id
            WHERE u.username = ? LIMIT 1';
    $stmt = $mysqli->prepare($sql);
    if ($stmt === false) {
        throw new RuntimeException('prepare failed');
    }
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();
    $mysqli->close();
    if (!$row) {
        return null;
    }
    return [
        'id' => (int) $row['id'],
        'username' => (string) $row['username'],
        'password_hash' => (string) $row['password_hash'],
        'role_name' => (string) $row['role_name'],
    ];
}

function portal_login_success_session(array $userRow): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userRow['id'];
    $_SESSION['username'] = $userRow['username'];
    $_SESSION['role_name'] = $userRow['role_name'];
}

function portal_remember_me_create(array $config, int $userId): void
{
    $ttl = (int) ($config['remember_me_ttl'] ?? 2592000);
    $selector = bin2hex(random_bytes(16));
    $validator = bin2hex(random_bytes(32));
    $hashed = password_hash($validator, PASSWORD_DEFAULT);
    $expires = (new DateTimeImmutable())->add(new DateInterval('PT' . $ttl . 'S'))->format('Y-m-d H:i:s');

    $pdo = portal_pdo_mysql();
    $stmt = $pdo->prepare(
        'INSERT INTO remember_tokens (user_id, selector, hashed_validator, expires_at) VALUES (:uid, :sel, :hv, :ex)'
    );
    $stmt->execute([
        ':uid' => $userId,
        ':sel' => $selector,
        ':hv' => $hashed,
        ':ex' => $expires,
    ]);

    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $payload = $selector . ':' . $validator;
    setcookie(
        PORTAL_REMEMBER_COOKIE,
        $payload,
        [
            'expires' => time() + $ttl,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]
    );
}

function portal_remember_me_clear_cookie(): void
{
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie(
        PORTAL_REMEMBER_COOKIE,
        '',
        [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]
    );
}

function portal_try_remember_me(array $config): void
{
    if (!empty($_SESSION['user_id'])) {
        return;
    }
    $raw = $_COOKIE[PORTAL_REMEMBER_COOKIE] ?? '';
    if ($raw === '' || !str_contains($raw, ':')) {
        return;
    }
    [$selector, $validator] = explode(':', $raw, 2);
    if ($selector === '' || $validator === '') {
        return;
    }

    $pdo = portal_pdo_mysql();
    $stmt = $pdo->prepare(
        'SELECT id, user_id, hashed_validator, expires_at FROM remember_tokens WHERE selector = :s LIMIT 1'
    );
    $stmt->execute([':s' => $selector]);
    $token = $stmt->fetch();
    if (!$token) {
        portal_remember_me_clear_cookie();
        return;
    }
    $expires = strtotime((string) $token['expires_at']);
    if ($expires !== false && $expires < time()) {
        $del = $pdo->prepare('DELETE FROM remember_tokens WHERE id = :id');
        $del->execute([':id' => $token['id']]);
        portal_remember_me_clear_cookie();
        return;
    }
    if (!password_verify($validator, (string) $token['hashed_validator'])) {
        portal_remember_me_clear_cookie();
        return;
    }

    $userId = (int) $token['user_id'];
    $mysqli = portal_mysqli_connect();
    $q = $mysqli->prepare(
        'SELECT u.id, u.username, r.name AS role_name FROM users u
         INNER JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1'
    );
    $q->bind_param('i', $userId);
    $q->execute();
    $row = $q->get_result()->fetch_assoc();
    $q->close();
    $mysqli->close();
    if (!$row) {
        portal_remember_me_clear_cookie();
        return;
    }

    portal_login_success_session([
        'id' => (int) $row['id'],
        'username' => (string) $row['username'],
        'password_hash' => '',
        'role_name' => (string) $row['role_name'],
    ]);

    $del = $pdo->prepare('DELETE FROM remember_tokens WHERE id = :id');
    $del->execute([':id' => $token['id']]);
    portal_remember_me_create($config, $userId);
}

function portal_logout(array $config): void
{
    $u = portal_session_user();
    if ($u !== null) {
        $pdo = portal_pdo_mysql();
        $stmt = $pdo->prepare('DELETE FROM remember_tokens WHERE user_id = :uid');
        $stmt->execute([':uid' => $u['user_id']]);
    }
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    session_destroy();
    portal_remember_me_clear_cookie();
}
