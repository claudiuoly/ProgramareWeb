<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/layout.php';

if (portal_session_user() !== null) {
    header('Location: ' . portal_url('/profile_edit.php'));
    exit;
}

portal_layout_head('Home');
?>
<div class="card">
    <p><a href="<?= htmlspecialchars(portal_url('/login.php'), ENT_QUOTES, 'UTF-8') ?>">Login</a></p>
</div>
<?php
portal_layout_foot();
