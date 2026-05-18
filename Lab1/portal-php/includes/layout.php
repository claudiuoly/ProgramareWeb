<?php

declare(strict_types=1);

function portal_layout_head(string $title, array $opts = []): void
{
    $u = $opts['user'] ?? portal_session_user();
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <header class="top">
        <nav>
            <?php if ($u): ?>
                <span class="who"><?= htmlspecialchars($u['username'], ENT_QUOTES, 'UTF-8') ?> · <?= htmlspecialchars($u['role_name'], ENT_QUOTES, 'UTF-8') ?></span>
                <a href="/profile_edit.php">Profile</a>
                <a href="/uploads.php">Files</a>
                <?php if (strcasecmp($u['role_name'], 'admin') === 0): ?>
                    <a href="/catalog.php">Materiale</a>
                <?php endif; ?>
                <a href="/logout.php">Logout</a>
            <?php else: ?>
                <a href="/login.php">Login</a>
            <?php endif; ?>
        </nav>
    </header>
    <main class="wrap">
<?php
}

function portal_layout_foot(): void
{
    ?>
    </main>
</body>
</html>
<?php
}
