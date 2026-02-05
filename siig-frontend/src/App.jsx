import React, { useEffect, useMemo, useState } from 'react'
import { login, logout, me, register } from './auth.js'
import Sidebar from './components/Sidebar.jsx'
import { findNavItemByView, getNavItemsForRole } from './modules.js'
import HomeView from './views/HomeView.jsx'
import ModuleView from './views/ModuleView.jsx'
import StudentsView from './views/StudentsView.jsx'
import TeachersView from './views/TeachersView.jsx'
import SemestersView from './views/SemestersView.jsx'
import ClassesView from './views/ClassesView.jsx'
import SubjectsView from './views/SubjectsView.jsx'
import EnrollmentsView from './views/EnrollmentsView.jsx'
import TimetableView from './views/TimetableView.jsx'
import CoursesView from './views/CoursesView.jsx'
import AssessmentsView from './views/AssessmentsView.jsx'
import GradesView from './views/GradesView.jsx'
import UesView from './views/UesView.jsx'
import EcsView from './views/EcsView.jsx'
import ClassSubjectsView from './views/ClassSubjectsView.jsx'
import StudentClassAssignmentsView from './views/StudentClassAssignmentsView.jsx'

function roleLabel(role) {
  if (role === 'admin') return 'Admin'
  if (role === 'prof') return 'Prof'
  if (role === 'etudiant') return 'Étudiant'
  return role
}

function defaultHomeFor(role) {
  if (!role) return 'auth'
  return 'home'
}

function viewToHash(view) {
  return `#${view.replace(':', '/')}`
}

