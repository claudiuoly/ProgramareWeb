<?php

declare(strict_types=1);

function portal_sqlite_bootstrap(array $config): void
{
    $path = (string) ($config['sqlite_path'] ?? '');
    if ($path === '') {
        return;
    }
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    if (!is_dir($dir) || !is_writable($dir)) {
        return;
    }
    try {
        $pdo = portal_pdo_sqlite($config);
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                attempted_at TEXT NOT NULL,
                username TEXT NOT NULL,
                success INTEGER NOT NULL,
                ip TEXT
            )'
        );
    } catch (Throwable $e) {
        error_log('SQLite bootstrap: ' . $e->getMessage());
    }
}

function portal_pdo_sqlite(array $config): PDO
{
    $path = (string) ($config['sqlite_path'] ?? '');
    $dsn = 'sqlite:' . $path;
    return new PDO($dsn, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function portal_sqlite_log_login_attempt(array $config, string $username, bool $success): void
{
    try {
        $pdo = portal_pdo_sqlite($config);
        $stmt = $pdo->prepare(
            'INSERT INTO login_attempts (attempted_at, username, success, ip) VALUES (:t, :u, :s, :ip)'
        );
        $stmt->execute([
            ':t' => gmdate('c'),
            ':u' => $username,
            ':s' => $success ? 1 : 0,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]);
    } catch (Throwable $e) {
        error_log('SQLite log: ' . $e->getMessage());
    }
}
