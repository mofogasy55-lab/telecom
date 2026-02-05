<?php

declare(strict_types=1);

function assessments_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $role = (string)($u['role'] ?? '');
    if ($role === 'etudiant') {
        $stmt = db()->query('SELECT id, semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at FROM assessments WHERE is_public = 1 ORDER BY id DESC');
        return respond(200, ['items' => $stmt->fetchAll()]);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    if ($role === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($teacherId <= 0) {
            return respond(200, ['items' => []]);
        }
        $stmt = db()->prepare('SELECT id, semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at FROM assessments WHERE is_public = 1 OR teacher_id = :tid ORDER BY id DESC');
        $stmt->execute([':tid' => $teacherId]);
        return respond(200, ['items' => $stmt->fetchAll()]);
    }

    $stmt = db()->query('SELECT id, semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at FROM assessments ORDER BY id DESC');
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function assessments_create(): array
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
    $missing = require_fields($body, ['semester_id', 'class_id', 'subject_id', 'teacher_id', 'kind', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $semesterId = (int)$body['semester_id'];
    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];
    $teacherId = (int)$body['teacher_id'];

    if (($u['role'] ?? '') === 'prof') {
        $myTeacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($myTeacherId <= 0) {
            return respond(403, ['error' => 'forbidden']);
        }
        $teacherId = $myTeacherId;
    }

    $kind = strtolower(trim((string)$body['kind']));
    if ($kind === '') {
        return respond(422, ['error' => 'validation_error', 'field' => 'kind']);
    }

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

    $assessmentDate = isset($body['assessment_date']) ? trim((string)$body['assessment_date']) : null;
    if ($assessmentDate === '') {
        $assessmentDate = null;
    }

    $maxScore = isset($body['max_score']) && $body['max_score'] !== null && $body['max_score'] !== '' ? (float)$body['max_score'] : null;
    $coefficient = isset($body['coefficient']) && $body['coefficient'] !== null && $body['coefficient'] !== '' ? (float)$body['coefficient'] : null;

    $isPublic = 1;
    if (array_key_exists('is_public', $body)) {
        $raw = $body['is_public'];
        $isPublic = ($raw === true || $raw === 1 || $raw === '1' || $raw === 'true' || $raw === 'yes' || $raw === 'on') ? 1 : 0;
    }

    $stmt = db()->prepare('INSERT INTO assessments (semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at) VALUES (:semester_id, :class_id, :subject_id, :teacher_id, :kind, :title, :assessment_date, :max_score, :coefficient, :is_public, :created_at)');
    $stmt->execute([
        ':semester_id' => $semesterId,
        ':class_id' => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':kind' => $kind,
        ':title' => $title,
        ':assessment_date' => $assessmentDate,
        ':max_score' => $maxScore,
        ':coefficient' => $coefficient,
        ':is_public' => $isPublic,
        ':created_at' => date(DATE_ATOM),
    ]);

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function assessments_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $stmt = db()->prepare('SELECT id, semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at FROM assessments WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    $role = (string)($u['role'] ?? '');
    if ($role === 'etudiant') {
        if ((int)($row['is_public'] ?? 0) !== 1) {
            return respond(403, ['error' => 'forbidden']);
        }
        return respond(200, $row);
    }

    if ($role === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        $isPublic = (int)($row['is_public'] ?? 0) === 1;
        if (!$isPublic && $teacherId > 0 && (int)$row['teacher_id'] !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
        return respond(200, $row);
    }

    return respond(200, $row);
}

function assessments_update(int $id): array
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
    $missing = require_fields($body, ['semester_id', 'class_id', 'subject_id', 'teacher_id', 'kind', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $stmt = db()->prepare('SELECT id, teacher_id, is_public FROM assessments WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        return respond(404, ['error' => 'not_found']);
    }

    $semesterId = (int)$body['semester_id'];
    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];
    $teacherId = (int)$body['teacher_id'];

    if (($u['role'] ?? '') === 'prof') {
        $myTeacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($myTeacherId <= 0 || (int)$existing['teacher_id'] !== $myTeacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
        $teacherId = $myTeacherId;
    }

    $kind = strtolower(trim((string)$body['kind']));
    if ($kind === '') {
        return respond(422, ['error' => 'validation_error', 'field' => 'kind']);
    }

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

    $assessmentDate = isset($body['assessment_date']) ? trim((string)$body['assessment_date']) : null;
    if ($assessmentDate === '') {
        $assessmentDate = null;
    }

    $maxScore = isset($body['max_score']) && $body['max_score'] !== null && $body['max_score'] !== '' ? (float)$body['max_score'] : null;
    $coefficient = isset($body['coefficient']) && $body['coefficient'] !== null && $body['coefficient'] !== '' ? (float)$body['coefficient'] : null;

    $isPublic = (int)($existing['is_public'] ?? 1);
    if (array_key_exists('is_public', $body)) {
        $raw = $body['is_public'];
        $isPublic = ($raw === true || $raw === 1 || $raw === '1' || $raw === 'true' || $raw === 'yes' || $raw === 'on') ? 1 : 0;
    }

    $stmt = db()->prepare('UPDATE assessments SET semester_id = :semester_id, class_id = :class_id, subject_id = :subject_id, teacher_id = :teacher_id, kind = :kind, title = :title, assessment_date = :assessment_date, max_score = :max_score, coefficient = :coefficient, is_public = :is_public WHERE id = :id');
    $stmt->execute([
        ':semester_id' => $semesterId,
        ':class_id' => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':kind' => $kind,
        ':title' => $title,
        ':assessment_date' => $assessmentDate,
        ':max_score' => $maxScore,
        ':coefficient' => $coefficient,
        ':is_public' => $isPublic,
        ':id' => $id,
    ]);

    return respond(200, ['ok' => true]);
}

function assessments_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    if (($u['role'] ?? '') === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($teacherId <= 0) {
            return respond(403, ['error' => 'forbidden']);
        }
        $stmt = db()->prepare('SELECT teacher_id FROM assessments WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row || (int)$row['teacher_id'] !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
    }

    $stmt = db()->prepare('DELETE FROM assessments WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}