function hashToView(hash) {
  const h = String(hash || '').replace(/^#/, '')
  if (!h) return null
  const parts = h.split('/')
  if (parts.length < 2) return h
  return `${parts[0]}:${parts.slice(1).join('/')}`
}

function isViewAllowedForRole(view, role) {
  if (!view || !role) return false
  if (view === 'home') return true
  if (view.startsWith('admin:')) return role === 'admin'
  if (view.startsWith('prof:')) return role === 'prof'
  if (view.startsWith('etudiant:')) return role === 'etudiant'
  return false
}

function Button({ variant = 'default', className = '', ...props }) {
  const cls = ['btn', variant === 'primary' ? 'btn--primary' : '', variant === 'danger' ? 'btn--danger' : '', className]
    .filter(Boolean)
    .join(' ')
  return <button {...props} className={cls} />
}

function Input(props) {
  return <input {...props} className={`input ${props.className || ''}`.trim()} />
}

function Select(props) {
  return <select {...props} className={`input ${props.className || ''}`.trim()} />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('login')
  const [error, setError] = useState(null)
  const [view, setView] = useState('auth')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')

  const isAuthed = useMemo(() => !!localStorage.getItem('token'), [])

  const currentNavItem = useMemo(() => {
    if (!user) return null
    return findNavItemByView(view, user.role)
  }, [view, user])

  const homeActions = useMemo(() => {
    if (!user) return []
    return getNavItemsForRole(user.role).filter((i) => i.view !== 'home')
  }, [user])

  function navigate(nextView) {
    setView(nextView)
    window.location.hash = viewToHash(nextView)
    setDrawerOpen(false)
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((v) => {
      const next = !v
      localStorage.setItem('sidebarCollapsed', next ? '1' : '0')
      return next
    })
  }

  useEffect(() => {
    if (mode === 'register') {
      setSelectedRole('etudiant')
    }
  }, [mode])

  useEffect(() => {
    ;(async () => {
      if (!isAuthed) return
      try {
        const u = await me()
        setUser(u)

        const fromHash = hashToView(window.location.hash)
        const next = isViewAllowedForRole(fromHash, u.role) ? fromHash : 'home'
        setView(next)
        window.location.hash = viewToHash(next)
      } catch {
        logout()
        setUser(null)
        setView('auth')
        setDrawerOpen(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onHashChange() {
      if (!user) return
      const fromHash = hashToView(window.location.hash)
      if (fromHash && isViewAllowedForRole(fromHash, user.role)) {
        setView(fromHash)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [user])

  async function onSubmitAuth(e) {
    e.preventDefault()
    setError(null)
    try {
      const u =
        mode === 'register' ? await register(email, password, selectedRole) : await login(email, password)

      setUser(u)
      const next = 'home'
      navigate(next)
    } catch (err) {
      const raw = err?.data?.error || err?.message || 'Erreur'
      setError(raw)
    }
  }

  function onLogout() {
    logout()
    setUser(null)
    setView('auth')
    window.location.hash = ''
    setDrawerOpen(false)
  }

  const pageTitle = user ? `Espace ${roleLabel(user.role)}` : 'Connexion'

  if (!user) {
    return (
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <div className="brand__title">SIIG - Mention Télécommunication</div>
            <div className="brand__subtitle">{pageTitle} • Web + APK hybride</div>
          </div>
        </div>

        {error ? <div className="alert">{String(error)}</div> : null}

        <div className="panel">
          <div className="panel__body grid">
            <div className="row">
              <Button variant={mode === 'login' ? 'primary' : 'default'} onClick={() => setMode('login')}>
                Login
              </Button>
              <Button variant={mode === 'register' ? 'primary' : 'default'} onClick={() => setMode('register')}>
                Register
              </Button>
            </div>

            <div className="card">
              <div className="card__header">Accès</div>
              <div className="card__body">
                <form className="grid" onSubmit={onSubmitAuth} style={{ maxWidth: 520 }}>
                  <div>
                    <div className="label">Type de compte</div>
                    <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                      {mode === 'login' ? <option value="admin">Admin</option> : null}
                      <option value="etudiant">Étudiant</option>
                      <option value="prof">Prof</option>
                    </Select>
                  </div>

                  {mode === 'login' ? (
                    <div>
                      <div className="label">Connexion rapide (démo)</div>
                      <div className="row">
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedRole('admin')
                            setEmail('admin@espa.local')
                            setPassword('0000000')
                          }}
                        >
                          Admin
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedRole('prof')
                            setEmail('prof@espa.local')
                            setPassword('0000000')
                          }}
                        >
                          Prof
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedRole('etudiant')
                            setEmail('etu@espa.local')
                            setPassword('0000000')
                          }}
                        >
                          Étudiant
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div className="label">Email</div>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@espa.local" />
                  </div>

                  <div>
                    <div className="label">Mot de passe</div>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                  </div>

                  <Button variant="primary" type="submit">
                    {mode === 'register' ? 'Créer compte' : 'Se connecter'}
                  </Button>

                  <div className="label">
                    1er compte créé = <b>admin</b>. Ensuite, tu peux créer des comptes <b>étudiant</b> ou <b>prof</b>.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeader__row">
          <div className="appHeader__left">
            <button className="iconBtn" type="button" onClick={() => setDrawerOpen((v) => !v)}>
              Menu
            </button>
            <div className="brand">
              <div className="brand__title">SIIG - Mention Télécommunication</div>
              <div className="brand__subtitle">{pageTitle} • Web + APK hybride</div>
            </div>
          </div>

          <div className="row">
            <span className="badge">{user.email} • {roleLabel(user.role)}</span>
            <Button variant="primary" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className={`appBody ${sidebarCollapsed ? 'appBody--collapsed' : ''}`.trim()}>
        <div
          className={`drawerOverlay ${drawerOpen ? 'drawerOverlay--open' : ''}`}
          onClick={() => setDrawerOpen(false)}
        />

        <aside className={`drawer ${drawerOpen ? 'drawer--open' : ''} ${sidebarCollapsed ? 'drawer--collapsed' : ''}`.trim()}>
          <div className="panel drawer__panel">
            <Sidebar
              role={user.role}
              currentView={view}
              onNavigate={navigate}
              collapsed={sidebarCollapsed}
              onToggleCollapsed={toggleSidebarCollapsed}
            />
          </div>
        </aside>

        <main className="appMain">
          {error ? <div className="alert">{String(error)}</div> : null}

          {view === 'home' && <HomeView user={user} roleLabel={roleLabel} actions={homeActions} onNavigate={navigate} Button={Button} />}

          {(view === 'admin:dashboard' || view === 'prof:dashboard' || view === 'etudiant:dashboard') && (
            <div className="card">
              <div className="card__header">Dashboard</div>
              <div className="card__body">
                <div className="grid">
                  <div className="badge">Rôle: {roleLabel(user.role)}</div>
                  <div className="label">
                    Ce dashboard est la base pour implémenter progressivement le cahier des charges (inscriptions, matières,
                    emplois du temps, cours, notes, examens, tableaux de bord, notifications, etc.).
                  </div>
                  <div className="label">
                    Ajout “dynamique” : chaque module devient un item de menu + endpoints API (même pattern que “Étudiants”).
                  </div>
                </div>
              </div>
            </div>
          )}

          {(view === 'admin:students' || view === 'prof:students') && <StudentsView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:teachers' || view === 'prof:teachers') && <TeachersView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:semesters' || view === 'prof:semesters') && (
            <SemestersView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:classes' || view === 'prof:classes') && <ClassesView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:subjects' || view === 'prof:subjects') && <SubjectsView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:ues' || view === 'prof:ues') && <UesView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:ecs' || view === 'prof:ecs') && <EcsView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />}

          {(view === 'admin:class-subjects' || view === 'prof:class-subjects') && (
            <ClassSubjectsView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:student-class-assignments' || view === 'prof:student-class-assignments') && (
            <StudentClassAssignmentsView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:enrollments' || view === 'prof:enrollments') && (
            <EnrollmentsView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:timetable' || view === 'prof:timetable') && (
            <TimetableView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:courses' || view === 'prof:courses' || view === 'etudiant:courses') && (
            <CoursesView role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:assessments' || view === 'prof:assessments') && (
            <AssessmentsView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:grades' || view === 'prof:grades' || view === 'etudiant:grades') && (
            <GradesView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {currentNavItem &&
            view !== 'home' &&
            view !== 'admin:dashboard' &&
            view !== 'prof:dashboard' &&
            view !== 'etudiant:dashboard' &&
            view !== 'admin:students' &&
            view !== 'prof:students' &&
            view !== 'admin:teachers' &&
            view !== 'prof:teachers' &&
            view !== 'admin:semesters' &&
            view !== 'prof:semesters' &&
            view !== 'admin:classes' &&
            view !== 'prof:classes' &&
            view !== 'admin:subjects' &&
            view !== 'prof:subjects' &&
            view !== 'admin:ues' &&
            view !== 'prof:ues' &&
            view !== 'admin:ecs' &&
            view !== 'prof:ecs' &&
            view !== 'admin:class-subjects' &&
            view !== 'prof:class-subjects' &&
            view !== 'admin:student-class-assignments' &&
            view !== 'prof:student-class-assignments' &&
            view !== 'admin:enrollments' &&
            view !== 'prof:enrollments' &&
            view !== 'admin:timetable' &&
            view !== 'prof:timetable' &&
            view !== 'admin:courses' &&
            view !== 'prof:courses' &&
            view !== 'etudiant:courses' &&
            view !== 'admin:assessments' &&
            view !== 'prof:assessments' &&
            view !== 'admin:grades' &&
            view !== 'prof:grades' &&
            view !== 'etudiant:grades' && <ModuleView title={currentNavItem.label} view={view} />}
        </main>
      </div>
    </div>
  )
}
