<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

function messages_create(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $data = json_input();

    $type = strtolower(trim((string)($data['type'] ?? '')));
    if ($type !== 'public' && $type !== 'direct') {
        return respond(422, ['error' => 'invalid_type']);
    }

    $body = trim((string)($data['body'] ?? ''));
    if ($body === '') {
        return respond(422, ['error' => 'missing_body']);
    }

    $subject = trim((string)($data['subject'] ?? ''));
    $subject = $subject === '' ? null : $subject;

    $toTeacherId = null;
    if ($type === 'direct') {
        $toTeacherId = (int)($data['to_teacher_id'] ?? 0);
        if ($toTeacherId <= 0) {
            return respond(422, ['error' => 'missing_to_teacher_id']);
        }

        $stmt = db()->prepare('SELECT id FROM teachers WHERE id = :id');
        $stmt->execute([':id' => $toTeacherId]);
        $row = $stmt->fetch();
        if (!is_array($row)) {
            return respond(404, ['error' => 'teacher_not_found']);
        }
    }

    $createdAt = date(DATE_ATOM);
    $status = $type === 'public' ? 'pending' : 'approved';

    $stmt = db()->prepare('INSERT INTO messages (type, status, from_user_id, to_teacher_id, subject, body, is_read, created_at) VALUES (:type, :status, :from_user_id, :to_teacher_id, :subject, :body, 0, :created_at)');
    $stmt->execute([
        ':type' => $type,
        ':status' => $status,
        ':from_user_id' => (int)($u['id'] ?? 0),
        ':to_teacher_id' => $toTeacherId,
        ':subject' => $subject,
        ':body' => $body,
        ':created_at' => $createdAt,
    ]);

    $id = (int)db()->lastInsertId();

    return respond(201, ['id' => $id]);
}

function messages_inbox(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $role = (string)($u['role'] ?? '');

    if ($role === 'admin') {
        $stmt = db()->query('SELECT id, type, status, from_user_id, to_teacher_id, subject, body, is_read, created_at, approved_at, approved_by_user_id FROM messages ORDER BY id DESC LIMIT 200');
        $items = $stmt->fetchAll();
        return respond(200, ['items' => $items]);
    }

    if ($role === 'prof') {
        $teacherId = (int)($u['teacher_id'] ?? 0);

        $stmt = db()->prepare('SELECT id, type, status, from_user_id, to_teacher_id, subject, body, is_read, created_at, approved_at, approved_by_user_id FROM messages WHERE (type = \'public\' AND status = \'approved\') OR (type = \'direct\' AND to_teacher_id = :tid) ORDER BY id DESC LIMIT 200');
        $stmt->execute([':tid' => $teacherId]);
        $items = $stmt->fetchAll();
        return respond(200, ['items' => $items]);
    }

    $stmt = db()->prepare('SELECT id, type, status, from_user_id, to_teacher_id, subject, body, is_read, created_at, approved_at, approved_by_user_id FROM messages WHERE (type = \'public\' AND status = \'approved\') OR (from_user_id = :uid) ORDER BY id DESC LIMIT 200');
    $stmt->execute([':uid' => (int)($u['id'] ?? 0)]);
    $items = $stmt->fetchAll();
    return respond(200, ['items' => $items]);
}

function messages_unread_count(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $role = (string)($u['role'] ?? '');

    if ($role === 'admin') {
        $stmt = db()->query("SELECT COUNT(*) AS c FROM messages WHERE type = 'public' AND status = 'pending'");
        $row = $stmt->fetch();
        $count = is_array($row) ? (int)($row['c'] ?? 0) : 0;
        return respond(200, ['count' => $count]);
    }

    if ($role === 'prof') {
        $teacherId = (int)($u['teacher_id'] ?? 0);
        $stmt = db()->prepare("SELECT COUNT(*) AS c FROM messages WHERE type = 'direct' AND to_teacher_id = :tid AND is_read = 0");
        $stmt->execute([':tid' => $teacherId]);
        $row = $stmt->fetch();
        $count = is_array($row) ? (int)($row['c'] ?? 0) : 0;
        return respond(200, ['count' => $count]);
    }

    return respond(200, ['count' => 0]);
}

function messages_approve(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $forbidden = require_role($u, ['admin']);
    if ($forbidden !== null) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, type, status FROM messages WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    if (($row['type'] ?? '') !== 'public') {
        return respond(409, ['error' => 'not_public']);
    }

    if (($row['status'] ?? '') === 'approved') {
        return respond(200, ['ok' => true]);
    }

    $stmt = db()->prepare('UPDATE messages SET status = \'approved\', approved_at = :approved_at, approved_by_user_id = :approved_by_user_id WHERE id = :id');
    $stmt->execute([
        ':approved_at' => date(DATE_ATOM),
        ':approved_by_user_id' => (int)($u['id'] ?? 0),
        ':id' => $id,
    ]);

    return respond(200, ['ok' => true]);
}

function messages_mark_read(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $role = (string)($u['role'] ?? '');

    $stmt = db()->prepare('SELECT id, type, status, from_user_id, to_teacher_id FROM messages WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    $allowed = false;

    if ($role === 'admin') {
        $allowed = true;
    } elseif ($role === 'prof') {
        $teacherId = (int)($u['teacher_id'] ?? 0);
        if (($row['type'] ?? '') === 'direct' && (int)($row['to_teacher_id'] ?? 0) === $teacherId) {
            $allowed = true;
        }
    } else {
        if ((int)($row['from_user_id'] ?? 0) === (int)($u['id'] ?? 0)) {
            $allowed = true;
        }
    }

    if (!$allowed) {
        return respond(403, ['error' => 'forbidden']);
    }

    $stmt = db()->prepare('UPDATE messages SET is_read = 1 WHERE id = :id');
    $stmt->execute([':id' => $id]);

    return respond(200, ['ok' => true]);
}
