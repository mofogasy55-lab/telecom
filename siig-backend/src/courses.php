<?php

declare(strict_types=1);

function courses_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    // MVP: list for all authenticated roles. Filtering by enrollment/teacher can be added later.
    $stmt = db()->query('SELECT id, semester_id, class_id, subject_id, teacher_id, title, description, resource_url, created_at FROM courses ORDER BY id DESC');
    $rows = $stmt->fetchAll();

    return respond(200, ['items' => $rows]);
}

function courses_create(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $body = json_input();
    $missing = require_fields($body, ['semester_id', 'class_id', 'subject_id', 'teacher_id', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $semesterId = (int)$body['semester_id'];
    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];
    $teacherId = (int)$body['teacher_id'];

    $title = trim((string)$body['title']);
    if ($title === '') {
        return respond(422, ['error' => 'validation_error', 'field' => 'title']);
    }

    $stmt = db()->prepare('SELECT 1 FROM semesters WHERE id = :id');
    $stmt->execute([':id' => $semesterId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'semester_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM classes WHERE id = :id');
    $stmt->execute([':id' => $classId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'class_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $subjectId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'subject_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM teachers WHERE id = :id');
    $stmt->execute([':id' => $teacherId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'teacher_id']);
    }

    $description = isset($body['description']) ? trim((string)$body['description']) : null;
    if ($description === '') {
        $description = null;
    }

    $resourceUrl = isset($body['resource_url']) ? trim((string)$body['resource_url']) : null;
    if ($resourceUrl === '') {
        $resourceUrl = null;
    }

    $stmt = db()->prepare('INSERT INTO courses (semester_id, class_id, subject_id, teacher_id, title, description, resource_url, created_at) VALUES (:semester_id, :class_id, :subject_id, :teacher_id, :title, :description, :resource_url, :created_at)');
    $stmt->execute([
        ':semester_id' => $semesterId,
        ':class_id' => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':title' => $title,
        ':description' => $description,
        ':resource_url' => $resourceUrl,
        ':created_at' => date(DATE_ATOM),
    ]);

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function courses_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $stmt = db()->prepare('SELECT id, semester_id, class_id, subject_id, teacher_id, title, description, resource_url, created_at FROM courses WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, $row);
}

function courses_update(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $body = json_input();
    $missing = require_fields($body, ['semester_id', 'class_id', 'subject_id', 'teacher_id', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $stmt = db()->prepare('SELECT 1 FROM courses WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if (!$stmt->fetch()) {
        return respond(404, ['error' => 'not_found']);
    }

    $semesterId = (int)$body['semester_id'];
    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];
    $teacherId = (int)$body['teacher_id'];

    $title = trim((string)$body['title']);
    if ($title === '') {
        return respond(422, ['error' => 'validation_error', 'field' => 'title']);
    }

    $stmt = db()->prepare('SELECT 1 FROM semesters WHERE id = :id');
    $stmt->execute([':id' => $semesterId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'semester_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM classes WHERE id = :id');
    $stmt->execute([':id' => $classId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'class_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $subjectId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'subject_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM teachers WHERE id = :id');
    $stmt->execute([':id' => $teacherId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'teacher_id']);
    }

    $description = isset($body['description']) ? trim((string)$body['description']) : null;
    if ($description === '') {
        $description = null;
    }

    $resourceUrl = isset($body['resource_url']) ? trim((string)$body['resource_url']) : null;
    if ($resourceUrl === '') {
        $resourceUrl = null;
    }

    $stmt = db()->prepare('UPDATE courses SET semester_id = :semester_id, class_id = :class_id, subject_id = :subject_id, teacher_id = :teacher_id, title = :title, description = :description, resource_url = :resource_url WHERE id = :id');
    $stmt->execute([
        ':semester_id' => $semesterId,
        ':class_id' => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':title' => $title,
        ':description' => $description,
        ':resource_url' => $resourceUrl,
        ':id' => $id,
    ]);

    return respond(200, ['ok' => true]);
}

function courses_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM courses WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}
