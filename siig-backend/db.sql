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

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- public | direct
  status TEXT NOT NULL, -- pending | approved
  from_user_id INTEGER NULL,
  to_teacher_id INTEGER NULL,
  subject TEXT NULL,
  body TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  approved_at TEXT NULL,
  approved_by_user_id INTEGER NULL,
  FOREIGN KEY(from_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(to_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  FOREIGN KEY(approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS attendance_sessions (
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
);

CREATE TABLE IF NOT EXISTS attendance_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  remark TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(session_id, student_id),
  FOREIGN KEY(session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visits (
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
);

CREATE TABLE IF NOT EXISTS course_progress (
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

CREATE TABLE IF NOT EXISTS semester_class_grade_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  month_index INTEGER NOT NULL,
  avg_score REAL NULL,
  global_comment TEXT NULL,
  graded_at TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NULL,
  UNIQUE(semester_id, class_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS semester_class_attendance_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  month_index INTEGER NOT NULL,
  present_count INTEGER NULL,
  absent_count INTEGER NULL,
  late_count INTEGER NULL,
  total_count INTEGER NULL,
  global_comment TEXT NULL,
  updated_at TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(semester_id, class_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS semester_class_tp_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  month_index INTEGER NOT NULL,
  tp_count INTEGER NOT NULL DEFAULT 0,
  avg_score REAL NULL,
  global_comment TEXT NULL,
  updated_at TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(semester_id, class_id, month_index),
  FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
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

INSERT OR IGNORE INTO students (id, matricule, first_name, last_name, semester, created_at, track_category, track_level, email) VALUES
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
  (135, 'ETU0135', 'Tojo', 'MP2C', 'S1', '2026-01-01T00:00:00+00:00', 'professionnel', 'MP2', 'etu0135@espa.local');

INSERT OR IGNORE INTO semesters (id, code, title, created_at, numero_semestre, date_debut, date_fin) VALUES
  (1, 'S1', 'Semestre 1', '2026-01-01T00:00:00+00:00', 1, '2026-01-01', '2026-06-30'),
  (2, 'S2', 'Semestre 2', '2026-01-01T00:00:00+00:00', 2, '2026-01-01', '2026-06-30');

INSERT OR IGNORE INTO classes (id, code, title, created_at, niveau, effectif_max, salle_principale) VALUES
  (1, 'L1-ACAD', 'Licence 1 Académique', '2026-01-01T00:00:00+00:00', 'Licence 1', 40, 'A1'),
  (2, 'L1-PRO',  'LicencePro 1',          '2026-01-01T00:00:00+00:00', 'LicencePro 1', 30, 'P1');

INSERT OR IGNORE INTO classes (id, code, title, created_at, niveau, effectif_max, salle_principale) VALUES
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
  (21, 'MP2', 'Master Pro 2', '2026-01-01T00:00:00+00:00', 'MP2', 25, 'MP2');

INSERT OR IGNORE INTO semester_class_grade_summary (id, semester_id, class_id, month_index, avg_score, global_comment, graded_at, created_at, updated_at) VALUES
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
  (111, 1, 21, 4, 13.0, 'Démo', '2026-04-25', '2026-04-25T00:00:00+00:00', NULL);

INSERT OR IGNORE INTO semester_class_attendance_summary (id, semester_id, class_id, month_index, present_count, absent_count, late_count, total_count, global_comment, updated_at, created_at) VALUES
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
  (111, 1, 21, 4, 88, 8, 4, 100, 'Démo', NULL, '2026-04-30T00:00:00+00:00');

INSERT OR IGNORE INTO semester_class_tp_summary (id, semester_id, class_id, month_index, tp_count, avg_score, global_comment, updated_at, created_at) VALUES
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
  (111, 1, 21, 4, 3, 13.5, 'Démo', NULL, '2026-04-30T00:00:00+00:00');

INSERT OR IGNORE INTO subjects (id, code, title, created_at, type_matiere, coefficient, credit_ects, volume_horaire_total) VALUES
  (1, 'MAT01', 'Réseaux 1',   '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (2, 'MAT02', 'Télécom 1',   '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (3, 'MAT03', 'Systèmes 1',  '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24),
  (4, 'MAT04', 'Sécurité 1',  '2026-01-01T00:00:00+00:00', 'UE', 1, 3, 24);

INSERT OR IGNORE INTO enrollments (id, student_id, semester_id, class_id, created_at, date_inscription, statut_inscription) VALUES
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
  (135, 135, 1, 21, '2026-01-02T00:00:00+00:00', '2026-01-02', 'actif');

INSERT OR IGNORE INTO teacher_subjects (id, teacher_id, subject_id, created_at) VALUES
  (1, 1, 1, '2026-01-01T00:00:00+00:00'),
  (2, 1, 4, '2026-01-01T00:00:00+00:00'),
  (3, 2, 2, '2026-01-01T00:00:00+00:00');

INSERT OR IGNORE INTO timetable_entries (id, semester_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, mode, online_url, created_at) VALUES
  (1, 1, 1, 1, 1, 1, '08:00', '10:00', 'Salle 1', 'presentiel', NULL, '2026-01-01T00:00:00+00:00'),
  (2, 1, 1, 2, 2, 2, '10:00', '12:00', 'Salle 2', 'presentiel', NULL, '2026-01-01T00:00:00+00:00');
