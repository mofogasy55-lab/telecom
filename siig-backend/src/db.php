<?php

declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = env('DB_DSN', 'sqlite:' . __DIR__ . '/../storage/app.db');
    $user = env('DB_USER', null);
    $pass = env('DB_PASS', null);

    $pdo = new PDO($dsn, $user ?? '', $pass ?? '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $driver = null;
    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    } catch (Throwable $e) {
        $driver = null;
    }

    if ($driver === 'sqlite') {
        $pdo->exec('PRAGMA foreign_keys = ON');
    }

    return $pdo;
}

function db_apply_sql_file(PDO $pdo, string $filePath): void
{
    $sql = file_get_contents($filePath);
    if ($sql === false) {
        throw new RuntimeException('Cannot read SQL file: ' . $filePath);
    }

    $sql = trim($sql);
    if ($sql === '') {
        return;
    }

    $parts = preg_split('/;\s*\R/', $sql);
    if (!is_array($parts)) {
        $pdo->exec($sql);
        return;
    }

    foreach ($parts as $part) {
        $stmtSql = trim((string)$part);
        if ($stmtSql === '') {
            continue;
        }
        $pdo->exec($stmtSql);
    }
}

function db_sqlite_sync_columns(PDO $pdo): void
{
    $cols = $pdo->query('PRAGMA table_info(students)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['track_category'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN track_category TEXT NULL');
    }
    if (!isset($colNames['track_level'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN track_level TEXT NULL');
    }
    if (!isset($colNames['date_naissance'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN date_naissance TEXT NULL');
    }
    if (!isset($colNames['adresse'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN adresse TEXT NULL');
    }
    if (!isset($colNames['telephone'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN telephone TEXT NULL');
    }
    if (!isset($colNames['email'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN email TEXT NULL');
    }
    if (!isset($colNames['photo'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN photo TEXT NULL');
    }
    if (!isset($colNames['sexe'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN sexe TEXT NULL');
    }
    if (!isset($colNames['lieu_naissance'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN lieu_naissance TEXT NULL');
    }
    if (!isset($colNames['cin'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN cin TEXT NULL');
    }
    if (!isset($colNames['situation_familiale'])) {
        $pdo->exec('ALTER TABLE students ADD COLUMN situation_familiale TEXT NULL');
    }

    $cols = $pdo->query('PRAGMA table_info(teachers)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['grade'])) {
        $pdo->exec('ALTER TABLE teachers ADD COLUMN grade TEXT NULL');
    }
    if (!isset($colNames['specialite'])) {
        $pdo->exec('ALTER TABLE teachers ADD COLUMN specialite TEXT NULL');
    }
    if (!isset($colNames['telephone'])) {
        $pdo->exec('ALTER TABLE teachers ADD COLUMN telephone TEXT NULL');
    }
    if (!isset($colNames['statut'])) {
        $pdo->exec('ALTER TABLE teachers ADD COLUMN statut TEXT NULL');
    }
    if (!isset($colNames['date_recrutement'])) {
        $pdo->exec('ALTER TABLE teachers ADD COLUMN date_recrutement TEXT NULL');
    }

    $cols = $pdo->query('PRAGMA table_info(semesters)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['numero_semestre'])) {
        $pdo->exec('ALTER TABLE semesters ADD COLUMN numero_semestre INTEGER NULL');
    }
    if (!isset($colNames['date_debut'])) {
        $pdo->exec('ALTER TABLE semesters ADD COLUMN date_debut TEXT NULL');
    }
    if (!isset($colNames['date_fin'])) {
        $pdo->exec('ALTER TABLE semesters ADD COLUMN date_fin TEXT NULL');
    }

    $cols = $pdo->query('PRAGMA table_info(classes)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['niveau'])) {
        $pdo->exec('ALTER TABLE classes ADD COLUMN niveau TEXT NULL');
    }
    if (!isset($colNames['effectif_max'])) {
        $pdo->exec('ALTER TABLE classes ADD COLUMN effectif_max INTEGER NULL');
    }
    if (!isset($colNames['salle_principale'])) {
        $pdo->exec('ALTER TABLE classes ADD COLUMN salle_principale TEXT NULL');
    }

    $cols = $pdo->query('PRAGMA table_info(subjects)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['type_matiere'])) {
        $pdo->exec('ALTER TABLE subjects ADD COLUMN type_matiere TEXT NULL');
    }
    if (!isset($colNames['coefficient'])) {
        $pdo->exec('ALTER TABLE subjects ADD COLUMN coefficient REAL NULL');
    }
    if (!isset($colNames['credit_ects'])) {
        $pdo->exec('ALTER TABLE subjects ADD COLUMN credit_ects REAL NULL');
    }
    if (!isset($colNames['volume_horaire_total'])) {
        $pdo->exec('ALTER TABLE subjects ADD COLUMN volume_horaire_total REAL NULL');
    }
    if (!isset($colNames['description'])) {
        $pdo->exec('ALTER TABLE subjects ADD COLUMN description TEXT NULL');
    }
    if (!isset($colNames['ue_id'])) {
        $pdo->exec('ALTER TABLE subjects ADD COLUMN ue_id INTEGER NULL');
    }

    $cols = $pdo->query('PRAGMA table_info(enrollments)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['date_inscription'])) {
        $pdo->exec('ALTER TABLE enrollments ADD COLUMN date_inscription TEXT NULL');
    }
    if (!isset($colNames['statut_inscription'])) {
        $pdo->exec('ALTER TABLE enrollments ADD COLUMN statut_inscription TEXT NULL');
    }

    $cols = $pdo->query('PRAGMA table_info(assessments)')->fetchAll();
    $colNames = [];
    foreach ($cols as $c) {
        if (isset($c['name'])) {
            $colNames[(string)$c['name']] = true;
        }
    }
    if (!isset($colNames['is_public'])) {
        $pdo->exec('ALTER TABLE assessments ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1');
    }

    // New tables (MVP) - safe to run multiple times
    $pdo->exec('CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NULL,
      teacher_id INTEGER NULL,
      session_date TEXT NOT NULL,
      start_time TEXT NULL,
      end_time TEXT NULL,
      notes TEXT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
      FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
      FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS attendance_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      remark TEXT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(session_id, student_id),
      FOREIGN KEY(session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_date TEXT NOT NULL,
      semester_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NULL,
      teacher_id INTEGER NULL,
      title TEXT NOT NULL,
      notes TEXT NULL,
      created_by_user_id INTEGER NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
      FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
      FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
      FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS semester_months (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER NOT NULL,
      month_index INTEGER NOT NULL,
      label TEXT NOT NULL,
      start_date TEXT NULL,
      end_date TEXT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(semester_id, month_index),
      FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS semester_class_subject_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      month_index INTEGER NOT NULL,
      slot_index INTEGER NOT NULL,
      subject_id INTEGER NULL,
      tp INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NULL,
      UNIQUE(semester_id, class_id, month_index, slot_index),
      FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
      FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS course_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      matiere_a_finir INTEGER NULL,
      en_cours INTEGER NULL,
      created_at TEXT NOT NULL,
      UNIQUE(semester_id, class_id, subject_id),
      FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
      FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )');
}

function db_init(): void
{
    $pdo = db();

    $driver = null;
    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    } catch (Throwable $e) {
        $driver = null;
    }

    if ($driver === 'mysql') {
        $sqlPath = __DIR__ . '/../db.mysql.sql';
        db_apply_sql_file($pdo, $sqlPath);
        return;
    }

    if ($driver === 'pgsql') {
        $sqlPath = __DIR__ . '/../db.pgsql.sql';
        db_apply_sql_file($pdo, $sqlPath);
        return;
    }

    $sqlPath = __DIR__ . '/../db.sql';
    db_apply_sql_file($pdo, $sqlPath);
    db_sqlite_sync_columns($pdo);
    return;
}
