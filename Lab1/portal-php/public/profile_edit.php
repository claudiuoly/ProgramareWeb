<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/db_mysqli.php';
require_once dirname(__DIR__) . '/includes/db_pdo_mysql.php';
require_once dirname(__DIR__) . '/includes/layout.php';

portal_require_login();

$u = portal_session_user();
$departments = [
    'general' => 'General',
    'civil' => 'Civil',
    'structures' => 'Structures',
];

$mysqli = portal_mysqli_connect();
$q = $mysqli->prepare(
    'SELECT u.username, u.email, u.full_name, u.department, u.bio, r.name AS role_name
     FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1'
);
$uid = $u['user_id'];
$q->bind_param('i', $uid);
$q->execute();
$row = $q->get_result()->fetch_assoc();
$q->close();
$mysqli->close();

if (!$row) {
    http_response_code(500);
    exit('User not found.');
}

$message = null;
$messageType = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string) ($_POST['email'] ?? ''));
    $fullName = trim((string) ($_POST['full_name'] ?? ''));
    $department = (string) ($_POST['department'] ?? 'general');
    $bio = (string) ($_POST['bio'] ?? '');

    if (!isset($departments[$department])) {
        $department = 'general';
    }

    $pdo = portal_pdo_mysql();
    $stmt = $pdo->prepare(
        'UPDATE users SET email = :e, full_name = :f, department = :d, bio = :b WHERE id = :id'
    );
    $stmt->execute([
        ':e' => $email,
        ':f' => $fullName,
        ':d' => $department,
        ':b' => $bio,
        ':id' => $u['user_id'],
    ]);

    $message = 'Profile updated.';
    $messageType = 'ok';

    $row['email'] = $email;
    $row['full_name'] = $fullName;
    $row['department'] = $department;
    $row['bio'] = $bio;
}

portal_layout_head('Profile', ['user' => $u]);
if ($message) {
    $cls = $messageType === 'ok' ? 'msg-ok' : 'msg-err';
    echo '<div class="msg ' . $cls . '">' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</div>';
}
?>
<div class="card">
    <h1>Profile</h1>
    <form method="post" action="/profile_edit.php">
        <div class="form-row">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required maxlength="255"
                value="<?= htmlspecialchars((string) $row['email'], ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="form-row">
            <label for="full_name">Full name</label>
            <input type="text" id="full_name" name="full_name" required maxlength="255"
                value="<?= htmlspecialchars((string) $row['full_name'], ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="form-row">
            <label for="department">Department</label>
            <select id="department" name="department">
                <?php foreach ($departments as $k => $label): ?>
                    <option value="<?= htmlspecialchars($k, ENT_QUOTES, 'UTF-8') ?>"<?= ((string) $row['department'] === $k) ? ' selected' : '' ?>><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="form-row">
            <label for="bio">Bio</label>
            <textarea id="bio" name="bio" maxlength="4000"><?= htmlspecialchars((string) ($row['bio'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <button class="btn" type="submit">Save</button>
    </form>
</div>
<?php
portal_layout_foot();
