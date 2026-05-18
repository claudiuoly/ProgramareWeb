<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/captcha_pear.php';
require_once dirname(__DIR__) . '/includes/db_pdo_sqlite.php';
require_once dirname(__DIR__) . '/includes/layout.php';

$config = $GLOBALS['PORTAL_CONFIG'];

if (portal_session_user() !== null) {
    header('Location: ' . portal_url('/profile_edit.php'));
    exit;
}

$safeNext = portal_url('/profile_edit.php');
if (isset($_GET['next']) && is_string($_GET['next'])) {
    $n = $_GET['next'];
    if ($n !== '' && $n[0] === '/' && !str_starts_with($n, '//')) {
        $safeNext = $n;
    }
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['next']) && is_string($_POST['next'])) {
        $pn = $_POST['next'];
        if ($pn !== '' && $pn[0] === '/' && !str_starts_with($pn, '//')) {
            $safeNext = $pn;
        }
    }

    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $captchaUser = (string) ($_POST['captcha_user'] ?? '');
    $remember = !empty($_POST['remember_me']);

    if (!portal_captcha_verify($captchaUser)) {
        $error = 'Incorrect or expired CAPTCHA.';
        portal_sqlite_log_login_attempt($config, $username, false);
        $captchaBlock = portal_captcha_render();
    } else {
        $row = portal_find_user_by_username_mysqli($username);
        if ($row === null || !password_verify($password, $row['password_hash'])) {
            $error = 'Invalid username or password.';
            portal_sqlite_log_login_attempt($config, $username, false);
            $captchaBlock = portal_captcha_render();
        } else {
            portal_sqlite_log_login_attempt($config, $username, true);
            portal_login_success_session($row);
            if ($remember) {
                portal_remember_me_create($config, $row['id']);
            }
            header('Location: ' . $safeNext);
            exit;
        }
    }
} else {
    $captchaBlock = portal_captcha_render();
}

portal_layout_head('Login');
if ($error) {
    echo '<div class="msg msg-err">' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</div>';
}
if (!empty($captchaBlock['error'])) {
    echo '<div class="msg msg-err">' . htmlspecialchars((string) $captchaBlock['error'], ENT_QUOTES, 'UTF-8') . '</div>';
}
?>
<div class="card">
    <h1>Login</h1>
    <form method="post" action="<?= htmlspecialchars(portal_url('/login.php'), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="next" value="<?= htmlspecialchars($safeNext, ENT_QUOTES, 'UTF-8') ?>">
        <div class="form-row">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required autocomplete="username" value="<?= htmlspecialchars((string) ($_POST['username'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="form-row">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
        </div>
        <div class="form-row">
            <label>Verification</label>
            <div class="captcha"><?= $captchaBlock['html'] ?></div>
            <input type="text" name="captcha_user" required autocomplete="off" placeholder="Answer from above">
        </div>
        <div class="form-row check">
            <input type="checkbox" id="remember_me" name="remember_me" value="1">
            <label for="remember_me">Remember me</label>
        </div>
        <button class="btn" type="submit">Sign in</button>
    </form>
    <p class="hint">Test: <code>admin1</code> sau <code>muncitor1</code> · parolă <code>password</code></p>
</div>
<?php
portal_layout_foot();
