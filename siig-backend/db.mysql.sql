CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TEXT NOT NULL
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
  (1, 'admin@espa.local', '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'admin', '2026-01-01T00:00:00+00:00'),
  (2, 'prof@espa.local',  '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'prof',  '2026-01-01T00:00:00+00:00'),
  (3, 'prof2@espa.local', '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'prof',  '2026-01-01T00:00:00+00:00'),
  (4, 'etu@espa.local',   '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'etudiant', '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO teachers (id, matricule, first_name, last_name, email, created_at, grade, specialite, telephone, statut, date_recrutement) VALUES
  (1, 'PROF001', 'Aina', 'Rakoto', 'prof@espa.local',  '2026-01-01T00:00:00+00:00', 'MCF', 'Réseaux',  '0340000001', 'Permanent', '2020-01-15'),
  (2, 'PROF002', 'Mamy', 'Andry',  'prof2@espa.local', '2026-01-01T00:00:00+00:00', 'Assistant', 'Télécom', '0340000002', 'Vacataire', '2022-09-01')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO students (id, matricule, first_name, last_name, semester, created_at, track_category, track_level, email) VALUES
  (1, 'ETU0001', 'Etu', 'Demo', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'Licence 1', 'etu@espa.local')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO semesters (id, code, title, created_at, numero_semestre, date_debut, date_fin) VALUES
  (1, 'S1', 'Semestre 1', '2026-01-01T00:00:00+00:00', 1, '2026-01-01', '2026-06-30'),
  (2, 'S2', 'Semestre 2', '2026-01-01T00:00:00+00:00', 2, '2026-01-01', '2026-06-30')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO classes (id, code, title, created_at, niveau, effectif_max, salle_principale) VALUES
  (1, 'L1-ACAD', 'Licence 1 Académique', '2026-01-01T00:00:00+00:00', 'Licence 1', 40, 'A1'),
  (2, 'L1-PRO',  'LicencePro 1',          '2026-01-01T00:00:00+00:00', 'LicencePro 1', 30, 'P1')
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

INSERT INTO timetable_entries (id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at) VALUES
  (1, 1, 1, 1, 1, 1, '08:00', '10:00', 'Salle 1', 'presentiel', NULL, '2026-01-01T00:00:00+00:00'),
  (2, 1, 1, 2, 2, 2, '10:00', '12:00', 'Salle 2', 'presentiel', NULL, '2026-01-01T00:00:00+00:00')
ON DUPLICATE KEY UPDATE id = id;
