<?php

declare(strict_types=1);

function route(string $method, string $path): array
{
    // Root / API info
    if ($method === 'GET' && ($path === '/' || $path === '/api')) {
        return respond(200, [
            'name' => 'SIIG Telecom API',
            'ok' => true,
            'endpoints' => [
                'GET /api/health',
                'POST /api/auth/register',
                'POST /api/auth/login',
                'GET /api/me',
                'GET /api/students',
                'POST /api/students',
                'GET /api/students/{id}',
                'PUT/PATCH /api/students/{id}',
                'DELETE /api/students/{id}',
                'GET /api/teachers',
                'POST /api/teachers',
                'GET /api/teachers/{id}',
                'PUT/PATCH /api/teachers/{id}',
                'DELETE /api/teachers/{id}',
                'GET /api/teacher-subjects?teacher_id={id}',
                'POST /api/teacher-subjects',
                'DELETE /api/teacher-subjects/{id}',
                'GET /api/semesters',
                'POST /api/semesters',
                'GET /api/semesters/{id}',
                'PUT/PATCH /api/semesters/{id}',
                'DELETE /api/semesters/{id}',
                'GET /api/classes',
                'POST /api/classes',
                'GET /api/classes/{id}',
                'PUT/PATCH /api/classes/{id}',
                'DELETE /api/classes/{id}',
                'GET /api/subjects',
                'POST /api/subjects',
                'GET /api/subjects/{id}',
                'PUT/PATCH /api/subjects/{id}',
                'DELETE /api/subjects/{id}',
                'GET /api/ues',
                'POST /api/ues',
                'GET /api/ues/{id}',
                'PUT/PATCH /api/ues/{id}',
                'DELETE /api/ues/{id}',
                'GET /api/ecs',
                'POST /api/ecs',
                'GET /api/ecs/{id}',
                'PUT/PATCH /api/ecs/{id}',
                'DELETE /api/ecs/{id}',
                'GET /api/class-subjects',
                'POST /api/class-subjects',
                'GET /api/class-subjects/{id}',
                'DELETE /api/class-subjects/{id}',
                'GET /api/student-class-assignments',
                'POST /api/student-class-assignments',
                'GET /api/student-class-assignments/{id}',
                'DELETE /api/student-class-assignments/{id}',
                'GET /api/enrollments',
                'POST /api/enrollments',
                'GET /api/enrollments/{id}',
                'PUT/PATCH /api/enrollments/{id}',
                'DELETE /api/enrollments/{id}',
                'GET /api/timetable',
                'POST /api/timetable',
                'GET /api/timetable/{id}',
                'PUT/PATCH /api/timetable/{id}',
                'DELETE /api/timetable/{id}',
                'GET /api/courses',
                'POST /api/courses',
                'GET /api/courses/{id}',
                'PUT/PATCH /api/courses/{id}',
                'DELETE /api/courses/{id}',
                'GET /api/assessments',
                'POST /api/assessments',
                'GET /api/assessments/{id}',
                'PUT/PATCH /api/assessments/{id}',
                'DELETE /api/assessments/{id}',
                'GET /api/grades',
                'POST /api/grades',
                'GET /api/grades/{id}',
                'PUT/PATCH /api/grades/{id}',
                'DELETE /api/grades/{id}',
            ],
        ]);
    }

    // Health
    if ($method === 'GET' && $path === '/api/health') {
        return respond(200, ['ok' => true, 'time' => date(DATE_ATOM)]);
    }

    // Auth
    if ($method === 'POST' && $path === '/api/auth/register') {
        return auth_register();
    }
    if ($method === 'POST' && $path === '/api/auth/login') {
        return auth_login();
    }
    if ($method === 'GET' && $path === '/api/me') {
        $u = auth_user();
        if ($u === null) {
            return respond(401, ['error' => 'unauthorized']);
        }
        return respond(200, $u);
    }

    // Students (example module)
    if ($path === '/api/students' && $method === 'GET') {
        return students_list();
    }
    if ($path === '/api/students' && $method === 'POST') {
        return students_create();
    }
    if (preg_match('#^/api/students/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return students_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return students_update($id);
        }
        if ($method === 'DELETE') {
            return students_delete($id);
        }
    }

    // Teachers
    if ($path === '/api/teachers' && $method === 'GET') {
        return teachers_list();
    }
    if ($path === '/api/teachers' && $method === 'POST') {
        return teachers_create();
    }
    if (preg_match('#^/api/teachers/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return teachers_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return teachers_update($id);
        }
        if ($method === 'DELETE') {
            return teachers_delete($id);
        }
    }

    // Teacher-Subjects
    if ($path === '/api/teacher-subjects' && $method === 'GET') {
        return teacher_subjects_list();
    }
    if ($path === '/api/teacher-subjects' && $method === 'POST') {
        return teacher_subjects_create();
    }
    if (preg_match('#^/api/teacher-subjects/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'DELETE') {
            return teacher_subjects_delete($id);
        }
    }

    // Teacher availabilities
    if ($path === '/api/teacher-availability-sets' && $method === 'GET') {
        return teacher_availability_sets_list();
    }
    if ($path === '/api/teacher-availability-sets' && $method === 'POST') {
        return teacher_availability_sets_create();
    }
    if (preg_match('#^/api/teacher-availability-sets/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'PUT' || $method === 'PATCH') {
            return teacher_availability_sets_update($id);
        }
    }
    if ($path === '/api/teacher-availabilities' && $method === 'GET') {
        return teacher_availabilities_get();
    }
    if ($path === '/api/teacher-availabilities' && $method === 'PUT') {
        return teacher_availabilities_put();
    }

    // Semesters
    if ($path === '/api/semesters' && $method === 'GET') {
        return semesters_list();
    }
    if ($path === '/api/semesters' && $method === 'POST') {
        return semesters_create();
    }
    if (preg_match('#^/api/semesters/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return semesters_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return semesters_update($id);
        }
        if ($method === 'DELETE') {
            return semesters_delete($id);
        }
    }

    // Classes
    if ($path === '/api/classes' && $method === 'GET') {
        return classes_list();
    }
    if ($path === '/api/classes' && $method === 'POST') {
        return classes_create();
    }
    if (preg_match('#^/api/classes/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return classes_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return classes_update($id);
        }
        if ($method === 'DELETE') {
            return classes_delete($id);
        }
    }

    // Subjects
    if ($path === '/api/subjects' && $method === 'GET') {
        return subjects_list();
    }
    if ($path === '/api/subjects' && $method === 'POST') {
        return subjects_create();
    }
    if (preg_match('#^/api/subjects/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return subjects_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return subjects_update($id);
        }
        if ($method === 'DELETE') {
            return subjects_delete($id);
        }
    }

    // UEs
    if ($path === '/api/ues' && $method === 'GET') {
        return ues_list();
    }
    if ($path === '/api/ues' && $method === 'POST') {
        return ues_create();
    }
    if (preg_match('#^/api/ues/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return ues_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return ues_update($id);
        }
        if ($method === 'DELETE') {
            return ues_delete($id);
        }
    }

    // ECs
    if ($path === '/api/ecs' && $method === 'GET') {
        return ecs_list();
    }
    if ($path === '/api/ecs' && $method === 'POST') {
        return ecs_create();
    }
    if (preg_match('#^/api/ecs/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return ecs_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return ecs_update($id);
        }
        if ($method === 'DELETE') {
            return ecs_delete($id);
        }
    }

    // Class-Subjects
    if ($path === '/api/class-subjects' && $method === 'GET') {
        return class_subjects_list();
    }
    if ($path === '/api/class-subjects' && $method === 'POST') {
        return class_subjects_create();
    }
    if (preg_match('#^/api/class-subjects/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return class_subjects_get($id);
        }
        if ($method === 'DELETE') {
            return class_subjects_delete($id);
        }
    }

    // Student-Class assignments
    if ($path === '/api/student-class-assignments' && $method === 'GET') {
        return student_class_assignments_list();
    }
    if ($path === '/api/student-class-assignments' && $method === 'POST') {
        return student_class_assignments_create();
    }
    if (preg_match('#^/api/student-class-assignments/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return student_class_assignments_get($id);
        }
        if ($method === 'DELETE') {
            return student_class_assignments_delete($id);
        }
    }

    // Enrollments
    if ($path === '/api/enrollments' && $method === 'GET') {
        return enrollments_list();
    }
    if ($path === '/api/enrollments' && $method === 'POST') {
        return enrollments_create();
    }
    if (preg_match('#^/api/enrollments/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return enrollments_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return enrollments_update($id);
        }
        if ($method === 'DELETE') {
            return enrollments_delete($id);
        }
    }

    if ($path === '/api/timetable' && $method === 'GET') {
        return timetable_list();
    }
    if ($path === '/api/timetable' && $method === 'POST') {
        return timetable_create();
    }
    if (preg_match('#^/api/timetable/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return timetable_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return timetable_update($id);
        }
        if ($method === 'DELETE') {
            return timetable_delete($id);
        }
    }

    if ($path === '/api/courses' && $method === 'GET') {
        return courses_list();
    }
    if ($path === '/api/courses' && $method === 'POST') {
        return courses_create();
    }
    if (preg_match('#^/api/courses/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return courses_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return courses_update($id);
        }
        if ($method === 'DELETE') {
            return courses_delete($id);
        }
    }

    // Assessments
    if ($path === '/api/assessments' && $method === 'GET') {
        return assessments_list();
    }
    if ($path === '/api/assessments' && $method === 'POST') {
        return assessments_create();
    }
    if (preg_match('#^/api/assessments/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return assessments_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return assessments_update($id);
        }
        if ($method === 'DELETE') {
            return assessments_delete($id);
        }
    }

    // Grades
    if ($path === '/api/grades' && $method === 'GET') {
        return grades_list();
    }
    if ($path === '/api/grades' && $method === 'POST') {
        return grades_create();
    }
    if (preg_match('#^/api/grades/(\d+)$#', $path, $m) === 1) {
        $id = (int)$m[1];
        if ($method === 'GET') {
            return grades_get($id);
        }
        if ($method === 'PUT' || $method === 'PATCH') {
            return grades_update($id);
        }
        if ($method === 'DELETE') {
            return grades_delete($id);
        }
    }

    return respond(404, ['error' => 'not_found']);
}

