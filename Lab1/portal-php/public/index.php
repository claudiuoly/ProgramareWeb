<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/layout.php';

if (portal_session_user() !== null) {
    header('Location: /profile_edit.php');
    exit;
}

portal_layout_head('Home');
?>
<div class="card">
    <p><a href="/login.php">Login</a></p>
</div>
<?php
portal_layout_foot();
