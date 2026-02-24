CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  from_user_id INT NULL,
  to_teacher_id INT NULL,
  subject TEXT NULL,
  body TEXT NOT NULL,
  is_read TINYINT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  approved_at TEXT NULL,
  approved_by_user_id INT NULL,
  INDEX(from_user_id),
  INDEX(to_teacher_id),
  INDEX(approved_by_user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teachers (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  created_at TEXT NOT NULL,
  numero_semestre INT NULL,
  date_debut TEXT NULL,
  date_fin TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  created_at TEXT NOT NULL,
  niveau TEXT NULL,
  effectif_max INT NULL,
  salle_principale TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollments (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  credit DOUBLE NULL,
  semestre_code TEXT NULL,
  type_ue TEXT NULL,
  created_at TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ecs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  code VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  credit DOUBLE NULL,
  coefficient DOUBLE NULL,
  created_at TEXT NOT NULL,
  UNIQUE(subject_id, code),
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS class_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(class_id, subject_id),
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester_months (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  month_index INT NOT NULL,
  label VARCHAR(50) NOT NULL,
  start_date TEXT NULL,
  end_date TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(semester_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester_class_subject_plan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  month_index INT NOT NULL,
  slot_index INT NOT NULL,
  subject_id INT NULL,
  tp TINYINT(1) NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NULL,
  UNIQUE(semester_id, class_id, month_index, slot_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester_class_grade_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  month_index INT NOT NULL,
  avg_score DOUBLE NULL,
  global_comment TEXT NULL,
  graded_at TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NULL,
  UNIQUE(semester_id, class_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester_class_attendance_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  month_index INT NOT NULL,
  present_count INT NULL,
  absent_count INT NULL,
  late_count INT NULL,
  total_count INT NULL,
  global_comment TEXT NULL,
  updated_at TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(semester_id, class_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester_class_tp_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  month_index INT NOT NULL,
  tp_count INT NOT NULL DEFAULT 0,
  avg_score DOUBLE NULL,
  global_comment TEXT NULL,
  updated_at TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(semester_id, class_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_class_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  date_affectation TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetable_entries (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessments (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grades (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  subject_id INT NULL,
  teacher_id INT NULL,
  session_date TEXT NOT NULL,
  start_time TEXT NULL,
  end_time TEXT NULL,
  notes TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  student_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  remark TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(session_id, student_id),
  FOREIGN KEY(session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_date TEXT NOT NULL,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  subject_id INT NULL,
  teacher_id INT NULL,
  title VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  created_by_user_id INT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester_id INT NOT NULL,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  matiere_a_finir INT NULL,
  en_cours INT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(semester_id, class_id, subject_id),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  subject_id INT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(teacher_id, subject_id),
  FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_availability_sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  valid_from TEXT NOT NULL,
  valid_to TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_availabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  availability_set_id INT NOT NULL,
  day_of_week INT NOT NULL,
  time_ranges TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(availability_set_id, day_of_week),
  FOREIGN KEY(availability_set_id) REFERENCES teacher_availability_sets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (id, email, password_hash, role, created_at) VALUES
  (1, 'admin@espa.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2026-01-01T00:00:00+00:00'),
  (2, 'prof@espa.local',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'prof',  '2026-01-01T00:00:00+00:00'),
  (3, 'prof2@espa.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'prof',  '2026-01-01T00:00:00+00:00'),
  (4, 'etu@espa.local',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'etudiant', '2026-01-01T00:00:00+00:00'),
  (5, 'admin2@espa.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO teachers (id, matricule, first_name, last_name, email, created_at, grade, specialite, telephone, statut, date_recrutement) VALUES
  (1, 'PROF001', 'Aina', 'Rakoto', 'prof@espa.local',  '2026-01-01T00:00:00+00:00', 'MCF', 'Réseaux',  '0340000001', 'Permanent', '2020-01-15'),
  (2, 'PROF002', 'Mamy', 'Andry',  'prof2@espa.local', '2026-01-01T00:00:00+00:00', 'Assistant', 'Télécom', '0340000002', 'Vacataire', '2022-09-01')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO students (id, matricule, first_name, last_name, semester, created_at, track_category, track_level, email) VALUES
  (1, 'ETU0001', 'Etu', 'Demo', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'Licence 1', 'etu@espa.local'),
  (2, 'ETU0002', 'Nina', 'Raso', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'Licence 1', 'etu2@espa.local'),
  (3, 'ETU0003', 'Tovo', 'Koto', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'Licence 1', 'etu3@espa.local'),
  (4, 'ETU0004', 'Mina', 'Ando', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LicencePro 1', 'etu4@espa.local'),
  (5, 'ETU0005', 'Fara', 'Rija', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LicencePro 1', 'etu5@espa.local')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semesters (id, code, title, created_at, numero_semestre, date_debut, date_fin) VALUES
  (1, 'S1', 'Semestre 1', '2026-01-01T00:00:00+00:00', 1, '2026-01-01', '2026-06-30'),
  (2, 'S2', 'Semestre 2', '2026-01-01T00:00:00+00:00', 2, '2026-01-01', '2026-06-30')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO classes (id, code, title, created_at, niveau, effectif_max, salle_principale) VALUES
  (1, 'L1-ACAD', 'Licence 1 Académique', '2026-01-01T00:00:00+00:00', 'Licence 1', 40, 'A1'),
  (2, 'L1-PRO',  'LicencePro 1',          '2026-01-01T00:00:00+00:00', 'LicencePro 1', 30, 'P1')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO classes (id, code, title, created_at, niveau, effectif_max, salle_principale) VALUES
  (10, 'L1', 'Licence 1 (Académique)', '2026-01-01T00:00:00+00:00', 'L1', 40, 'A1'),
  (11, 'LP1', 'Licence Pro 1', '2026-01-01T00:00:00+00:00', 'LP1', 30, 'P1'),
  (12, 'LUB1', 'Licence UB 1', '2026-01-01T00:00:00+00:00', 'LUB1', 35, 'B1'),
  (13, 'L2', 'Licence 2 (Académique)', '2026-01-01T00:00:00+00:00', 'L2', 40, 'A2'),
  (14, 'LP2', 'Licence Pro 2', '2026-01-01T00:00:00+00:00', 'LP2', 30, 'P2'),
  (15, 'LUB2', 'Licence UB 2', '2026-01-01T00:00:00+00:00', 'LUB2', 35, 'B2'),
  (16, 'L3', 'Licence 3 (Académique)', '2026-01-01T00:00:00+00:00', 'L3', 40, 'A3'),
  (17, 'LP3', 'Licence Pro 3', '2026-01-01T00:00:00+00:00', 'LP3', 30, 'P3'),
  (18, 'LUB3', 'Licence UB 3', '2026-01-01T00:00:00+00:00', 'LUB3', 35, 'B3'),
  (19, 'M1', 'Master 1', '2026-01-01T00:00:00+00:00', 'M1', 30, 'M1'),
  (20, 'MP1', 'Master Pro 1', '2026-01-01T00:00:00+00:00', 'MP1', 25, 'MP1'),
  (21, 'MP2', 'Master Pro 2', '2026-01-01T00:00:00+00:00', 'MP2', 25, 'MP2')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO subjects (id, code, title, created_at, type_matiere, coefficient, credit_ects, volume_horaire_total) VALUES
  (1, 'MAT01', 'Réseaux 1',   '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (2, 'MAT02', 'Télécom 1',   '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (3, 'MAT03', 'Systèmes 1',  '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (4, 'MAT04', 'Sécurité 1',  '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO teacher_subjects (id, teacher_id, subject_id, created_at) VALUES
  (1, 1, 1, '2026-01-01T00:00:00+00:00'),
  (2, 1, 4, '2026-01-01T00:00:00+00:00'),
  (3, 2, 2, '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_months (id, semester_id, month_index, label, start_date, end_date, created_at) VALUES
  (1, 1, 1, 'M1', '2026-01-01', '2026-01-31', '2026-01-01T00:00:00+00:00'),
  (2, 1, 2, 'M2', '2026-02-01', '2026-02-28', '2026-01-01T00:00:00+00:00'),
  (3, 1, 3, 'M3', '2026-03-01', '2026-03-31', '2026-01-01T00:00:00+00:00'),
  (4, 1, 4, 'M4', '2026-04-01', '2026-04-30', '2026-01-01T00:00:00+00:00'),
  (5, 2, 1, 'M1', '2026-07-01', '2026-07-31', '2026-01-01T00:00:00+00:00'),
  (6, 2, 2, 'M2', '2026-08-01', '2026-08-31', '2026-01-01T00:00:00+00:00'),
  (7, 2, 3, 'M3', '2026-09-01', '2026-09-30', '2026-01-01T00:00:00+00:00'),
  (8, 2, 4, 'M4', '2026-10-01', '2026-10-31', '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_subject_plan (id, semester_id, class_id, month_index, slot_index, subject_id, tp, created_at, updated_at) VALUES
  (1, 1, 1, 1, 1, 1, 0, '2026-01-01T00:00:00+00:00', NULL),
  (2, 1, 1, 2, 1, 2, 1, '2026-01-01T00:00:00+00:00', NULL),
  (3, 1, 1, 3, 1, 3, 0, '2026-01-01T00:00:00+00:00', NULL),
  (4, 1, 1, 4, 1, 4, 0, '2026-01-01T00:00:00+00:00', NULL),
  (5, 1, 2, 1, 1, 2, 0, '2026-01-01T00:00:00+00:00', NULL),
  (6, 1, 2, 2, 1, 3, 1, '2026-01-01T00:00:00+00:00', NULL),
  (7, 1, 2, 3, 1, 4, 0, '2026-01-01T00:00:00+00:00', NULL),
  (8, 1, 2, 4, 1, 1, 0, '2026-01-01T00:00:00+00:00', NULL)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_grade_summary (id, semester_id, class_id, month_index, avg_score, global_comment, graded_at, created_at, updated_at) VALUES
  (1, 1, 1, 1, 12.5, 'Bon niveau général', '2026-01-25', '2026-01-25T00:00:00+00:00', NULL),
  (2, 1, 1, 2, 13.2, 'Progrès visible', '2026-02-25', '2026-02-25T00:00:00+00:00', NULL),
  (3, 1, 1, 3, 11.8, 'Doit travailler la régularité', '2026-03-25', '2026-03-25T00:00:00+00:00', NULL),
  (4, 1, 1, 4, 14.1, 'Très bien', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (5, 1, 2, 1, 10.7, 'Début difficile', '2026-01-25', '2026-01-25T00:00:00+00:00', NULL),
  (6, 1, 2, 2, 12.0, 'Amélioration', '2026-02-25', '2026-02-25T00:00:00+00:00', NULL),
  (7, 1, 2, 3, 12.9, 'Bon mois', '2026-03-25', '2026-03-25T00:00:00+00:00', NULL),
  (8, 1, 2, 4, 13.0, 'Stable', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_attendance_summary (id, semester_id, class_id, month_index, present_count, absent_count, late_count, total_count, global_comment, updated_at, created_at) VALUES
  (1, 1, 1, 1, 85, 10, 5, 100, 'Présence satisfaisante', NULL, '2026-01-31T00:00:00+00:00'),
  (2, 1, 1, 2, 88, 8, 4, 100, 'Amélioration', NULL, '2026-02-28T00:00:00+00:00'),
  (3, 1, 1, 3, 80, 15, 5, 100, 'Absentéisme à surveiller', NULL, '2026-03-31T00:00:00+00:00'),
  (4, 1, 1, 4, 90, 7, 3, 100, 'Très bien', NULL, '2026-04-30T00:00:00+00:00'),
  (5, 1, 2, 1, 70, 25, 5, 100, 'Début difficile', NULL, '2026-01-31T00:00:00+00:00'),
  (6, 1, 2, 2, 78, 18, 4, 100, 'En hausse', NULL, '2026-02-28T00:00:00+00:00'),
  (7, 1, 2, 3, 82, 14, 4, 100, 'Correct', NULL, '2026-03-31T00:00:00+00:00'),
  (8, 1, 2, 4, 86, 10, 4, 100, 'Bon mois', NULL, '2026-04-30T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_tp_summary (id, semester_id, class_id, month_index, tp_count, avg_score, global_comment, updated_at, created_at) VALUES
  (1, 1, 1, 1, 2, 13.4, 'TP en place, bon rythme', NULL, '2026-01-31T00:00:00+00:00'),
  (2, 1, 1, 2, 3, 12.7, NULL, NULL, '2026-02-28T00:00:00+00:00'),
  (3, 1, 1, 3, 2, 14.1, NULL, NULL, '2026-03-31T00:00:00+00:00'),
  (4, 1, 1, 4, 4, 15.0, 'Très bonne progression', NULL, '2026-04-30T00:00:00+00:00'),
  (5, 1, 2, 1, 1, 10.8, 'Démarrage', NULL, '2026-01-31T00:00:00+00:00'),
  (6, 1, 2, 2, 2, 11.6, NULL, NULL, '2026-02-28T00:00:00+00:00'),
  (7, 1, 2, 3, 3, 12.9, NULL, NULL, '2026-03-31T00:00:00+00:00'),
  (8, 1, 2, 4, 3, 13.2, 'Stabilisation', NULL, '2026-04-30T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO timetable_entries (id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at) VALUES
  (1, 1, 1, 1, 1, 1, '08:00', '10:00', 'Salle 1', 'presentiel', NULL, '2026-01-01T00:00:00+00:00'),
  (2, 1, 1, 2, 2, 2, '10:00', '12:00', 'Salle 2', 'presentiel', NULL, '2026-01-01T00:00:00+00:00'),
  (3, 1, 2, 3, 1, 3, '08:00', '10:00', 'Salle P1', 'presentiel', NULL, '2026-01-01T00:00:00+00:00'),
  (4, 1, 2, 4, 2, 4, '10:00', '12:00', 'Salle P2', 'presentiel', NULL, '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO enrollments (id, student_id, semester_id, class_id, created_at, date_inscription, statut_inscription) VALUES
  (1, 1, 1, 1, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (2, 2, 1, 1, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (3, 3, 1, 1, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (4, 4, 1, 2, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (5, 5, 1, 2, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO assessments (id, semester_id, class_id, subject_id, teacher_id, kind, title, assessment_date, max_score, coefficient, is_public, created_at) VALUES
  (1, 1, 1, 1, 1, 'devoir', 'Devoir 1 Réseaux', '2026-01-20', 20, 1, 1, '2026-01-10T00:00:00+00:00'),
  (2, 1, 1, 2, 2, 'examen', 'Examen Télécom', '2026-03-15', 20, 2, 1, '2026-03-01T00:00:00+00:00'),
  (3, 1, 2, 3, 1, 'devoir', 'Devoir 1 Systèmes', '2026-02-10', 20, 1, 1, '2026-02-01T00:00:00+00:00'),
  (4, 1, 2, 4, 2, 'examen', 'Examen Sécurité', '2026-04-10', 20, 2, 1, '2026-04-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO grades (id, assessment_id, student_id, score, comment, graded_at, created_at) VALUES
  (1, 1, 1, 13, 'Bien', '2026-01-21', '2026-01-21T00:00:00+00:00'),
  (2, 1, 2, 15, 'Très bien', '2026-01-21', '2026-01-21T00:00:00+00:00'),
  (3, 1, 3, 10, 'Moyen', '2026-01-21', '2026-01-21T00:00:00+00:00'),
  (4, 2, 1, 12, NULL, '2026-03-16', '2026-03-16T00:00:00+00:00'),
  (5, 2, 2, 14, NULL, '2026-03-16', '2026-03-16T00:00:00+00:00'),
  (6, 2, 3, 11, NULL, '2026-03-16', '2026-03-16T00:00:00+00:00'),
  (7, 3, 4, 13, NULL, '2026-02-11', '2026-02-11T00:00:00+00:00'),
  (8, 3, 5, 9, NULL, '2026-02-11', '2026-02-11T00:00:00+00:00'),
  (9, 4, 4, 12, NULL, '2026-04-11', '2026-04-11T00:00:00+00:00'),
  (10, 4, 5, 14, NULL, '2026-04-11', '2026-04-11T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO attendance_sessions (id, semester_id, class_id, subject_id, teacher_id, session_date, start_time, end_time, notes, created_at) VALUES
  (1, 1, 1, 1, 1, '2026-01-08', '08:00', '10:00', 'Séance 1', '2026-01-08T00:00:00+00:00'),
  (2, 1, 1, 1, 1, '2026-02-05', '08:00', '10:00', 'Séance 2', '2026-02-05T00:00:00+00:00'),
  (3, 1, 2, 3, 1, '2026-02-12', '08:00', '10:00', 'TP', '2026-02-12T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO attendance_entries (id, session_id, student_id, status, remark, created_at) VALUES
  (1, 1, 1, 'present', NULL, '2026-01-08T00:00:00+00:00'),
  (2, 1, 2, 'present', NULL, '2026-01-08T00:00:00+00:00'),
  (3, 1, 3, 'absent', 'Malade', '2026-01-08T00:00:00+00:00'),
  (4, 2, 1, 'late', NULL, '2026-02-05T00:00:00+00:00'),
  (5, 2, 2, 'present', NULL, '2026-02-05T00:00:00+00:00'),
  (6, 2, 3, 'present', NULL, '2026-02-05T00:00:00+00:00'),
  (7, 3, 4, 'present', NULL, '2026-02-12T00:00:00+00:00'),
  (8, 3, 5, 'absent', NULL, '2026-02-12T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO visits (id, visit_date, semester_id, class_id, subject_id, teacher_id, title, notes, created_by_user_id, created_at) VALUES
  (1, '2026-02-18', 1, 1, 1, 1, 'Visite de suivi', 'Observation cours', 1, '2026-02-18T00:00:00+00:00'),
  (2, '2026-03-20', 1, 2, 3, 1, 'Visite TP', 'Bonne participation', 1, '2026-03-20T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO course_progress (id, semester_id, class_id, subject_id, matiere_a_finir, en_cours, created_at) VALUES
  (1, 1, 1, 1, 12, 4, '2026-02-01T00:00:00+00:00'),
  (2, 1, 1, 2, 10, 6, '2026-03-01T00:00:00+00:00'),
  (3, 1, 2, 3, 12, 7, '2026-03-01T00:00:00+00:00'),
  (4, 1, 2, 4, 10, 5, '2026-04-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO students (id, matricule, first_name, last_name, semester, created_at, track_category, track_level, email) VALUES
  (100, 'ETU0100', 'Hery', 'L1A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L1', 'etu0100@espa.local'),
  (101, 'ETU0101', 'Miora', 'L1B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L1', 'etu0101@espa.local'),
  (102, 'ETU0102', 'Tojo', 'L1C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L1', 'etu0102@espa.local'),
  (103, 'ETU0103', 'Hery', 'LP1A', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP1', 'etu0103@espa.local'),
  (104, 'ETU0104', 'Miora', 'LP1B', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP1', 'etu0104@espa.local'),
  (105, 'ETU0105', 'Tojo', 'LP1C', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP1', 'etu0105@espa.local'),
  (106, 'ETU0106', 'Hery', 'LUB1A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB1', 'etu0106@espa.local'),
  (107, 'ETU0107', 'Miora', 'LUB1B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB1', 'etu0107@espa.local'),
  (108, 'ETU0108', 'Tojo', 'LUB1C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB1', 'etu0108@espa.local'),
  (109, 'ETU0109', 'Hery', 'L2A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L2', 'etu0109@espa.local'),
  (110, 'ETU0110', 'Miora', 'L2B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L2', 'etu0110@espa.local'),
  (111, 'ETU0111', 'Tojo', 'L2C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L2', 'etu0111@espa.local'),
  (112, 'ETU0112', 'Hery', 'LP2A', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP2', 'etu0112@espa.local'),
  (113, 'ETU0113', 'Miora', 'LP2B', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP2', 'etu0113@espa.local'),
  (114, 'ETU0114', 'Tojo', 'LP2C', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP2', 'etu0114@espa.local'),
  (115, 'ETU0115', 'Hery', 'LUB2A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB2', 'etu0115@espa.local'),
  (116, 'ETU0116', 'Miora', 'LUB2B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB2', 'etu0116@espa.local'),
  (117, 'ETU0117', 'Tojo', 'LUB2C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB2', 'etu0117@espa.local'),
  (118, 'ETU0118', 'Hery', 'L3A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L3', 'etu0118@espa.local'),
  (119, 'ETU0119', 'Miora', 'L3B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L3', 'etu0119@espa.local'),
  (120, 'ETU0120', 'Tojo', 'L3C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'L3', 'etu0120@espa.local'),
  (121, 'ETU0121', 'Hery', 'LP3A', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP3', 'etu0121@espa.local'),
  (122, 'ETU0122', 'Miora', 'LP3B', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP3', 'etu0122@espa.local'),
  (123, 'ETU0123', 'Tojo', 'LP3C', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'LP3', 'etu0123@espa.local'),
  (124, 'ETU0124', 'Hery', 'LUB3A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB3', 'etu0124@espa.local'),
  (125, 'ETU0125', 'Miora', 'LUB3B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB3', 'etu0125@espa.local'),
  (126, 'ETU0126', 'Tojo', 'LUB3C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'LUB3', 'etu0126@espa.local'),
  (127, 'ETU0127', 'Hery', 'M1A', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'M1', 'etu0127@espa.local'),
  (128, 'ETU0128', 'Miora', 'M1B', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'M1', 'etu0128@espa.local'),
  (129, 'ETU0129', 'Tojo', 'M1C', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'M1', 'etu0129@espa.local'),
  (130, 'ETU0130', 'Hery', 'MP1A', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP1', 'etu0130@espa.local'),
  (131, 'ETU0131', 'Miora', 'MP1B', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP1', 'etu0131@espa.local'),
  (132, 'ETU0132', 'Tojo', 'MP1C', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP1', 'etu0132@espa.local'),
  (133, 'ETU0133', 'Hery', 'MP2A', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP2', 'etu0133@espa.local'),
  (134, 'ETU0134', 'Miora', 'MP2B', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP2', 'etu0134@espa.local'),
  (135, 'ETU0135', 'Tojo', 'MP2C', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP2', 'etu0135@espa.local')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO enrollments (id, student_id, semester_id, class_id, created_at, date_inscription, statut_inscription) VALUES
  (100, 100, 1, 10, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (101, 101, 1, 10, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (102, 102, 1, 10, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (103, 103, 1, 11, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (104, 104, 1, 11, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (105, 105, 1, 11, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (106, 106, 1, 12, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (107, 107, 1, 12, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (108, 108, 1, 12, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (109, 109, 1, 13, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (110, 110, 1, 13, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (111, 111, 1, 13, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (112, 112, 1, 14, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (113, 113, 1, 14, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (114, 114, 1, 14, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (115, 115, 1, 15, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (116, 116, 1, 15, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (117, 117, 1, 15, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (118, 118, 1, 16, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (119, 119, 1, 16, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (120, 120, 1, 16, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (121, 121, 1, 17, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (122, 122, 1, 17, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (123, 123, 1, 17, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (124, 124, 1, 18, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (125, 125, 1, 18, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (126, 126, 1, 18, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (127, 127, 1, 19, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (128, 128, 1, 19, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (129, 129, 1, 19, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (130, 130, 1, 20, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (131, 131, 1, 20, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (132, 132, 1, 20, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (133, 133, 1, 21, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (134, 134, 1, 21, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif'),
  (135, 135, 1, 21, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_grade_summary (id, semester_id, class_id, month_index, avg_score, global_comment, graded_at, created_at, updated_at) VALUES
  (100, 1, 10, 4, 12.4, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (101, 1, 11, 4, 11.2, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (102, 1, 12, 4, 13.1, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (103, 1, 13, 4, 10.9, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (104, 1, 14, 4, 12.7, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (105, 1, 15, 4, 14.0, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (106, 1, 16, 4, 11.6, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (107, 1, 17, 4, 12.1, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (108, 1, 18, 4, 13.8, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (109, 1, 19, 4, 12.9, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (110, 1, 20, 4, 11.5, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL),
  (111, 1, 21, 4, 13.0, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_attendance_summary (id, semester_id, class_id, month_index, present_count, absent_count, late_count, total_count, global_comment, updated_at, created_at) VALUES
  (100, 1, 10, 4, 92, 6, 2, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (101, 1, 11, 4, 86, 10, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (102, 1, 12, 4, 90, 7, 3, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (103, 1, 13, 4, 84, 12, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (104, 1, 14, 4, 88, 8, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (105, 1, 15, 4, 91, 6, 3, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (106, 1, 16, 4, 87, 9, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (107, 1, 17, 4, 89, 7, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (108, 1, 18, 4, 93, 5, 2, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (109, 1, 19, 4, 90, 7, 3, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (110, 1, 20, 4, 85, 11, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (111, 1, 21, 4, 88, 8, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semester_class_tp_summary (id, semester_id, class_id, month_index, tp_count, avg_score, global_comment, updated_at, created_at) VALUES
  (100, 1, 10, 4, 3, 13.2, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (101, 1, 11, 4, 2, 12.1, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (102, 1, 12, 4, 4, 14.0, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (103, 1, 13, 4, 2, 11.4, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (104, 1, 14, 4, 3, 12.8, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (105, 1, 15, 4, 4, 15.1, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (106, 1, 16, 4, 3, 12.0, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (107, 1, 17, 4, 3, 12.6, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (108, 1, 18, 4, 4, 14.3, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (109, 1, 19, 4, 3, 13.7, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (110, 1, 20, 4, 2, 12.2, 'Démo', NULL, '2026-04-30T00:00:00+00:00'),
  (111, 1, 21, 4, 3, 13.5, 'Démo', NULL, '2026-04-30T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO course_progress (id, semester_id, class_id, subject_id, matiere_a_finir, en_cours, created_at) VALUES
  (100, 1, 10, 1, 12, 6, '2026-04-01T00:00:00+00:00'),
  (101, 1, 11, 2, 10, 5, '2026-04-01T00:00:00+00:00'),
  (102, 1, 12, 3, 11, 7, '2026-04-01T00:00:00+00:00'),
  (103, 1, 13, 4, 10, 4, '2026-04-01T00:00:00+00:00'),
  (104, 1, 14, 1, 12, 7, '2026-04-01T00:00:00+00:00'),
  (105, 1, 15, 2, 10, 6, '2026-04-01T00:00:00+00:00'),
  (106, 1, 16, 3, 11, 5, '2026-04-01T00:00:00+00:00'),
  (107, 1, 17, 4, 10, 6, '2026-04-01T00:00:00+00:00'),
  (108, 1, 18, 1, 12, 8, '2026-04-01T00:00:00+00:00'),
  (109, 1, 19, 2, 10, 7, '2026-04-01T00:00:00+00:00'),
  (110, 1, 20, 3, 11, 6, '2026-04-01T00:00:00+00:00'),
  (111, 1, 21, 4, 10, 7, '2026-04-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;