function auth_register(): array
{
    $pdo = db();
    $body = json_input();
    $missing = require_fields($body, ['email', 'password']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $email = strtolower(trim((string)$body['email']));
    $password = (string)$body['password'];

    // Bootstrap rule: first user becomes admin, next users are "etudiant" by default
    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM users')->fetch()['c'];

    $requestedRole = strtolower(trim((string)($body['role'] ?? 'etudiant')));
    $allowedRoles = ['etudiant', 'prof'];
    $role = $count === 0 ? 'admin' : (in_array($requestedRole, $allowedRoles, true) ? $requestedRole : 'etudiant');

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, role, created_at) VALUES (:email, :hash, :role, :created_at)');
    try {
        $stmt->execute([
            ':email' => $email,
            ':hash' => $hash,
            ':role' => $role,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'email_already_exists']);
    }

    $uid = (int)$pdo->lastInsertId();
    $token = jwt_encode([
        'uid' => $uid,
        'role' => $role,
        'exp' => time() + 60 * 60 * 24 * 7,
    ]);

    return respond(201, ['token' => $token, 'user' => ['id' => $uid, 'email' => $email, 'role' => $role]]);
}

function auth_login(): array
{
    $pdo = db();
    $body = json_input();
    $missing = require_fields($body, ['email', 'password']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $email = strtolower(trim((string)$body['email']));
    $password = (string)$body['password'];

    $stmt = $pdo->prepare('SELECT id, email, password_hash, role FROM users WHERE email = :email');
    $stmt->execute([':email' => $email]);
    $u = $stmt->fetch();

    if (!is_array($u) || !password_verify($password, (string)$u['password_hash'])) {
        return respond(401, ['error' => 'invalid_credentials']);
    }

    $role = strtolower((string)$u['role']);
    if ($role === 'student') {
        $role = 'etudiant';
    }
    if ($role === 'teacher') {
        $role = 'prof';
    }

    $token = jwt_encode([
        'uid' => (int)$u['id'],
        'role' => $role,
        'exp' => time() + 60 * 60 * 24 * 7,
    ]);

    return respond(200, ['token' => $token, 'user' => ['id' => (int)$u['id'], 'email' => (string)$u['email'], 'role' => $role]]);
}

function students_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $where = [];
    $params = [];

    $trackCategory = isset($_GET['track_category']) ? strtolower(trim((string)$_GET['track_category'])) : '';
    if ($trackCategory !== '') {
        $where[] = 'track_category = :track_category';
        $params[':track_category'] = $trackCategory;
    }

    $trackLevel = isset($_GET['track_level']) ? trim((string)$_GET['track_level']) : '';
    if ($trackLevel !== '') {
        $where[] = 'track_level = :track_level';
        $params[':track_level'] = $trackLevel;
    }

    $sql = 'SELECT id, matricule, first_name, last_name, semester, track_category, track_level, created_at FROM students';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    return respond(200, ['items' => $rows]);
}

