export function getNavItemsForRole(role) {
  const common = [{ view: 'home', label: 'Accueil', roles: ['admin', 'prof', 'etudiant'] }]

  const admin = [
    { view: 'admin:dashboard', label: 'Dashboard', roles: ['admin'] },
    { view: 'admin:students', label: 'Étudiants', roles: ['admin'] },
    { view: 'admin:teachers', label: 'Enseignants', roles: ['admin'] },
    { view: 'admin:semesters', label: 'Semestres', roles: ['admin'] },
    { view: 'admin:classes', label: 'Classes', roles: ['admin'] },
    { view: 'admin:subjects', label: 'Matières (UE/EC)', roles: ['admin'] },
    { view: 'admin:ues', label: 'UE', roles: ['admin'] },
    { view: 'admin:ecs', label: 'EC', roles: ['admin'] },
    { view: 'admin:class-subjects', label: 'Matières par classe', roles: ['admin'] },
    { view: 'admin:student-class-assignments', label: 'Affectations classe', roles: ['admin'] },
    { view: 'admin:enrollments', label: 'Inscriptions', roles: ['admin'] },
    { view: 'admin:timetable', label: 'Emplois du temps', roles: ['admin'] },
    { view: 'admin:courses', label: 'Cours en ligne', roles: ['admin'] },
    { view: 'admin:assessments', label: 'Examens / TP', roles: ['admin'] },
    { view: 'admin:grades', label: 'Notes', roles: ['admin'] }
  ]

  const prof = [
    { view: 'prof:dashboard', label: 'Dashboard', roles: ['prof'] },
    { view: 'prof:students', label: 'Étudiants', roles: ['prof'] },
    { view: 'prof:teachers', label: 'Enseignants', roles: ['prof'] },
    { view: 'prof:semesters', label: 'Semestres', roles: ['prof'] },
    { view: 'prof:classes', label: 'Classes', roles: ['prof'] },
    { view: 'prof:subjects', label: 'Matières (UE/EC)', roles: ['prof'] },
    { view: 'prof:ues', label: 'UE', roles: ['prof'] },
    { view: 'prof:ecs', label: 'EC', roles: ['prof'] },
    { view: 'prof:class-subjects', label: 'Matières par classe', roles: ['prof'] },
    { view: 'prof:student-class-assignments', label: 'Affectations classe', roles: ['prof'] },
    { view: 'prof:enrollments', label: 'Inscriptions', roles: ['prof'] },
    { view: 'prof:timetable', label: 'Emplois du temps', roles: ['prof'] },
    { view: 'prof:courses', label: 'Mes cours', roles: ['prof'] },
    { view: 'prof:grades', label: 'Notes', roles: ['prof'] }
  ]

  const etudiant = [
    { view: 'etudiant:dashboard', label: 'Dashboard', roles: ['etudiant'] },
    { view: 'etudiant:courses', label: 'Mes cours', roles: ['etudiant'] },
    { view: 'etudiant:grades', label: 'Mes notes', roles: ['etudiant'] }
  ]

  const all = [...common, ...admin, ...prof, ...etudiant]

  return all.filter((i) => i.roles.includes(role))
}

export function findNavItemByView(view, role) {
  const items = getNavItemsForRole(role)
  return items.find((i) => i.view === view) || null
}
