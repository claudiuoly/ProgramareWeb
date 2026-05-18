<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/auth.php';

portal_logout($GLOBALS['PORTAL_CONFIG']);
header('Location: ' . portal_url('/index.php'));
exit;
