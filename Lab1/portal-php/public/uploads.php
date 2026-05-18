<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/db_pdo_mysql.php';
require_once dirname(__DIR__) . '/includes/layout.php';

portal_require_login();

$u = portal_session_user();
$config = $GLOBALS['PORTAL_CONFIG'];
$baseDir = (string) ($config['upload_dir'] ?? '');
$maxBytes = (int) ($config['upload_max_bytes'] ?? 1048576);
$allowed = (array) ($config['allowed_mime_extensions'] ?? []);

$message = null;
$messageErr = false;

if ($baseDir === '') {
    http_response_code(500);
    exit('upload_dir is not configured.');
}

if (!is_dir($baseDir)) {
    @mkdir($baseDir, 0700, true);
}
if (!is_dir($baseDir) || !is_writable($baseDir)) {
    http_response_code(500);
    exit('Upload directory is not writable.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_upload_id'])) {
    $id = (int) $_POST['delete_upload_id'];
    $pdo = portal_pdo_mysql();
    $stmt = $pdo->prepare('SELECT id, stored_name FROM uploads WHERE id = :id AND user_id = :uid LIMIT 1');
    $stmt->execute([':id' => $id, ':uid' => $u['user_id']]);
    $rec = $stmt->fetch();
    if ($rec) {
        $path = $baseDir . DIRECTORY_SEPARATOR . basename((string) $rec['stored_name']);
        if (is_file($path)) {
            @unlink($path);
        }
        $del = $pdo->prepare('DELETE FROM uploads WHERE id = :id AND user_id = :uid');
        $del->execute([':id' => $id, ':uid' => $u['user_id']]);
        $message = 'Removed.';
    } else {
        $messageErr = true;
        $message = 'Cannot delete.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['file']['name']) && empty($_POST['delete_upload_id'])) {
    $err = (int) ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($err !== UPLOAD_ERR_OK) {
        $messageErr = true;
        $message = 'Upload failed.';
    } else {
        $tmp = (string) $_FILES['file']['tmp_name'];
        $orig = (string) $_FILES['file']['name'];
        $size = (int) ($_FILES['file']['size'] ?? 0);
        if ($size > $maxBytes) {
            $messageErr = true;
            $message = 'File too large.';
        } else {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($tmp) ?: 'application/octet-stream';
            $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
            $okMime = false;
            if (isset($allowed[$mime])) {
                foreach ($allowed[$mime] as $allowedExt) {
                    if (strcasecmp($allowedExt, $ext) === 0) {
                        $okMime = true;
                        break;
                    }
                }
            }
            if (!$okMime) {
                $messageErr = true;
                $message = 'Type not allowed.';
            } else {
                $safeExt = preg_replace('/[^a-zA-Z0-9]/', '', $ext);
                if ($safeExt === '') {
                    $safeExt = 'bin';
                }
                $stored = bin2hex(random_bytes(16)) . '.' . $safeExt;
                $dest = $baseDir . DIRECTORY_SEPARATOR . $stored;
                if (!move_uploaded_file($tmp, $dest)) {
                    $messageErr = true;
                    $message = 'Save failed.';
                } else {
                    chmod($dest, 0600);
                    $pdo = portal_pdo_mysql();
                    $ins = $pdo->prepare(
                        'INSERT INTO uploads (user_id, stored_name, original_name, mime, size)
                         VALUES (:uid, :sn, :on, :m, :sz)'
                    );
                    $ins->execute([
                        ':uid' => $u['user_id'],
                        ':sn' => $stored,
                        ':on' => $orig,
                        ':m' => $mime,
                        ':sz' => $size,
                    ]);
                    $message = 'Uploaded.';
                }
            }
        }
    }
}

$pdo = portal_pdo_mysql();
$list = $pdo->prepare('SELECT id, original_name, mime, size, created_at FROM uploads WHERE user_id = :uid ORDER BY id DESC');
$list->execute([':uid' => $u['user_id']]);
$files = $list->fetchAll();

portal_layout_head('Files', ['user' => $u]);
if ($message) {
    $cls = $messageErr ? 'msg-err' : 'msg-ok';
    echo '<div class="msg ' . $cls . '">' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</div>';
}
?>
<div class="card">
    <h1>Files</h1>
    <form method="post" action="/uploads.php" enctype="multipart/form-data">
        <div class="form-row">
            <label for="file">Upload (PDF, JPG, PNG, TXT, max <?= (int) ($maxBytes / 1024) ?> KB)</label>
            <input type="file" id="file" name="file" required>
        </div>
        <button class="btn" type="submit">Upload</button>
    </form>
    <?php if (count($files) > 0): ?>
        <table class="files" style="margin-top:16px;">
            <thead><tr><th>Name</th><th>Size</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($files as $f): ?>
                <tr>
                    <td><?= htmlspecialchars((string) $f['original_name'], ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= (int) $f['size'] ?></td>
                    <td>
                        <form method="post" action="/uploads.php" class="inl">
                            <input type="hidden" name="delete_upload_id" value="<?= (int) $f['id'] ?>">
                            <button class="btn btn-danger" type="submit">Delete</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>
<?php
portal_layout_foot();
