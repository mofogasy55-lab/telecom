<?php

declare(strict_types=1);

function env(string $key, ?string $default = null): ?string
{
    static $loaded = false;

    if (!$loaded) {
        $loaded = true;
        $path = __DIR__ . '/../.env';
        if (is_file($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (is_array($lines)) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || str_starts_with($line, '#')) {
                        continue;
                    }
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $k = trim($parts[0]);
                        $v = trim($parts[1]);
                        if ($k !== '' && getenv($k) === false) {
                            putenv($k . '=' . $v);
                        }
                    }
                }
            }
        }
    }

    $v = getenv($key);
    if ($v === false) {
        return $default;
    }

    return $v;
}