function students_create(): array
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
    $missing = require_fields($body, ['matricule', 'first_name', 'last_name']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $trackCategory = isset($body['track_category']) ? strtolower(trim((string)$body['track_category'])) : null;
    if ($trackCategory === '') {
        $trackCategory = null;
    }
    $trackLevel = isset($body['track_level']) ? trim((string)$body['track_level']) : null;
    if ($trackLevel === '') {
        $trackLevel = null;
    }

    $stmt = db()->prepare('INSERT INTO students (matricule, first_name, last_name, semester, track_category, track_level, created_at) VALUES (:matricule, :first_name, :last_name, :semester, :track_category, :track_level, :created_at)');

    try {
        $stmt->execute([
            ':matricule' => trim((string)$body['matricule']),
            ':first_name' => trim((string)$body['first_name']),
            ':last_name' => trim((string)$body['last_name']),
            ':semester' => isset($body['semester']) ? trim((string)$body['semester']) : null,
            ':track_category' => $trackCategory,
            ':track_level' => $trackLevel,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'matricule_already_exists']);
    }

    $id = (int)db()->lastInsertId();

    return respond(201, ['id' => $id]);
}

function students_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, matricule, first_name, last_name, semester, track_category, track_level, created_at FROM students WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, $row);
}

function students_update(int $id): array
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

    $trackCategory = isset($body['track_category']) ? strtolower(trim((string)$body['track_category'])) : null;
    if ($trackCategory === '') {
        $trackCategory = null;
    }
    $trackLevel = isset($body['track_level']) ? trim((string)$body['track_level']) : null;
    if ($trackLevel === '') {
        $trackLevel = null;
    }

    $stmt = db()->prepare('UPDATE students SET matricule = :matricule, first_name = :first_name, last_name = :last_name, semester = :semester, track_category = :track_category, track_level = :track_level WHERE id = :id');
    try {
        $stmt->execute([
            ':matricule' => trim((string)($body['matricule'] ?? '')),
            ':first_name' => trim((string)($body['first_name'] ?? '')),
            ':last_name' => trim((string)($body['last_name'] ?? '')),
            ':semester' => isset($body['semester']) ? trim((string)$body['semester']) : null,
            ':track_category' => $trackCategory,
            ':track_level' => $trackLevel,
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'matricule_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function teacher_availability_sets_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $teacherId = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;
    if ($teacherId <= 0) {
        return respond(422, ['error' => 'validation_error', 'field' => 'teacher_id']);
    }

    try {
        $stmt = db()->prepare('SELECT id, teacher_id, valid_from, valid_to, created_at FROM teacher_availability_sets WHERE teacher_id = :tid ORDER BY id DESC');
        $stmt->execute([':tid' => $teacherId]);
        return respond(200, ['items' => $stmt->fetchAll()]);
    } catch (Throwable $e) {
        // Table does not exist yet → return empty list
        return respond(200, ['items' => []]);
    }
}

function teacher_availability_sets_create(): array
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
    $missing = require_fields($body, ['teacher_id', 'valid_from']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $teacherId = (int)$body['teacher_id'];
    $validFrom = trim((string)$body['valid_from']);
    $validTo = isset($body['valid_to']) ? trim((string)$body['valid_to']) : null;
    if ($validTo === '') {
        $validTo = null;
    }

    $stmt = db()->prepare('SELECT 1 FROM teachers WHERE id = :id');
    $stmt->execute([':id' => $teacherId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'teacher_id']);
    }

    $stmt = db()->prepare('INSERT INTO teacher_availability_sets (teacher_id, valid_from, valid_to, created_at) VALUES (:teacher_id, :valid_from, :valid_to, :created_at)');
    $stmt->execute([
        ':teacher_id' => $teacherId,
        ':valid_from' => $validFrom,
        ':valid_to' => $validTo,
        ':created_at' => date(DATE_ATOM),
    ]);
    $setId = (int)db()->lastInsertId();

    // Bootstrap 6 days
    $ins = db()->prepare('INSERT INTO teacher_availabilities (availability_set_id, day_of_week, time_ranges, created_at) VALUES (:sid, :dow, :tr, :created_at)');
    for ($d = 1; $d <= 6; $d++) {
        $ins->execute([
            ':sid' => $setId,
            ':dow' => $d,
            ':tr' => null,
            ':created_at' => date(DATE_ATOM),
        ]);
    }

    return respond(201, ['id' => $setId]);
}

function teacher_availability_sets_update(int $id): array
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
    $validFrom = isset($body['valid_from']) ? trim((string)$body['valid_from']) : null;
    $validTo = isset($body['valid_to']) ? trim((string)$body['valid_to']) : null;
    if ($validFrom === '') {
        $validFrom = null;
    }
    if ($validTo === '') {
        $validTo = null;
    }

    $stmt = db()->prepare('UPDATE teacher_availability_sets SET valid_from = COALESCE(:valid_from, valid_from), valid_to = :valid_to WHERE id = :id');
    $stmt->execute([
        ':valid_from' => $validFrom,
        ':valid_to' => $validTo,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function teacher_availabilities_get(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $setId = isset($_GET['availability_set_id']) ? (int)$_GET['availability_set_id'] : 0;
    if ($setId <= 0) {
        return respond(422, ['error' => 'validation_error', 'field' => 'availability_set_id']);
    }

    $stmt = db()->prepare('SELECT id, availability_set_id, day_of_week, time_ranges, created_at FROM teacher_availabilities WHERE availability_set_id = :sid ORDER BY day_of_week ASC');
    $stmt->execute([':sid' => $setId]);
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function teacher_availabilities_put(): array
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
    $missing = require_fields($body, ['availability_set_id', 'days']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $setId = (int)$body['availability_set_id'];
    $days = $body['days'];
    if (!is_array($days)) {
        return respond(422, ['error' => 'validation_error', 'field' => 'days']);
    }

    $stmt = db()->prepare('SELECT 1 FROM teacher_availability_sets WHERE id = :id');
    $stmt->execute([':id' => $setId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'availability_set_id']);
    }

    $upd = db()->prepare('UPDATE teacher_availabilities SET time_ranges = :tr WHERE availability_set_id = :sid AND day_of_week = :dow');
    foreach ($days as $d) {
        if (!is_array($d)) {
            continue;
        }
        $dow = isset($d['day_of_week']) ? (int)$d['day_of_week'] : 0;
        if ($dow < 1 || $dow > 6) {
            continue;
        }
        $tr = isset($d['time_ranges']) ? trim((string)$d['time_ranges']) : null;
        if ($tr === '') {
            $tr = null;
        }
        $upd->execute([
            ':tr' => $tr,
            ':sid' => $setId,
            ':dow' => $dow,
        ]);
    }

    return respond(200, ['ok' => true]);
}

function teacher_subjects_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $where = [];
    $params = [];

    $teacherId = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;
    if ($teacherId > 0) {
        $where[] = 'ts.teacher_id = :teacher_id';
        $params[':teacher_id'] = $teacherId;
    }

    $sql = 'SELECT ts.id, ts.teacher_id, ts.subject_id, ts.created_at, s.code AS subject_code, s.title AS subject_title '
        . 'FROM teacher_subjects ts '
        . 'JOIN subjects s ON s.id = ts.subject_id';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY ts.id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function teacher_subjects_create(): array
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
    $missing = require_fields($body, ['teacher_id', 'subject_id']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $teacherId = (int)$body['teacher_id'];
    $subjectId = (int)$body['subject_id'];

    $stmt = db()->prepare('SELECT 1 FROM teachers WHERE id = :id');
    $stmt->execute([':id' => $teacherId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'teacher_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $subjectId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'subject_id']);
    }

    $stmt = db()->prepare('INSERT INTO teacher_subjects (teacher_id, subject_id, created_at) VALUES (:teacher_id, :subject_id, :created_at)');
    try {
        $stmt->execute([
            ':teacher_id' => $teacherId,
            ':subject_id' => $subjectId,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'relation_already_exists']);
    }

    return respond(201, ['id' => (int)db()->lastInsertId()]);
}

function teacher_subjects_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM teacher_subjects WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function ues_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->query('SELECT id, code, title, credit, semestre_code, type_ue, created_at FROM ues ORDER BY id DESC');
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function ues_create(): array
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
    $missing = require_fields($body, ['code', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $code = trim((string)$body['code']);
    $title = trim((string)$body['title']);
    $credit = array_key_exists('credit', $body) && $body['credit'] !== null && $body['credit'] !== '' ? (float)$body['credit'] : null;
    $semestreCode = isset($body['semestre_code']) ? trim((string)$body['semestre_code']) : null;
    if ($semestreCode === '') {
        $semestreCode = null;
    }
    $typeUe = isset($body['type_ue']) ? trim((string)$body['type_ue']) : null;
    if ($typeUe === '') {
        $typeUe = null;
    }

    $stmt = db()->prepare('INSERT INTO ues (code, title, credit, semestre_code, type_ue, created_at) VALUES (:code, :title, :credit, :semestre_code, :type_ue, :created_at)');
    try {
        $stmt->execute([
            ':code' => $code,
            ':title' => $title,
            ':credit' => $credit,
            ':semestre_code' => $semestreCode,
            ':type_ue' => $typeUe,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    return respond(201, ['id' => (int)db()->lastInsertId()]);
}

function ues_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, code, title, credit, semestre_code, type_ue, created_at FROM ues WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, $row);
}

function ues_update(int $id): array
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

    $code = trim((string)($body['code'] ?? ''));
    $title = trim((string)($body['title'] ?? ''));
    $credit = array_key_exists('credit', $body) && $body['credit'] !== null && $body['credit'] !== '' ? (float)$body['credit'] : null;
    $semestreCode = isset($body['semestre_code']) ? trim((string)$body['semestre_code']) : null;
    if ($semestreCode === '') {
        $semestreCode = null;
    }
    $typeUe = isset($body['type_ue']) ? trim((string)$body['type_ue']) : null;
    if ($typeUe === '') {
        $typeUe = null;
    }

    $stmt = db()->prepare('UPDATE ues SET code = :code, title = :title, credit = :credit, semestre_code = :semestre_code, type_ue = :type_ue WHERE id = :id');
    try {
        $stmt->execute([
            ':code' => $code,
            ':title' => $title,
            ':credit' => $credit,
            ':semestre_code' => $semestreCode,
            ':type_ue' => $typeUe,
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function ues_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM ues WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, ['ok' => true]);
}

function ecs_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $where = [];
    $params = [];

    $subjectId = isset($_GET['subject_id']) ? (int)$_GET['subject_id'] : 0;
    if ($subjectId > 0) {
        $where[] = 'subject_id = :subject_id';
        $params[':subject_id'] = $subjectId;
    }

    $sql = 'SELECT id, subject_id, code, title, credit, coefficient, created_at FROM ecs';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function ecs_create(): array
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
    $missing = require_fields($body, ['subject_id', 'code', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $subjectId = (int)$body['subject_id'];
    $code = trim((string)$body['code']);
    $title = trim((string)$body['title']);
    $credit = array_key_exists('credit', $body) && $body['credit'] !== null && $body['credit'] !== '' ? (float)$body['credit'] : null;
    $coefficient = array_key_exists('coefficient', $body) && $body['coefficient'] !== null && $body['coefficient'] !== '' ? (float)$body['coefficient'] : null;

    $stmt = db()->prepare('SELECT 1 FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $subjectId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'subject_id']);
    }

    $stmt = db()->prepare('INSERT INTO ecs (subject_id, code, title, credit, coefficient, created_at) VALUES (:subject_id, :code, :title, :credit, :coefficient, :created_at)');
    try {
        $stmt->execute([
            ':subject_id' => $subjectId,
            ':code' => $code,
            ':title' => $title,
            ':credit' => $credit,
            ':coefficient' => $coefficient,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    return respond(201, ['id' => (int)db()->lastInsertId()]);
}

function ecs_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, subject_id, code, title, credit, coefficient, created_at FROM ecs WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, $row);
}

function ecs_update(int $id): array
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
    $missing = require_fields($body, ['subject_id', 'code', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $subjectId = (int)$body['subject_id'];
    $code = trim((string)$body['code']);
    $title = trim((string)$body['title']);
    $credit = array_key_exists('credit', $body) && $body['credit'] !== null && $body['credit'] !== '' ? (float)$body['credit'] : null;
    $coefficient = array_key_exists('coefficient', $body) && $body['coefficient'] !== null && $body['coefficient'] !== '' ? (float)$body['coefficient'] : null;

    $stmt = db()->prepare('SELECT 1 FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $subjectId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'subject_id']);
    }

    $stmt = db()->prepare('UPDATE ecs SET subject_id = :subject_id, code = :code, title = :title, credit = :credit, coefficient = :coefficient WHERE id = :id');
    try {
        $stmt->execute([
            ':subject_id' => $subjectId,
            ':code' => $code,
            ':title' => $title,
            ':credit' => $credit,
            ':coefficient' => $coefficient,
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function ecs_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM ecs WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, ['ok' => true]);
}

function class_subjects_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $where = [];
    $params = [];

    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    if ($classId > 0) {
        $where[] = 'class_id = :class_id';
        $params[':class_id'] = $classId;
    }

    $subjectId = isset($_GET['subject_id']) ? (int)$_GET['subject_id'] : 0;
    if ($subjectId > 0) {
        $where[] = 'subject_id = :subject_id';
        $params[':subject_id'] = $subjectId;
    }

    $sql = 'SELECT id, class_id, subject_id, created_at FROM class_subjects';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function class_subjects_create(): array
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
    $missing = require_fields($body, ['class_id', 'subject_id']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $classId = (int)$body['class_id'];
    $subjectId = (int)$body['subject_id'];

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

    $stmt = db()->prepare('INSERT INTO class_subjects (class_id, subject_id, created_at) VALUES (:class_id, :subject_id, :created_at)');
    try {
        $stmt->execute([
            ':class_id' => $classId,
            ':subject_id' => $subjectId,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'relation_already_exists']);
    }

    return respond(201, ['id' => (int)db()->lastInsertId()]);
}

function class_subjects_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, class_id, subject_id, created_at FROM class_subjects WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, $row);
}

function class_subjects_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM class_subjects WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, ['ok' => true]);
}

function student_class_assignments_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $where = [];
    $params = [];

    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
    if ($studentId > 0) {
        $where[] = 'student_id = :student_id';
        $params[':student_id'] = $studentId;
    }

    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;
    if ($classId > 0) {
        $where[] = 'class_id = :class_id';
        $params[':class_id'] = $classId;
    }

    $sql = 'SELECT id, student_id, class_id, date_affectation, created_at FROM student_class_assignments';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return respond(200, ['items' => $stmt->fetchAll()]);
}

function student_class_assignments_create(): array
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
    $missing = require_fields($body, ['student_id', 'class_id']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $studentId = (int)$body['student_id'];
    $classId = (int)$body['class_id'];
    $dateAffectation = isset($body['date_affectation']) ? trim((string)$body['date_affectation']) : null;
    if ($dateAffectation === '') {
        $dateAffectation = null;
    }

    $stmt = db()->prepare('SELECT 1 FROM students WHERE id = :id');
    $stmt->execute([':id' => $studentId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'student_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM classes WHERE id = :id');
    $stmt->execute([':id' => $classId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'class_id']);
    }

    $stmt = db()->prepare('INSERT INTO student_class_assignments (student_id, class_id, date_affectation, created_at) VALUES (:student_id, :class_id, :date_affectation, :created_at)');
    $stmt->execute([
        ':student_id' => $studentId,
        ':class_id' => $classId,
        ':date_affectation' => $dateAffectation,
        ':created_at' => date(DATE_ATOM),
    ]);

    return respond(201, ['id' => (int)db()->lastInsertId()]);
}

function student_class_assignments_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, student_id, class_id, date_affectation, created_at FROM student_class_assignments WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, $row);
}

function student_class_assignments_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM student_class_assignments WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }
    return respond(200, ['ok' => true]);
}

function teachers_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->query('SELECT id, first_name, last_name, specialite, email, grade, telephone, date_recrutement, statut, created_at FROM teachers ORDER BY id DESC');
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $statut = strtolower(trim((string)($r['statut'] ?? '')));
        $r['is_vacataire'] = ($statut === 'vacataire');
        $r['teacher_type'] = $statut;
    }
    unset($r);

    return respond(200, ['items' => $rows]);
}

function teachers_create(): array
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
    $missing = require_fields($body, ['first_name', 'last_name']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    // Accept teacher_type from frontend without causing validation error
    $teacherType = isset($body['teacher_type']) ? strtolower(trim((string)$body['teacher_type'])) : null;
    if ($teacherType === '') {
        $teacherType = null;
    }

    $isVacataire = (bool)($body['is_vacataire'] ?? false);

    $allowedTypes = ['vacataire', 'luban', 'professionnel', 'academique'];
    $statut = $isVacataire ? 'Vacataire' : 'Academique';

    if ($teacherType !== null) {
        if (!in_array($teacherType, $allowedTypes, true)) {
            return respond(422, ['error' => 'validation_error', 'field' => 'teacher_type']);
        }
        $statut = ucfirst($teacherType);
    }

    if (isset($body['statut'])) {
        $st = strtolower(trim((string)$body['statut']));
        if ($st !== '') {
            if (!in_array($st, array_merge($allowedTypes, ['permanent']), true)) {
                return respond(422, ['error' => 'validation_error', 'field' => 'statut']);
            }
            $statut = ucfirst($st);
        }
    }

    $specialite = isset($body['specialite']) ? trim((string)$body['specialite']) : null;
    if ($specialite === '') {
        $specialite = null;
    }

    $grade = isset($body['grade']) ? trim((string)$body['grade']) : null;
    if ($grade === '') {
        $grade = null;
    }
    $telephone = isset($body['telephone']) ? trim((string)$body['telephone']) : null;
    if ($telephone === '') {
        $telephone = null;
    }
    $dateRecrutement = isset($body['date_recrutement']) ? trim((string)$body['date_recrutement']) : null;
    if ($dateRecrutement === '') {
        $dateRecrutement = null;
    }

    $stmt = db()->prepare('INSERT INTO teachers (matricule, first_name, last_name, email, created_at, specialite, grade, telephone, date_recrutement, statut) VALUES (:matricule, :first_name, :last_name, :email, :created_at, :specialite, :grade, :telephone, :date_recrutement, :statut)');

    $createdAt = date(DATE_ATOM);
    $tries = 0;
    while (true) {
        $tries += 1;
        if ($tries > 8) {
            return respond(409, ['error' => 'matricule_already_exists']);
        }

        $matricule = 'PROF' . str_pad((string)random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        try {
            $stmt->execute([
                ':matricule' => $matricule,
                ':first_name' => trim((string)$body['first_name']),
                ':last_name' => trim((string)$body['last_name']),
                ':email' => isset($body['email']) ? trim((string)$body['email']) : null,
                ':created_at' => $createdAt,
                ':specialite' => $specialite,
                ':grade' => $grade,
                ':telephone' => $telephone,
                ':date_recrutement' => $dateRecrutement,
                ':statut' => $statut,
            ]);
            break;
        } catch (Throwable $e) {
            continue;
        }
    }

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function teachers_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }

    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, first_name, last_name, specialite, email, grade, telephone, date_recrutement, statut, created_at FROM teachers WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    $statut = strtolower(trim((string)($row['statut'] ?? '')));
    $row['is_vacataire'] = ($statut === 'vacataire');
    $row['teacher_type'] = $statut;

    return respond(200, $row);
}

function teachers_update(int $id): array
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

    $specialite = isset($body['specialite']) ? trim((string)$body['specialite']) : null;
    if ($specialite === '') {
        $specialite = null;
    }

    $grade = isset($body['grade']) ? trim((string)$body['grade']) : null;
    if ($grade === '') {
        $grade = null;
    }
    $telephone = isset($body['telephone']) ? trim((string)$body['telephone']) : null;
    if ($telephone === '') {
        $telephone = null;
    }
    $dateRecrutement = isset($body['date_recrutement']) ? trim((string)$body['date_recrutement']) : null;
    if ($dateRecrutement === '') {
        $dateRecrutement = null;
    }

    $teacherType = isset($body['teacher_type']) ? strtolower(trim((string)$body['teacher_type'])) : null;
    if ($teacherType === '') {
        $teacherType = null;
    }

    $isVacataire = (bool)($body['is_vacataire'] ?? false);

    $allowedTypes = ['vacataire', 'luban', 'professionnel', 'academique'];
    $statut = $isVacataire ? 'Vacataire' : 'Academique';

    if ($teacherType !== null) {
        if (!in_array($teacherType, $allowedTypes, true)) {
            return respond(422, ['error' => 'validation_error', 'field' => 'teacher_type']);
        }
        $statut = ucfirst($teacherType);
    }

    if (isset($body['statut'])) {
        $st = strtolower(trim((string)$body['statut']));
        if ($st !== '') {
            if (!in_array($st, array_merge($allowedTypes, ['permanent']), true)) {
                return respond(422, ['error' => 'validation_error', 'field' => 'statut']);
            }
            $statut = ucfirst($st);
        }
    }

    $stmt = db()->prepare('UPDATE teachers SET first_name = :first_name, last_name = :last_name, email = :email, specialite = :specialite, grade = :grade, telephone = :telephone, date_recrutement = :date_recrutement, statut = :statut WHERE id = :id');
    $stmt->execute([
        ':first_name' => trim((string)($body['first_name'] ?? '')),
        ':last_name' => trim((string)($body['last_name'] ?? '')),
        ':email' => isset($body['email']) ? trim((string)$body['email']) : null,
        ':specialite' => $specialite,
        ':grade' => $grade,
        ':telephone' => $telephone,
        ':date_recrutement' => $dateRecrutement,
        ':statut' => $statut,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function teachers_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM teachers WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function semesters_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->query('SELECT id, code, title, created_at FROM semesters ORDER BY id DESC');
    $rows = $stmt->fetchAll();

    return respond(200, ['items' => $rows]);
}

function semesters_create(): array
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
    $missing = require_fields($body, ['code', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $stmt = db()->prepare('INSERT INTO semesters (code, title, created_at) VALUES (:code, :title, :created_at)');
    try {
        $stmt->execute([
            ':code' => trim((string)$body['code']),
            ':title' => trim((string)$body['title']),
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function semesters_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, code, title, created_at FROM semesters WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, $row);
}

function semesters_update(int $id): array
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

    $stmt = db()->prepare('UPDATE semesters SET code = :code, title = :title WHERE id = :id');
    try {
        $stmt->execute([
            ':code' => trim((string)($body['code'] ?? '')),
            ':title' => trim((string)($body['title'] ?? '')),
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function semesters_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM semesters WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function classes_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->query('SELECT id, code, title, created_at FROM classes ORDER BY id DESC');
    $rows = $stmt->fetchAll();

    return respond(200, ['items' => $rows]);
}

function classes_create(): array
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
    $missing = require_fields($body, ['code', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $stmt = db()->prepare('INSERT INTO classes (code, title, created_at) VALUES (:code, :title, :created_at)');
    try {
        $stmt->execute([
            ':code' => trim((string)$body['code']),
            ':title' => trim((string)$body['title']),
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function classes_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, code, title, created_at FROM classes WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, $row);
}

function classes_update(int $id): array
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

    $stmt = db()->prepare('UPDATE classes SET code = :code, title = :title WHERE id = :id');
    try {
        $stmt->execute([
            ':code' => trim((string)($body['code'] ?? '')),
            ':title' => trim((string)($body['title'] ?? '')),
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function classes_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM classes WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function subjects_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->query('SELECT id, code, title, created_at FROM subjects ORDER BY id DESC');
    $rows = $stmt->fetchAll();

    return respond(200, ['items' => $rows]);
}

function subjects_create(): array
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
    $missing = require_fields($body, ['code', 'title']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $stmt = db()->prepare('INSERT INTO subjects (code, title, created_at) VALUES (:code, :title, :created_at)');
    try {
        $stmt->execute([
            ':code' => trim((string)$body['code']),
            ':title' => trim((string)$body['title']),
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function subjects_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, code, title, created_at FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, $row);
}

function subjects_update(int $id): array
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

    $stmt = db()->prepare('UPDATE subjects SET code = :code, title = :title WHERE id = :id');
    try {
        $stmt->execute([
            ':code' => trim((string)($body['code'] ?? '')),
            ':title' => trim((string)($body['title'] ?? '')),
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'code_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function subjects_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM subjects WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function enrollments_list(): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->query('SELECT id, student_id, semester_id, class_id, created_at FROM enrollments ORDER BY id DESC');
    $rows = $stmt->fetchAll();

    return respond(200, ['items' => $rows]);
}

function enrollments_create(): array
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
    $missing = require_fields($body, ['student_id', 'semester_id']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $studentId = (int)$body['student_id'];
    $semesterId = (int)$body['semester_id'];
    $classId = isset($body['class_id']) && $body['class_id'] !== null && $body['class_id'] !== '' ? (int)$body['class_id'] : null;

    $stmt = db()->prepare('SELECT 1 FROM students WHERE id = :id');
    $stmt->execute([':id' => $studentId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'student_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM semesters WHERE id = :id');
    $stmt->execute([':id' => $semesterId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'semester_id']);
    }

    if ($classId !== null) {
        $stmt = db()->prepare('SELECT 1 FROM classes WHERE id = :id');
        $stmt->execute([':id' => $classId]);
        if (!$stmt->fetch()) {
            return respond(422, ['error' => 'validation_error', 'field' => 'class_id']);
        }
    }

    $stmt = db()->prepare('INSERT INTO enrollments (student_id, semester_id, class_id, created_at) VALUES (:student_id, :semester_id, :class_id, :created_at)');
    try {
        $stmt->execute([
            ':student_id' => $studentId,
            ':semester_id' => $semesterId,
            ':class_id' => $classId,
            ':created_at' => date(DATE_ATOM),
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'enrollment_already_exists']);
    }

    $id = (int)db()->lastInsertId();
    return respond(201, ['id' => $id]);
}

function enrollments_get(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('SELECT id, student_id, semester_id, class_id, created_at FROM enrollments WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!is_array($row)) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, $row);
}

function enrollments_update(int $id): array
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
    $missing = require_fields($body, ['student_id', 'semester_id']);
    if ($missing) {
        return respond(422, ['error' => 'validation_error', 'missing' => $missing]);
    }

    $studentId = (int)$body['student_id'];
    $semesterId = (int)$body['semester_id'];
    $classId = isset($body['class_id']) && $body['class_id'] !== null && $body['class_id'] !== '' ? (int)$body['class_id'] : null;

    $stmt = db()->prepare('SELECT 1 FROM students WHERE id = :id');
    $stmt->execute([':id' => $studentId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'student_id']);
    }

    $stmt = db()->prepare('SELECT 1 FROM semesters WHERE id = :id');
    $stmt->execute([':id' => $semesterId]);
    if (!$stmt->fetch()) {
        return respond(422, ['error' => 'validation_error', 'field' => 'semester_id']);
    }

    if ($classId !== null) {
        $stmt = db()->prepare('SELECT 1 FROM classes WHERE id = :id');
        $stmt->execute([':id' => $classId]);
        if (!$stmt->fetch()) {
            return respond(422, ['error' => 'validation_error', 'field' => 'class_id']);
        }
    }

    $stmt = db()->prepare('UPDATE enrollments SET student_id = :student_id, semester_id = :semester_id, class_id = :class_id WHERE id = :id');
    try {
        $stmt->execute([
            ':student_id' => $studentId,
            ':semester_id' => $semesterId,
            ':class_id' => $classId,
            ':id' => $id,
        ]);
    } catch (Throwable $e) {
        return respond(409, ['error' => 'enrollment_already_exists']);
    }

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function enrollments_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM enrollments WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}

function students_delete(int $id): array
{
    $u = auth_user();
    if ($u === null) {
        return respond(401, ['error' => 'unauthorized']);
    }
    $forbidden = require_role($u, ['admin', 'prof']);
    if ($forbidden) {
        return $forbidden;
    }

    $stmt = db()->prepare('DELETE FROM students WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return respond(404, ['error' => 'not_found']);
    }

    return respond(200, ['ok' => true]);
}
