import React, { useEffect, useMemo, useState } from 'react'
import { login, logout, me, register } from './auth.js'
import { apiGet } from './api.js'
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
import AttendanceView from './views/AttendanceView.jsx'
import TpByClassView from './views/TpByClassView.jsx'
import VisitsByClassView from './views/VisitsByClassView.jsx'
import CourseProgressView from './views/CourseProgressView.jsx'
import InboxView from './views/InboxView.jsx'

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
  if (view === 'inbox') return true
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

function StatBars({ data, max = 20, height = 220 }) {
  const plotHeight = 150
  const top = 14
  const left = 44
  const bottom = 40
  const barWidth = 34
  const gap = 22
  const width = Math.max(560, left + 14 + data.length * (barWidth + gap))
  const zeroY = top + plotHeight

  function yForValue(v) {
    const clamped = Math.max(0, Math.min(max, Number(v) || 0))
    return top + plotHeight - (clamped / max) * plotHeight
  }

  const ticks = [0, 5, 10, 15, 20]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="statChart">
      {ticks.map((t) => {
        const y = yForValue(t)
        return (
          <g key={t}>
            <line x1={left} y1={y} x2={width - 10} y2={y} className="statChart__grid" />
            <text x={left - 10} y={y + 4} textAnchor="end" className="statChart__tick">
              {t}
            </text>
          </g>
        )
      })}

      <line x1={left} y1={top} x2={left} y2={zeroY} className="statChart__axis" />
      <line x1={left} y1={zeroY} x2={width - 10} y2={zeroY} className="statChart__axis" />

      {data.map((d, i) => {
        const x = left + 14 + i * (barWidth + gap)
        const y = yForValue(d.value)
        const h = zeroY - y
        return (
          <g key={String(d.label)}>
            <rect x={x} y={y} width={barWidth} height={h} rx={8} className="statChart__bar" />
            <text x={x + barWidth / 2} y={zeroY + 18} textAnchor="middle" className="statChart__label">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('login')
  const [error, setError] = useState(null)
  const [view, setView] = useState('auth')

  const [unreadCount, setUnreadCount] = useState(0)

  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')

  const isAuthed = useMemo(() => !!localStorage.getItem('token'), [])

  const navItems = useMemo(() => {
    if (!user) return []
    return getNavItemsForRole(user.role)
  }, [user])

  const pageTitle = useMemo(() => {
    if (view === 'auth') return mode === 'register' ? 'Inscription' : 'Connexion'
    const item = findNavItemByView(navItems, view)
    return item ? item.label : 'SIIG'
  }, [view, mode, navItems])

  const isDashboardView = useMemo(
    () => view === 'admin:dashboard' || view === 'prof:dashboard' || view === 'etudiant:dashboard',
    [view]
  )

  useEffect(() => {
    if (!isDashboardView || !user) return

    let cancelled = false

    async function load() {
      setDashboardLoading(true)
      try {
        const desiredOrder = ['L1', 'LP1', 'LUB1', 'L2', 'LP2', 'LUB2', 'L3', 'LP3', 'LUB3', 'M1', 'MP1', 'MP2']
        const semesterId = 1
        const monthIndex = 4

        const classesRes = await apiGet('/api/classes')
        const classItems = Array.isArray(classesRes?.items) ? classesRes.items : []
        const classes = desiredOrder
          .map((code) => classItems.find((c) => String(c.code).toUpperCase() === code))
          .filter(Boolean)

        const byClassId = (items, field) => {
          const m = new Map()
          for (const it of items || []) {
            if (it && it.class_id != null) m.set(Number(it.class_id), it[field])
          }
          return m
        }

        const gradeRes = await apiGet(`/api/semester-class-grade-summary?semester_id=${semesterId}&month_index=${monthIndex}`)
        const attRes = await apiGet(`/api/semester-class-attendance-summary?semester_id=${semesterId}&month_index=${monthIndex}`)
        const tpRes = await apiGet(`/api/semester-class-tp-summary?semester_id=${semesterId}&month_index=${monthIndex}`)
        const courseRes = await apiGet(`/api/course-progress?semester_id=${semesterId}`)

        const gradeAvg = byClassId(Array.isArray(gradeRes?.items) ? gradeRes.items : [], 'avg_score')
        const tpAvg = byClassId(Array.isArray(tpRes?.items) ? tpRes.items : [], 'avg_score')

        const attendanceMap = new Map()
        for (const it of Array.isArray(attRes?.items) ? attRes.items : []) {
          const cid = Number(it.class_id)
          const present = Number(it.present_count) || 0
          const total = Number(it.total_count) || 0
          const ratio = total > 0 ? present / total : 0
          attendanceMap.set(cid, ratio * 20)
        }

        const courseMap = new Map()
        for (const it of Array.isArray(courseRes?.items) ? courseRes.items : []) {
          const cid = Number(it.class_id)
          const remaining = Number(it.matiere_a_finir) || 0
          const inProgress = Number(it.en_cours) || 0
          const denom = remaining + inProgress
          const ratio = denom > 0 ? inProgress / denom : 0
          courseMap.set(cid, ratio * 20)
        }

        const noteData = classes.map((c) => ({ label: String(c.code).toUpperCase(), value: Number(gradeAvg.get(Number(c.id)) || 0) }))
        const presenceData = classes.map((c) => ({ label: String(c.code).toUpperCase(), value: Number(attendanceMap.get(Number(c.id)) || 0) }))
        const tpData = classes.map((c) => ({ label: String(c.code).toUpperCase(), value: Number(tpAvg.get(Number(c.id)) || 0) }))
        const coursData = classes.map((c) => ({ label: String(c.code).toUpperCase(), value: Number(courseMap.get(Number(c.id)) || 0) }))

        if (!cancelled) {
          setDashboardData({ noteData, presenceData, tpData, coursData })
        }
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setDashboardLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isDashboardView, user])

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

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function loadUnread() {
      try {
        const res = await apiGet('/api/messages/unread-count')
        const n = Number(res?.count || 0) || 0
        if (!cancelled) setUnreadCount(n)
      } catch {
        if (!cancelled) setUnreadCount(0)
      }
    }

    loadUnread()
    const t = window.setInterval(loadUnread, 12000)
    return () => {
      cancelled = true
      window.clearInterval(t)
    }
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
    setUnreadCount(0)
    window.location.hash = ''
    setDrawerOpen(false)
  }

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
            <button
              type="button"
              className="mailBtn"
              onClick={() => navigate('inbox')}
              title="Boîte à lettres"
            >
              <span className="mailBtn__icon" aria-hidden="true">✉</span>
              {unreadCount > 0 ? <span className="mailBtn__dot" aria-label="Nouveaux messages" /> : null}
            </button>
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

          {view === 'inbox' && (
            <InboxView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {isDashboardView && (
            <div className="dashboardStack">
              {dashboardLoading ? <div className="label">Chargement des statistiques…</div> : null}
              {!dashboardLoading && dashboardData
                ? [
                    { title: 'Note (moyenne par classe)', data: dashboardData.noteData },
                    { title: 'Présence (moyenne par classe)', data: dashboardData.presenceData },
                    { title: 'TP (moyenne par classe)', data: dashboardData.tpData },
                    { title: 'Cours en ligne (moyenne par classe)', data: dashboardData.coursData }
                  ].map((c) => (
                    <div key={c.title} className="card card--white statCard">
                      <div className="card__header">{c.title}</div>
                      <div className="card__body">
                        <div className="statMeta">
                          <div className="badge">Rôle: {roleLabel(user.role)}</div>
                          <div className="statMeta__hint">Axe vertical: 0 à 20 (moyenne) • Axe horizontal: classes</div>
                        </div>
                        <div className="statChartScroll">
                          <StatBars data={c.data} />
                        </div>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          )}

          {(view === 'admin:students' || view === 'prof:students') && <StudentsView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:teachers' || view === 'prof:teachers') && <TeachersView role={user.role} Button={Button} Input={Input} onError={setError} />}

          {(view === 'admin:semesters' || view === 'prof:semesters') && (
            <SemestersView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:semester-subject-plan' || view === 'prof:semester-subject-plan') && (
            <SemestersView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} initialEmbeddedView="semester-subjects" />
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

          {(view === 'admin:attendance' || view === 'prof:attendance') && (
            <AttendanceView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:tp-by-class' || view === 'prof:tp-by-class') && (
            <TpByClassView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:visits-by-class' || view === 'prof:visits-by-class') && (
            <VisitsByClassView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
          )}

          {(view === 'admin:course-progress' || view === 'prof:course-progress') && (
            <CourseProgressView user={user} role={user.role} Button={Button} Input={Input} Select={Select} onError={setError} />
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
