<?php

declare(strict_types=1);

if (!function_exists('create_function')) {
    function create_function(string $args, string $code): string
    {
        static $counter = 0;
        $name = '__portal_pear_lambda_' . (++$counter);
        eval('function ' . $name . '(' . $args . ') {' . $code . '}');
        return $name;
    }
}
