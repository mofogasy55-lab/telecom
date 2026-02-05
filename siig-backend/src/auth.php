<?php

declare(strict_types=1);

function jwt_secret(): string
{
    return env('JWT_SECRET', 'change-me-in-env') ?? 'change-me-in-env';
}

function jwt_encode(array $payload): string
{
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $segments = [];
    $segments[] = rtrim(strtr(base64_encode(json_encode($header)), '+/', '-_'), '=');
    $segments[] = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');

    $signingInput = $segments[0] . '.' . $segments[1];
    $signature = hash_hmac('sha256', $signingInput, jwt_secret(), true);
    $segments[] = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

    return implode('.', $segments);
}

function jwt_decode(string $jwt): ?array
{
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return null;
    }

    [$h, $p, $s] = $parts;

    $sig = base64_decode(strtr($s, '-_', '+/'));
    if ($sig === false) {
        return null;
    }

    $signingInput = $h . '.' . $p;
    $expected = hash_hmac('sha256', $signingInput, jwt_secret(), true);
    if (!hash_equals($expected, $sig)) {
        return null;
    }

    $payloadJson = base64_decode(strtr($p, '-_', '+/'));
    if ($payloadJson === false) {
        return null;
    }

    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }

    if (isset($payload['exp']) && is_numeric($payload['exp']) && time() > (int)$payload['exp']) {
        return null;
    }

    return $payload;
}

function auth_user(): ?array
{
    $token = bearer_token();
    if ($token === null) {
        return null;
    }

    $payload = jwt_decode($token);
    if ($payload === null) {
        return null;
    }

    if (!isset($payload['uid'])) {
        return null;
    }

    $stmt = db()->prepare('SELECT id, email, role, created_at FROM users WHERE id = :id');
    $stmt->execute([':id' => (int)$payload['uid']]);
    $u = $stmt->fetch();

    if (!is_array($u)) {
        return null;
    }

    $role = strtolower((string)($u['role'] ?? ''));
    if ($role === 'student') {
        $role = 'etudiant';
    }
    if ($role === 'teacher') {
        $role = 'prof';
    }
    $u['role'] = $role;

    $email = strtolower(trim((string)($u['email'] ?? '')));
    if ($email !== '') {
        if ($role === 'etudiant') {
            $stmt = db()->prepare('SELECT id FROM students WHERE lower(email) = :email LIMIT 1');
            $stmt->execute([':email' => $email]);
            $row = $stmt->fetch();
            if (is_array($row) && isset($row['id'])) {
                $u['student_id'] = (int)$row['id'];
            }
        }

        if ($role === 'prof') {
            $stmt = db()->prepare('SELECT id, specialite FROM teachers WHERE lower(email) = :email LIMIT 1');
            $stmt->execute([':email' => $email]);
            $row = $stmt->fetch();
            if (is_array($row) && isset($row['id'])) {
                $u['teacher_id'] = (int)$row['id'];
                if (isset($row['specialite'])) {
                    $u['teacher_specialite'] = $row['specialite'];
                }
            }
        }
    }

    return $u;
}

function require_auth(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    return respond(200, $u);
}

function require_role(array $user, array $roles): ?array
{
    if (!in_array($user['role'] ?? '', $roles, true)) {
        return respond(403, ['error' => 'forbidden']);
    }

    return null;
}
