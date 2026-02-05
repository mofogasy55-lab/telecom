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
        $pdo->exec('CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TEXT NOT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            matricule VARCHAR(255) NOT NULL UNIQUE,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            semester VARCHAR(50) NULL,
            created_at TEXT NOT NULL,
            track_category VARCHAR(100) NULL,
            track_level VARCHAR(100) NULL,
            date_naissance TEXT NULL,
            adresse TEXT NULL,
            telephone TEXT NULL,
            email TEXT NULL,
            photo TEXT NULL,
            sexe TEXT NULL,
            lieu_naissance TEXT NULL,
            cin TEXT NULL,
            situation_familiale TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS teachers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            matricule VARCHAR(255) NOT NULL UNIQUE,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email TEXT NULL,
            created_at TEXT NOT NULL,
            grade TEXT NULL,
            specialite TEXT NULL,
            telephone TEXT NULL,
            statut TEXT NULL,
            date_recrutement TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS semesters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL,
            numero_semestre INT NULL,
            date_debut TEXT NULL,
            date_fin TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS classes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(100) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL,
            niveau TEXT NULL,
            effectif_max INT NULL,
            salle_principale TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(100) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL,
            type_matiere TEXT NULL,
            coefficient DOUBLE NULL,
            credit_ects DOUBLE NULL,
            volume_horaire_total DOUBLE NULL,
            description TEXT NULL,
            ue_id INT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS enrollments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            semester_id INT NOT NULL,
            class_id INT NULL,
            created_at TEXT NOT NULL,
            date_inscription TEXT NULL,
            statut_inscription TEXT NULL,
            UNIQUE(student_id, semester_id),
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS ues (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(100) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            credit DOUBLE NULL,
            semestre_code TEXT NULL,
            type_ue TEXT NULL,
            created_at TEXT NOT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS ecs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            subject_id INT NOT NULL,
            code VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            credit DOUBLE NULL,
            coefficient DOUBLE NULL,
            created_at TEXT NOT NULL,
            UNIQUE(subject_id, code),
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS class_subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(class_id, subject_id),
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS student_class_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            class_id INT NOT NULL,
            date_affectation TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS timetable_entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            semester_id INT NOT NULL,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            day_of_week INT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            room TEXT NULL,
            mode TEXT NULL,
            online_url TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            semester_id INT NOT NULL,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            resource_url TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS assessments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            semester_id INT NOT NULL,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            kind VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            assessment_date TEXT NULL,
            max_score DOUBLE NULL,
            coefficient DOUBLE NULL,
            is_public TINYINT(1) NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS grades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assessment_id INT NOT NULL,
            student_id INT NOT NULL,
            score DOUBLE NOT NULL,
            comment TEXT NULL,
            graded_at TEXT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(assessment_id, student_id),
            FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
        )');

        db_seed($pdo, $driver);
        return;
    }

    if ($driver === 'pgsql') {
        $pdo->exec('CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            matricule TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            semester TEXT NULL,
            created_at TEXT NOT NULL,
            track_category TEXT NULL,
            track_level TEXT NULL,
            date_naissance TEXT NULL,
            adresse TEXT NULL,
            telephone TEXT NULL,
            email TEXT NULL,
            photo TEXT NULL,
            sexe TEXT NULL,
            lieu_naissance TEXT NULL,
            cin TEXT NULL,
            situation_familiale TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS teachers (
            id SERIAL PRIMARY KEY,
            matricule TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NULL,
            created_at TEXT NOT NULL,
            grade TEXT NULL,
            specialite TEXT NULL,
            telephone TEXT NULL,
            statut TEXT NULL,
            date_recrutement TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS semesters (
            id SERIAL PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL,
            numero_semestre INT NULL,
            date_debut TEXT NULL,
            date_fin TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS classes (
            id SERIAL PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL,
            niveau TEXT NULL,
            effectif_max INT NULL,
            salle_principale TEXT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS subjects (
            id SERIAL PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL,
            type_matiere TEXT NULL,
            coefficient DOUBLE PRECISION NULL,
            credit_ects DOUBLE PRECISION NULL,
            volume_horaire_total DOUBLE PRECISION NULL,
            description TEXT NULL,
            ue_id INT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS enrollments (
            id SERIAL PRIMARY KEY,
            student_id INT NOT NULL,
            semester_id INT NOT NULL,
            class_id INT NULL,
            created_at TEXT NOT NULL,
            date_inscription TEXT NULL,
            statut_inscription TEXT NULL,
            UNIQUE(student_id, semester_id),
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS ues (
            id SERIAL PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            credit DOUBLE PRECISION NULL,
            semestre_code TEXT NULL,
            type_ue TEXT NULL,
            created_at TEXT NOT NULL
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS ecs (
            id SERIAL PRIMARY KEY,
            subject_id INT NOT NULL,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            credit DOUBLE PRECISION NULL,
            coefficient DOUBLE PRECISION NULL,
            created_at TEXT NOT NULL,
            UNIQUE(subject_id, code),
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS class_subjects (
            id SERIAL PRIMARY KEY,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(class_id, subject_id),
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS student_class_assignments (
            id SERIAL PRIMARY KEY,
            student_id INT NOT NULL,
            class_id INT NOT NULL,
            date_affectation TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS timetable_entries (
            id SERIAL PRIMARY KEY,
            semester_id INT NOT NULL,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            day_of_week INT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            room TEXT NULL,
            mode TEXT NULL,
            online_url TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            semester_id INT NOT NULL,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NULL,
            resource_url TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS assessments (
            id SERIAL PRIMARY KEY,
            semester_id INT NOT NULL,
            class_id INT NOT NULL,
            subject_id INT NOT NULL,
            teacher_id INT NOT NULL,
            kind TEXT NOT NULL,
            title TEXT NOT NULL,
            assessment_date TEXT NULL,
            max_score DOUBLE PRECISION NULL,
            coefficient DOUBLE PRECISION NULL,
            is_public BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS grades (
            id SERIAL PRIMARY KEY,
            assessment_id INT NOT NULL,
            student_id INT NOT NULL,
            score DOUBLE PRECISION NOT NULL,
            comment TEXT NULL,
            graded_at TEXT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(assessment_id, student_id),
            FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
        )');

        db_seed($pdo, $driver);
        return;
    }

    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matricule TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        semester TEXT NULL,
        created_at TEXT NOT NULL
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matricule TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NULL,
        created_at TEXT NOT NULL
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        semester_id INTEGER NOT NULL,
        class_id INTEGER NULL,
        created_at TEXT NOT NULL,
        UNIQUE(student_id, semester_id),
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS ues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        credit REAL NULL,
        semestre_code TEXT NULL,
        type_ue TEXT NULL,
        created_at TEXT NOT NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS ecs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        credit REAL NULL,
        coefficient REAL NULL,
        created_at TEXT NOT NULL,
        UNIQUE(subject_id, code),
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS class_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(class_id, subject_id),
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS student_class_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        date_affectation TEXT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS timetable_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        room TEXT NULL,
        mode TEXT NULL,
        online_url TEXT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        resource_url TEXT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        assessment_date TEXT NULL,
        max_score REAL NULL,
        coefficient REAL NULL,
        is_public INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )');

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

    $pdo->exec('CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        score REAL NOT NULL,
        comment TEXT NULL,
        graded_at TEXT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(assessment_id, student_id),
        FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    )');

    db_seed($pdo, $driver);
}

function db_seed(PDO $pdo, ?string $driver): void
{
    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM users')->fetch()['c'];
    if ($count === 0) {
        $hash = password_hash('0000000', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, role, created_at) VALUES (:email, :hash, :role, :created_at)');
        $stmt->execute([':email' => 'admin@espa.local', ':hash' => $hash, ':role' => 'admin', ':created_at' => date(DATE_ATOM)]);
        $stmt->execute([':email' => 'prof@espa.local', ':hash' => $hash, ':role' => 'prof', ':created_at' => date(DATE_ATOM)]);
        $stmt->execute([':email' => 'prof2@espa.local', ':hash' => $hash, ':role' => 'prof', ':created_at' => date(DATE_ATOM)]);
        $stmt->execute([':email' => 'etu@espa.local', ':hash' => $hash, ':role' => 'etudiant', ':created_at' => date(DATE_ATOM)]);
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM teachers')->fetch()['c'];
    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO teachers (matricule, first_name, last_name, email, created_at, grade, specialite, telephone, statut, date_recrutement) VALUES (:matricule, :first_name, :last_name, :email, :created_at, :grade, :specialite, :telephone, :statut, :date_recrutement)');
        $stmt->execute([
            ':matricule' => 'PROF001',
            ':first_name' => 'Aina',
            ':last_name' => 'Rakoto',
            ':email' => 'prof@espa.local',
            ':created_at' => date(DATE_ATOM),
            ':grade' => 'MCF',
            ':specialite' => 'Réseaux',
            ':telephone' => '0340000001',
            ':statut' => 'Permanent',
            ':date_recrutement' => '2020-01-15',
        ]);
        $stmt->execute([
            ':matricule' => 'PROF002',
            ':first_name' => 'Mamy',
            ':last_name' => 'Andry',
            ':email' => 'prof2@espa.local',
            ':created_at' => date(DATE_ATOM),
            ':grade' => 'Assistant',
            ':specialite' => 'Télécom',
            ':telephone' => '0340000002',
            ':statut' => 'Vacataire',
            ':date_recrutement' => '2022-09-01',
        ]);
        $stmt->execute([
            ':matricule' => 'PROF003',
            ':first_name' => 'Soa',
            ':last_name' => 'Nirina',
            ':email' => 'prof3@espa.local',
            ':created_at' => date(DATE_ATOM),
            ':grade' => 'MCF',
            ':specialite' => 'Systèmes',
            ':telephone' => '0340000003',
            ':statut' => 'Permanent',
            ':date_recrutement' => '2019-03-05',
        ]);
        $stmt->execute([
            ':matricule' => 'PROF004',
            ':first_name' => 'Tiana',
            ':last_name' => 'Hery',
            ':email' => 'prof4@espa.local',
            ':created_at' => date(DATE_ATOM),
            ':grade' => 'Docteur',
            ':specialite' => 'Sécurité',
            ':telephone' => '0340000004',
            ':statut' => 'Permanent',
            ':date_recrutement' => '2021-06-20',
        ]);
        $stmt->execute([
            ':matricule' => 'PROF005',
            ':first_name' => 'Fara',
            ':last_name' => 'Kanto',
            ':email' => 'prof5@espa.local',
            ':created_at' => date(DATE_ATOM),
            ':grade' => 'Assistant',
            ':specialite' => 'Dév Web',
            ':telephone' => '0340000005',
            ':statut' => 'Vacataire',
            ':date_recrutement' => '2023-02-10',
        ]);
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM students')->fetch()['c'];
    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO students (matricule, first_name, last_name, semester, created_at, track_category, track_level, email) VALUES (:matricule, :first_name, :last_name, :semester, :created_at, :track_category, :track_level, :email)');
        $stmt->execute([
            ':matricule' => 'ETU0001',
            ':first_name' => 'Etu',
            ':last_name' => 'Demo',
            ':semester' => 'S1',
            ':created_at' => date(DATE_ATOM),
            ':track_category' => 'academique',
            ':track_level' => 'Licence 1',
            ':email' => 'etu@espa.local',
        ]);
        for ($i = 2; $i <= 12; $i += 1) {
            $lvl = $i % 2 === 0 ? 'Licence 1' : 'Licence 2';
            $stmt->execute([
                ':matricule' => sprintf('ETU%04d', $i),
                ':first_name' => 'Etudiant',
                ':last_name' => 'Test' . $i,
                ':semester' => 'S1',
                ':created_at' => date(DATE_ATOM),
                ':track_category' => 'academique',
                ':track_level' => $lvl,
                ':email' => null,
            ]);
        }
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM semesters')->fetch()['c'];
    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO semesters (code, title, created_at, numero_semestre, date_debut, date_fin) VALUES (:code, :title, :created_at, :numero_semestre, :date_debut, :date_fin)');
        for ($i = 1; $i <= 6; $i += 1) {
            $stmt->execute([
                ':code' => 'S' . $i,
                ':title' => 'Semestre ' . $i,
                ':created_at' => date(DATE_ATOM),
                ':numero_semestre' => $i,
                ':date_debut' => '2025-01-01',
                ':date_fin' => '2025-06-30',
            ]);
        }
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM classes')->fetch()['c'];
    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO classes (code, title, created_at, niveau, effectif_max, salle_principale) VALUES (:code, :title, :created_at, :niveau, :effectif_max, :salle_principale)');
        $stmt->execute([':code' => 'L1-ACAD', ':title' => 'Licence 1 Académique', ':created_at' => date(DATE_ATOM), ':niveau' => 'Licence 1', ':effectif_max' => 40, ':salle_principale' => 'A1']);
        $stmt->execute([':code' => 'L2-ACAD', ':title' => 'Licence 2 Académique', ':created_at' => date(DATE_ATOM), ':niveau' => 'Licence 2', ':effectif_max' => 40, ':salle_principale' => 'A2']);
        $stmt->execute([':code' => 'L1-PRO', ':title' => 'LicencePro 1', ':created_at' => date(DATE_ATOM), ':niveau' => 'LicencePro 1', ':effectif_max' => 30, ':salle_principale' => 'P1']);
        $stmt->execute([':code' => 'LUB-1', ':title' => 'Luban - Niveau 1', ':created_at' => date(DATE_ATOM), ':niveau' => 'Luban', ':effectif_max' => 25, ':salle_principale' => 'L1']);
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM subjects')->fetch()['c'];
    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO subjects (code, title, created_at, type_matiere, coefficient, credit_ects, volume_horaire_total, description, ue_id) VALUES (:code, :title, :created_at, :type_matiere, :coefficient, :credit_ects, :volume_horaire_total, :description, :ue_id)');
        for ($i = 1; $i <= 20; $i += 1) {
            $stmt->execute([
                ':code' => 'MAT' . str_pad((string)$i, 2, '0', STR_PAD_LEFT),
                ':title' => 'Matière ' . $i,
                ':created_at' => date(DATE_ATOM),
                ':type_matiere' => 'UE',
                ':coefficient' => 1,
                ':credit_ects' => 3,
                ':volume_horaire_total' => 24,
                ':description' => null,
                ':ue_id' => null,
            ]);
        }
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM timetable_entries')->fetch()['c'];
    if ($count === 0) {
        $teacherIds = $pdo->query('SELECT id FROM teachers ORDER BY id ASC')->fetchAll();
        $classIds = $pdo->query('SELECT id FROM classes ORDER BY id ASC')->fetchAll();
        $subjectIds = $pdo->query('SELECT id FROM subjects ORDER BY id ASC')->fetchAll();
        $semesterIdRow = $pdo->query("SELECT id FROM semesters WHERE code = 'S1' LIMIT 1")->fetch();
        $semesterId = (int)($semesterIdRow['id'] ?? 1);

        $stmt = $pdo->prepare('INSERT INTO timetable_entries (semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at) VALUES (:semester_id, :class_id, :subject_id, :teacher_id, :day_of_week, :start_time, :end_time, :room, :mode, :online_url, :created_at)');
        $slots = [
            ['08:00', '10:00'],
            ['10:00', '12:00'],
            ['14:00', '16:00'],
        ];
        $days = [1, 2, 3, 4, 5, 6];

        $ti = 0;
        foreach ($teacherIds as $tRow) {
            $tid = (int)$tRow['id'];
            for ($k = 0; $k < 3; $k += 1) {
                $day = $days[($ti + $k) % count($days)];
                [$st, $et] = $slots[($ti + $k) % count($slots)];
                $cid = (int)$classIds[($ti + $k) % count($classIds)]['id'];
                $sid = (int)$subjectIds[($ti + $k * 2) % count($subjectIds)]['id'];
                $stmt->execute([
                    ':semester_id' => $semesterId,
                    ':class_id' => $cid,
                    ':subject_id' => $sid,
                    ':teacher_id' => $tid,
                    ':day_of_week' => $day,
                    ':start_time' => $st,
                    ':end_time' => $et,
                    ':room' => 'Salle ' . ($k + 1),
                    ':mode' => 'presentiel',
                    ':online_url' => null,
                    ':created_at' => date(DATE_ATOM),
                ]);
            }
            $ti += 1;
        }
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM assessments')->fetch()['c'];
    if ($count === 0) {
        $teacherIds = $pdo->query('SELECT id FROM teachers ORDER BY id ASC')->fetchAll();
        $classIds = $pdo->query('SELECT id FROM classes ORDER BY id ASC')->fetchAll();
        $subjectIds = $pdo->query('SELECT id FROM subjects ORDER BY id ASC')->fetchAll();
        $semesterIdRow = $pdo->query("SELECT id FROM semesters WHERE code = 'S1' LIMIT 1")->fetch();
        $semesterId = (int)($semesterIdRow['id'] ?? 1);

        $stmt = $pdo->prepare('INSERT INTO assessments (semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at) VALUES (:semester_id, :class_id, :subject_id, :teacher_id, :kind, :title, :assessment_date, :max_score, :coefficient, :is_public, :created_at)');
        $i = 0;
        foreach ($teacherIds as $tRow) {
            $tid = (int)$tRow['id'];
            for ($k = 0; $k < 4; $k += 1) {
                $cid = (int)$classIds[($i + $k) % count($classIds)]['id'];
                $sid = (int)$subjectIds[($i + $k) % count($subjectIds)]['id'];
                $stmt->execute([
                    ':semester_id' => $semesterId,
                    ':class_id' => $cid,
                    ':subject_id' => $sid,
                    ':teacher_id' => $tid,
                    ':kind' => $k % 2 === 0 ? 'exam' : 'tp',
                    ':title' => ($k % 2 === 0 ? 'Examen' : 'TP') . ' ' . ($k + 1),
                    ':assessment_date' => '2025-02-' . str_pad((string)(10 + $k), 2, '0', STR_PAD_LEFT),
                    ':max_score' => 20,
                    ':coefficient' => 1,
                    ':is_public' => 1,
                    ':created_at' => date(DATE_ATOM),
                ]);
            }
            $i += 1;
        }
    }

    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM grades')->fetch()['c'];
    if ($count === 0) {
        $studentIds = $pdo->query('SELECT id FROM students ORDER BY id ASC')->fetchAll();
        $assIds = $pdo->query('SELECT id FROM assessments ORDER BY id ASC')->fetchAll();
        $stmt = $pdo->prepare('INSERT INTO grades (assessment_id, student_id, score, comment, graded_at, created_at) VALUES (:assessment_id, :student_id, :score, :comment, :graded_at, :created_at)');
        for ($i = 0; $i < min(8, count($studentIds)); $i += 1) {
            $sid = (int)$studentIds[$i]['id'];
            for ($k = 0; $k < min(10, count($assIds)); $k += 1) {
                $aid = (int)$assIds[($i + $k) % count($assIds)]['id'];
                $stmt->execute([
                    ':assessment_id' => $aid,
                    ':student_id' => $sid,
                    ':score' => 8 + (($i + $k) % 13),
                    ':comment' => ($k % 4 === 0) ? 'Bon travail' : null,
                    ':graded_at' => '2025-02-20',
                    ':created_at' => date(DATE_ATOM),
                ]);
            }
        }
    }
}
