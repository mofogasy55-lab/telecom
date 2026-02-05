<?php

declare(strict_types=1);

function find_student_id_for_user(array $user): ?int
{
    $email = strtolower(trim((string)($user['email'] ?? '')));
    if ($email === '') {
        return null;
    }

    $stmt = db()->prepare('SELECT id FROM students WHERE lower(email) = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();

    if (!is_array($row) || !isset($row['id'])) {
        return null;
    }

    return (int)$row['id'];
}

function grades_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    if (($u['role'] ?? '') === 'etudiant') {
        $studentId = find_student_id_for_user($u);
        if ($studentId === null) {
            return respond(200, ['items' => []]);
        }

        $stmt = db()->prepare('SELECT g.id, g.assessment_id, g.student_id, g.score, g.comment, g.graded_at, g.created_at, a.teacher_id AS assessment_teacher_id, a.is_public AS assessment_is_public FROM grades g JOIN assessments a ON a.id = g.assessment_id WHERE g.student_id = :sid AND a.is_public = 1 ORDER BY g.id DESC');
        $stmt->execute([':sid' => $studentId]);
        return respond(200, ['items' => $stmt->fetchAll()]);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $role = (string)($u['role'] ?? '');
    $where = [];
    $params = [];

    if (isset($_GET['assessment_id']) && $_GET['assessment_id'] !== '') {
        $where[] = 'g.assessment_id = :assessment_id';
        $params[':assessment_id'] = (int)$_GET['assessment_id'];
    }

    if (isset($_GET['student_id']) && $_GET['student_id'] !== '') {
        $where[] = 'g.student_id = :student_id';
        $params[':student_id'] = (int)$_GET['student_id'];
    }

    if ($role === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($teacherId <= 0) {
            return respond(200, ['items' => []]);
        }
        $where[] = '(a.is_public = 1 OR a.teacher_id = :tid)';
        $params[':tid'] = $teacherId;
    }

    $sql = 'SELECT g.id, g.assessment_id, g.student_id, g.score, g.comment, g.graded_at, g.created_at, a.teacher_id AS assessment_teacher_id, a.is_public AS assessment_is_public FROM grades g JOIN assessments a ON a.id = g.assessment_id';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY g.id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function grades_create(): array
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
    $missing = require_fields($body, ['assessment_id', 'student_id', 'score']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $assessmentId = (int)$body['assessment_id'];
    $studentId = (int)$body['student_id'];
    $score = (float)$body['score'];

    $stmt = db()->prepare('SELECT id, teacher_id, is_public FROM assessments WHERE id = :id');
    $stmt->execute([':id' => $assessmentId]);
    $ass = $stmt->fetch();
    if (!$ass) {
        return respond(422, ['error' => 'validation_error', 'field' => 'assessment_id']);
    }

    if (($u['role'] ?? '') === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($teacherId <= 0 || (int)$ass['teacher_id'] !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
    }

    $stmt = db()->prepare('SELECT 1 FROM students WHERE id = :id');
    $stmt->execute([':id' => $studentId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'student_id']);
    }

    $comment = isset($body['comment']) ? trim((string)$body['comment']) : null;
    if ($comment === '') {
        $comment = null;
    }

    $gradedAt = isset($body['graded_at']) ? trim((string)$body['graded_at']) : null;
    if ($gradedAt === '') {
        $gradedAt = null;
    }

    $stmt = db()->prepare('INSERT INTO grades (assessment_id, student_id, score, comment, graded_at, created_at) VALUES (:assessment_id, :student_id, :score, :comment, :graded_at, :created_at)');

    try {
        $stmt->execute([
            ':assessment_id' => $assessmentId,
            ':student_id' => $studentId,
            ':score' => $score,
            ':comment' => $comment,
            ':graded_at' => $gradedAt,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'grade_already_exists']);
    }

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function grades_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $stmt = db()->prepare('SELECT g.id, g.assessment_id, g.student_id, g.score, g.comment, g.graded_at, g.created_at, a.teacher_id AS assessment_teacher_id, a.is_public AS assessment_is_public FROM grades g JOIN assessments a ON a.id = g.assessment_id WHERE g.id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    if (($u['role'] ?? '') === 'etudiant') {
        $studentId = find_student_id_for_user($u);
        if ($studentId === null || (int)$row['student_id'] !== $studentId) {
            return respond(403, ['error' => 'forbidden']);
        }
        if ((int)($row['assessment_is_public'] ?? 0) !== 1) {
            return respond(403, ['error' => 'forbidden']);
        }
        return respond(200, $row);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    if (($u['role'] ?? '') === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        $isPublic = (int)($row['assessment_is_public'] ?? 0) === 1;
        if (!$isPublic && $teacherId > 0 && (int)($row['assessment_teacher_id'] ?? 0) !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
    }

    return respond(200, $row);
}

function grades_update(int $id): array
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
    $missing = require_fields($body, ['assessment_id', 'student_id', 'score']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $stmt = db()->prepare('SELECT g.id, a.teacher_id AS assessment_teacher_id FROM grades g JOIN assessments a ON a.id = g.assessment_id WHERE g.id = :id');
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        return respond(404, ['error' => 'not_found']);
    }

    $assessmentId = (int)$body['assessment_id'];
    $studentId = (int)$body['student_id'];
    $score = (float)$body['score'];

    $stmt = db()->prepare('SELECT id, teacher_id FROM assessments WHERE id = :id');
    $stmt->execute([':id' => $assessmentId]);
    $ass = $stmt->fetch();
    if (!$ass) {
        return respond(422, ['error' => 'validation_error', 'field' => 'assessment_id']);
    }

    if (($u['role'] ?? '') === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($teacherId <= 0 || (int)$existing['assessment_teacher_id'] !== $teacherId || (int)$ass['teacher_id'] !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
    }

    $stmt = db()->prepare('SELECT 1 FROM students WHERE id = :id');
    $stmt->execute([':id' => $studentId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'student_id']);
    }

    $comment = isset($body['comment']) ? trim((string)$body['comment']) : null;
    if ($comment === '') {
        $comment = null;
    }

    $gradedAt = isset($body['graded_at']) ? trim((string)$body['graded_at']) : null;
    if ($gradedAt === '') {
        $gradedAt = null;
    }

    $stmt = db()->prepare('UPDATE grades SET assessment_id = :assessment_id, student_id = :student_id, score = :score, comment = :comment, graded_at = :graded_at WHERE id = :id');

    try {
        $stmt->execute([
            ':assessment_id' => $assessmentId,
            ':student_id' => $studentId,
            ':score' => $score,
            ':comment' => $comment,
            ':graded_at' => $gradedAt,
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'grade_already_exists']);
    }

    return respond(200, ['ok' => true]);
}

function grades_delete(int $id): array
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
        $stmt = db()->prepare('SELECT a.teacher_id AS assessment_teacher_id FROM grades g JOIN assessments a ON a.id = g.assessment_id WHERE g.id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row || (int)$row['assessment_teacher_id'] !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
    }

    $stmt = db()->prepare('DELETE FROM grades WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}
