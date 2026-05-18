<?php

declare(strict_types=1);

function portal_pear_php_dirs_for_include(): array
{
    $dirs = [];

    if (function_exists('shell_exec')) {
        $disabled = (string) ini_get('disable_functions');
        if ($disabled === '' || stripos($disabled, 'shell_exec') === false) {
            $out = shell_exec('pear config-get php_dir 2>/dev/null');
            $d = trim((string) $out);
            if ($d !== '' && is_dir($d)) {
                $dirs[] = $d;
            }
        }
    }

    $home = getenv('HOME');
    if (is_string($home) && $home !== '') {
        $dirs[] = $home . '/pear/pear/php';
        $dirs[] = $home . '/pear/share/pear';
    }

    $dirs = array_merge($dirs, [
        '/opt/homebrew/share/pear',
        '/usr/local/share/pear',
        '/opt/homebrew/share/pear/php',
        '/usr/local/share/pear/php',
        '/opt/homebrew/share/php/pear',
        '/usr/share/php',
        '/usr/local/lib/php',
    ]);

    return array_values(array_unique(array_filter($dirs, 'is_dir')));
}

function portal_prepend_pear_to_include_path(): void
{
    $prefix = '';
    foreach (portal_pear_php_dirs_for_include() as $dir) {
        $prefix .= $dir . PATH_SEPARATOR;
    }
    if ($prefix !== '') {
        set_include_path($prefix . get_include_path());
    }
}

function portal_captcha_render_builtin_fallback(): array
{
    $a = random_int(1, 19);
    $b = random_int(1, 19);
    $sum = $a + $b;
    $_SESSION['portal_captcha_answer'] = (string) $sum;
    $q = "{$a} + {$b}";
    $html = '<p>' . htmlspecialchars($q, ENT_QUOTES, 'UTF-8')
        . ' = <abbr title="Rezultat">?</abbr></p>'
        . '<p class="hint">Scrie răspunsul (număr întreg).</p>';

    return ['ok' => true, 'html' => $html, 'error' => null];
}

function portal_captcha_render(): array
{
    portal_prepend_pear_to_include_path();

    $loaded = false;
    foreach (portal_pear_php_dirs_for_include() as $dir) {
        $file = rtrim($dir, DIRECTORY_SEPARATOR) . '/Text/CAPTCHA.php';
        if (is_file($file)) {
            require_once $file;
            $loaded = true;
            break;
        }
    }

    if (!$loaded) {
        @include_once 'Text/CAPTCHA.php';
    }

    if (!class_exists('Text_CAPTCHA', false)) {
        return portal_captcha_render_builtin_fallback();
    }

    try {
        $captcha = Text_CAPTCHA::factory('Equation');
        if (method_exists($captcha, 'init')) {
            $captcha->init();
        }

        $answer = null;
        if (method_exists($captcha, 'getAnswer')) {
            $answer = (string) $captcha->getAnswer();
        } elseif (method_exists($captcha, 'getPhrase')) {
            $answer = (string) $captcha->getPhrase();
        }

        if ($answer === null || $answer === '') {
            return [
                'ok' => false,
                'html' => '',
                'error' => 'CAPTCHA driver did not return an answer.',
            ];
        }

        $_SESSION['portal_captcha_answer'] = $answer;

        $html = '';
        if (method_exists($captcha, 'getCAPTCHAAsHTML')) {
            $html = (string) $captcha->getCAPTCHAAsHTML();
        } elseif (method_exists($captcha, 'getCAPTCHA')) {
            $html = (string) $captcha->getCAPTCHA();
        } else {
            $html = '<p>' . htmlspecialchars($captcha->getPhrase(), ENT_QUOTES, 'UTF-8') . '</p>';
        }

        return ['ok' => true, 'html' => $html, 'error' => null];
    } catch (Throwable $e) {
        return ['ok' => false, 'html' => '', 'error' => 'CAPTCHA error: ' . $e->getMessage()];
    }
}

function portal_captcha_verify(string $userInput): bool
{
    $expected = $_SESSION['portal_captcha_answer'] ?? null;
    unset($_SESSION['portal_captcha_answer']);
    if ($expected === null || $expected === '') {
        return false;
    }
    $a = trim(preg_replace('/\s+/', '', $userInput));
    $b = trim(preg_replace('/\s+/', '', (string) $expected));
    return $a !== '' && strcasecmp((string) $a, (string) $b) === 0;
}
