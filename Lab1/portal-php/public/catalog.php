<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/db_mysqli.php';
require_once dirname(__DIR__) . '/includes/layout.php';

portal_require_role('admin');

$u = portal_session_user();
$rawQ = isset($_GET['q']) && is_string($_GET['q']) ? $_GET['q'] : '';
$searchQuery = trim($rawQ);
$searchRows = [];
$searchError = null;

$runSearch = portal_security_lab_vulnerable() ? ($rawQ !== '') : ($searchQuery !== '');

if ($runSearch) {
    try {
        $mysqli = portal_mysqli_connect();
        if (portal_security_lab_vulnerable()) {
            $q = $rawQ;
            $sql = "SELECT username, email, full_name FROM users WHERE username LIKE '%{$q}%' OR email LIKE '%{$q}%' LIMIT 50";
            $res = $mysqli->query($sql);
            if ($res === false) {
                throw new RuntimeException((string) $mysqli->error);
            }
            while ($row = $res->fetch_assoc()) {
                $searchRows[] = $row;
            }
            $res->free();
        } else {
            $stmt = $mysqli->prepare(
                'SELECT username, email, full_name FROM users WHERE username LIKE ? OR email LIKE ? LIMIT 50'
            );
            if ($stmt === false) {
                throw new RuntimeException('prepare failed');
            }
            $like = '%' . $searchQuery . '%';
            $stmt->bind_param('ss', $like, $like);
            $stmt->execute();
            $sr = $stmt->get_result();
            while ($row = $sr->fetch_assoc()) {
                $searchRows[] = $row;
            }
            $stmt->close();
        }
        $mysqli->close();
    } catch (Throwable $e) {
        if (portal_security_lab_vulnerable()) {
            $searchError = 'SQL error (lab diagnostic): ' . $e->getMessage();
        } else {
            $searchError = 'Search failed.';
        }
    }
}

portal_layout_head('Materiale șantier', ['user' => $u]);

if (portal_security_lab_vulnerable() && isset($_GET['ref'])) {
    $refl = $_GET['ref'];
    echo '<div class="card lab-banner"><div class="msg msg-err">Reflected (lab XSS): ';
    echo is_string($refl) ? $refl : '';
    echo '</div></div>';
}

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

<div class="card">
    <h2>Căutare utilizatori (admin)</h2>
    <?php if (portal_security_lab_vulnerable()): ?>
        <p class="hint">Lab: căutarea folosește SQL dinamic fără prepared statements dacă este activat în config.</p>
    <?php endif; ?>
    <form method="get" action="<?= htmlspecialchars(portal_url('/catalog.php'), ENT_QUOTES, 'UTF-8') ?>">
        <div class="form-row">
            <label for="q">Query</label>
            <input type="text" id="q" name="q" value="<?= htmlspecialchars($rawQ, ENT_QUOTES, 'UTF-8') ?>" maxlength="2000">
        </div>
        <button class="btn" type="submit">Search</button>
    </form>
    <?php if ($searchError): ?>
        <div class="msg msg-err"><?= htmlspecialchars($searchError, ENT_QUOTES, 'UTF-8') ?></div>
    <?php elseif ($runSearch && $searchRows !== []): ?>
        <table class="files" style="margin-top:12px;">
            <thead><tr><th>Username</th><th>Email</th><th>Full name</th></tr></thead>
            <tbody>
            <?php foreach ($searchRows as $sr): ?>
                <tr>
                    <td><?= htmlspecialchars((string) $sr['username'], ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= htmlspecialchars((string) $sr['email'], ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= htmlspecialchars((string) $sr['full_name'], ENT_QUOTES, 'UTF-8') ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php elseif ($runSearch): ?>
        <p class="hint">No rows.</p>
    <?php endif; ?>
</div>
<?php
portal_layout_foot();
