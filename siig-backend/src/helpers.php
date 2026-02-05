<?php

declare(strict_types=1);

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function respond(int $status, $data): array
{
    return ['status' => $status, 'data' => $data];
}

function cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
}

function bearer_token(): ?string
{
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!is_string($hdr) || $hdr === '') {
        return null;
    }

    if (preg_match('/^Bearer\s+(.*)$/i', $hdr, $m) === 1) {
        return trim($m[1]);
    }

    return null;
}

function require_fields(array $data, array $fields): ?array
{
    $missing = [];
    foreach ($fields as $f) {
        if (!array_key_exists($f, $data) || $data[$f] === null || $data[$f] === '') {
            $missing[] = $f;
        }
    }

    return count($missing) > 0 ? $missing : null;
}
