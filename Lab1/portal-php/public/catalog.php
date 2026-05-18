<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout.php';

portal_require_role('admin');

$u = portal_session_user();
portal_layout_head('Materiale șantier', ['user' => $u]);
?>
<div class="card">
    <h1>Materiale (admin)</h1>
    <table class="files">
        <thead><tr><th>Articol</th><th>Cod</th></tr></thead>
        <tbody>
            <tr><td>Ciment</td><td>MAT-CIM-001</td></tr>
        </tbody>
    </table>
</div>
<?php
portal_layout_foot();
