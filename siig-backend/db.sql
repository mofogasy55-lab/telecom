PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
);

CREATE TABLE IF NOT EXISTS semesters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  numero_semestre INTEGER NULL,
  date_debut TEXT NULL,
  date_fin TEXT NULL
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  niveau TEXT NULL,
  effectif_max INTEGER NULL,
  salle_principale TEXT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  type_matiere TEXT NULL,
  coefficient REAL NULL,
  credit_ects REAL NULL,
  volume_horaire_total REAL NULL,
  description TEXT NULL,
  ue_id INTEGER NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  class_id INTEGER NULL,
  created_at TEXT NOT NULL,
  date_inscription TEXT NULL,
  statut_inscription TEXT NULL,
  UNIQUE(student_id, semester_id),
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credit REAL NULL,
  semestre_code TEXT NULL,
  type_ue TEXT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ecs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  credit REAL NULL,
  coefficient REAL NULL,
  created_at TEXT NOT NULL,
  UNIQUE(subject_id, code),
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(class_id, subject_id),
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_class_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  date_affectation TEXT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timetable_entries (
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
);

CREATE TABLE IF NOT EXISTS courses (
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
);

CREATE TABLE IF NOT EXISTS assessments (
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
);

CREATE TABLE IF NOT EXISTS grades (
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
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(teacher_id, subject_id),
  FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO users (id, email, password_hash, role, created_at) VALUES
  (1, 'admin@espa.local', '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'admin', '2026-01-01T00:00:00+00:00'),
  (2, 'prof@espa.local',  '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'prof',  '2026-01-01T00:00:00+00:00'),
  (3, 'prof2@espa.local', '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'prof',  '2026-01-01T00:00:00+00:00'),
  (4, 'etu@espa.local',   '$2y$10$ZObSRlerCJ6CQv5/P3kBbOGLYPDNe./L.jN/0bsEDRK3H3RUPx1zC', 'etudiant', '2026-01-01T00:00:00+00:00');

INSERT OR IGNORE INTO teachers (id, matricule, first_name, last_name, email, created_at, grade, specialite, telephone, statut, date_recrutement) VALUES
  (1, 'PROF001', 'Aina', 'Rakoto', 'prof@espa.local',  '2026-01-01T00:00:00+00:00', 'MCF', 'Réseaux',  '0340000001', 'Permanent', '2020-01-15'),
  (2, 'PROF002', 'Mamy', 'Andry',  'prof2@espa.local', '2026-01-01T00:00:00+00:00', 'Assistant', 'Télécom', '0340000002', 'Vacataire', '2022-09-01');

INSERT OR IGNORE INTO students (id, matricule, first_name, last_name, semester, created_at, track_category, track_level, email) VALUES
  (1, 'ETU0001', 'Etu', 'Demo', 'S1', '2026-01-01T00:00:00+00:00', 'academique', 'Licence 1', 'etu@espa.local');

INSERT OR IGNORE INTO semesters (id, code, title, created_at, numero_semestre, date_debut, date_fin) VALUES
  (1, 'S1', 'Semestre 1', '2026-01-01T00:00:00+00:00', 1, '2026-01-01', '2026-06-30'),
  (2, 'S2', 'Semestre 2', '2026-01-01T00:00:00+00:00', 2, '2026-01-01', '2026-06-30');

INSERT OR IGNORE INTO classes (id, code, title, created_at, niveau, effectif_max, salle_principale) VALUES
  (1, 'L1-ACAD', 'Licence 1 Académique', '2026-01-01T00:00:00+00:00', 'Licence 1', 40, 'A1'),
  (2, 'L1-PRO',  'LicencePro 1',          '2026-01-01T00:00:00+00:00', 'LicencePro 1', 30, 'P1');

INSERT OR IGNORE INTO subjects (id, code, title, created_at, type_matiere, coefficient, credit_ects, volume_horaire_total) VALUES
  (1, 'MAT01', 'Réseaux 1',   '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (2, 'MAT02', 'Télécom 1',   '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (3, 'MAT03', 'Systèmes 1',  '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (4, 'MAT04', 'Sécurité 1',  '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24);

INSERT OR IGNORE INTO teacher_subjects (id, teacher_id, subject_id, created_at) VALUES
  (1, 1, 1, '2026-01-01T00:00:00+00:00'),
  (2, 1, 4, '2026-01-01T00:00:00+00:00'),
  (3, 2, 2, '2026-01-01T00:00:00+00:00');

INSERT OR IGNORE INTO timetable_entries (id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at) VALUES
  (1, 1, 1, 1, 1, 1, '08:00', '10:00', 'Salle 1', 'presentiel', NULL, '2026-01-01T00:00:00+00:00'),
  (2, 1, 1, 2, 2, 2, '10:00', '12:00', 'Salle 2', 'presentiel', NULL, '2026-01-01T00:00:00+00:00');
