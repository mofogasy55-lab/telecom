<?php

declare(strict_types=1);

function timetable_list(): array
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
            return respond(200, ['items' => []]);
        }
        $stmt = db()->prepare('SELECT id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at FROM timetable_entries WHERE teacher_id = :tid ORDER BY id DESC');
        $stmt->execute([':tid' => $teacherId]);
        return respond(200, ['items' => $stmt->fetchAll()]);
    }

    $stmt = db()->query('SELECT id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at FROM timetable_entries ORDER BY id DESC');
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function timetable_create(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $body = json_input();
    $missing = require_fields($body, ['semester_id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $semesterId = (int)$body['semester_id'];
    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];
    $teacherId = (int)$body['teacher_id'];
    $dayOfWeek = (int)$body['day_of_week'];

    if ($dayOfWeek < 1 || $dayOfWeek > 7) {
        return respond(422, ['error' => 'validation_error', 'field' => 'day_of_week']);
    }

    $startTime = trim((string)$body['start_time']);
    $endTime = trim((string)$body['end_time']);
    if ($startTime === '' || $endTime === '') {
        return respond(422, ['error' => 'validation_error', 'field' => 'time']);
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

    $room = isset($body['room']) ? trim((string)$body['room']) : null;
    if ($room === '') {
        $room = null;
    }

    $mode = isset($body['mode']) ? trim((string)$body['mode']) : null;
    if ($mode === '') {
        $mode = null;
    }

    $onlineUrl = isset($body['online_url']) ? trim((string)$body['online_url']) : null;
    if ($onlineUrl === '') {
        $onlineUrl = null;
    }

    $stmt = db()->prepare('INSERT INTO timetable_entries (semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at) VALUES (:semester_id, :class_id, :subject_id, :teacher_id, :day_of_week, :start_time, :end_time, :room, :mode, :online_url, :created_at)');
    $stmt->execute([
        ':semester_id' => $semesterId,
        ':class_id' => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':day_of_week' => $dayOfWeek,
        ':start_time' => $startTime,
        ':end_time' => $endTime,
        ':room' => $room,
        ':mode' => $mode,
        ':online_url' => $onlineUrl,
        ':created_at' => date(DATE_ATOM),
    ]);

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function timetable_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at FROM timetable_entries WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    if (($u['role'] ?? '') === 'prof') {
        $teacherId = isset($u['teacher_id']) ? (int)$u['teacher_id'] : 0;
        if ($teacherId <= 0 || (int)$row['teacher_id'] !== $teacherId) {
            return respond(403, ['error' => 'forbidden']);
        }
    }

    return respond(200, $row);
}

function timetable_update(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $body = json_input();
    $missing = require_fields($body, ['semester_id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $semesterId = (int)$body['semester_id'];
    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];
    $teacherId = (int)$body['teacher_id'];
    $dayOfWeek = (int)$body['day_of_week'];

    if ($dayOfWeek < 1 || $dayOfWeek > 7) {
        return respond(422, ['error' => 'validation_error', 'field' => 'day_of_week']);
    }

    $startTime = trim((string)$body['start_time']);
    $endTime = trim((string)$body['end_time']);
    if ($startTime === '' || $endTime === '') {
        return respond(422, ['error' => 'validation_error', 'field' => 'time']);
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

    $room = isset($body['room']) ? trim((string)$body['room']) : null;
    if ($room === '') {
        $room = null;
    }

    $mode = isset($body['mode']) ? trim((string)$body['mode']) : null;
    if ($mode === '') {
        $mode = null;
    }

    $onlineUrl = isset($body['online_url']) ? trim((string)$body['online_url']) : null;
    if ($onlineUrl === '') {
        $onlineUrl = null;
    }

    $stmt = db()->prepare('UPDATE timetable_entries SET semester_id = :semester_id, class_id = :class_id, subject_id = :subject_id, teacher_id = :teacher_id, day_of_week = :day_of_week, start_time = :start_time, end_time = :end_time, room = :room, mode = :mode, online_url = :online_url WHERE id = :id');
    $stmt->execute([
        ':semester_id' => $semesterId,
        ':class_id' => $classId,
        ':subject_id' => $subjectId,
        ':teacher_id' => $teacherId,
        ':day_of_week' => $dayOfWeek,
        ':start_time' => $startTime,
        ':end_time' => $endTime,
        ':room' => $room,
        ':mode' => $mode,
        ':online_url' => $onlineUrl,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function timetable_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM timetable_entries WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}
