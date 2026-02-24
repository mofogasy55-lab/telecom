import React, { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function AttendanceView({ user, role, Button, Input, Select, onError, embedded = false }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedSessionEntries, setSelectedSessionEntries] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])

  const [sessionFilter, setSessionFilter] = useState('')

  const [activeTab, setActiveTab] = useState('recap')

  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [notes, setNotes] = useState('')

  const [entriesByStudentId, setEntriesByStudentId] = useState({})

  const canWrite = role === 'admin' || role === 'prof'

  async function refreshAll() {
    setLoading(true)
    onError?.(null)
    try {
      const qs = sessionFilter ? `?session=${encodeURIComponent(sessionFilter)}` : ''
      const reqs = [
        apiGet(`/api/attendance${qs}`),
        apiGet('/api/attendance-sessions'),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects')
      ]
      const [att, ses, sem, cls, sub] = await Promise.all(reqs)

      setItems(att.items || [])
      setSessions(ses.items || [])
      setSemesters(sem.items || [])
      setClasses(cls.items || [])
      setSubjects(sub.items || [])
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function openSessionDetails(id) {
    setLoading(true)
    onError?.(null)
    try {
      const data = await apiGet(`/api/attendance-sessions/${id}`)
      setSelectedSession(data)
      setSelectedSessionEntries(data.entries || [])
      setActiveTab('sessions')
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, sessionFilter])

  useEffect(() => {
    if (!canWrite) return
    if (!semesterId || !classId) {
      setStudents([])
      return
    }

    ;(async () => {
      setLoading(true)
      onError?.(null)
      try {
        const data = await apiGet(`/api/attendance/students?class_id=${encodeURIComponent(classId)}&semester_id=${encodeURIComponent(semesterId)}`)
        const list = data.items || []
        setStudents(list)

        const nextEntries = {}
        for (const s of list) {
          nextEntries[String(s.id)] = 'present'
        }
        setEntriesByStudentId((prev) => ({ ...nextEntries, ...prev }))
      } catch (err) {
        onError?.(err?.data?.error || 'Erreur')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canWrite, semesterId, classId])

  const semestersById = useMemo(() => new Map(semesters.map((s) => [Number(s.id), s])), [semesters])
  const classesById = useMemo(() => new Map(classes.map((c) => [Number(c.id), c])), [classes])
  const subjectsById = useMemo(() => new Map(subjects.map((s) => [Number(s.id), s])), [subjects])

  const rows = useMemo(() => {
    return (items || []).map((r, idx) => {
      const sem = semestersById.get(Number(r.semester_id))
      return {
        id: r.id ?? idx,
        student_id: r.student_id,
        student_name: r.student_name || `#${r.student_id}`,
        session: r.session_code || sem?.code || '-',
        present: r.present_count ?? '-',
        absent: r.absent_count ?? '-'
      }
    })
  }, [items, semestersById])

  const columns = useMemo(() => {
    return [
      { header: 'Étudiant', key: 'student_name', sortValue: (r) => r.student_name, exportValue: (r) => r.student_name || '' },
      { header: 'Session', key: 'session', width: 90, sortValue: (r) => r.session, exportValue: (r) => r.session || '' },
      { header: 'Présent', key: 'present', align: 'right', width: 90, exportValue: (r) => r.present ?? '' },
      { header: 'Absent', key: 'absent', align: 'right', width: 90, exportValue: (r) => r.absent ?? '' }
    ]
  }, [])

  const sessionRows = useMemo(() => {
    return (sessions || []).map((s) => {
      const sem = semestersById.get(Number(s.semester_id))
      const cls = classesById.get(Number(s.class_id))
      const subj = subjectsById.get(Number(s.subject_id))
      return {
        ...s,
        _semesterLabel: sem ? `${sem.code} — ${sem.title}` : `#${s.semester_id}`,
        _classLabel: cls ? `${cls.code} — ${cls.title}` : `#${s.class_id}`,
        _subjectLabel: subj ? `${subj.code} — ${subj.title}` : s.subject_id ? `#${s.subject_id}` : '-'
      }
    })
  }, [sessions, semestersById, classesById, subjectsById])

  const sessionColumns = useMemo(() => {
    return [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Date', key: 'session_date', width: 120, exportValue: (r) => r.session_date || '' },
      { header: 'Semestre', key: '_semesterLabel', sortValue: (r) => r._semesterLabel, exportValue: (r) => r._semesterLabel || '' },
      { header: 'Classe', key: '_classLabel', sortValue: (r) => r._classLabel, exportValue: (r) => r._classLabel || '' },
      { header: 'Matière', key: '_subjectLabel', sortValue: (r) => r._subjectLabel, exportValue: (r) => r._subjectLabel || '' },
      { header: 'Notes', key: 'notes', exportValue: (r) => r.notes || '' },
      {
        header: 'Action',
        render: (r) => (
          <div style={{ textAlign: 'right' }}>
            <Button type="button" onClick={() => openSessionDetails(r.id)}>
              Détails
            </Button>
          </div>
        ),
        exportValue: () => ''
      }
    ]
  }, [Button])

  const entryRows = useMemo(() => {
    return (selectedSessionEntries || []).map((e, idx) => ({ ...e, _id: e.id ?? idx }))
  }, [selectedSessionEntries])

  const entryColumns = useMemo(() => {
    return [
      { header: 'Étudiant ID', key: 'student_id', width: 110, exportValue: (r) => r.student_id ?? '' },
      { header: 'Status', key: 'status', width: 110, exportValue: (r) => r.status || '' },
      { header: 'Remarque', key: 'remark', exportValue: (r) => r.remark || '' }
    ]
  }, [])

  async function createSession(e) {
    e.preventDefault()
    onError?.(null)
    try {
      const entries = Object.entries(entriesByStudentId)
        .map(([sid, status]) => ({ student_id: Number(sid), status }))
        .filter((x) => x.student_id)

      await apiPost('/api/attendance', {
        semester_id: Number(semesterId),
        class_id: Number(classId),
        subject_id: subjectId ? Number(subjectId) : null,
        session_date: sessionDate,
        notes: notes || null,
        entries
      })

      setSemesterId('')
      setClassId('')
      setSubjectId('')
      setSessionDate('')
      setNotes('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit = canWrite && semesterId && classId && sessionDate

  if (embedded) {
    return (
      <DataTable
        title="Récapitulatif"
        subtitle={loading ? 'Chargement…' : null}
        rows={rows}
        columns={columns}
        Button={Button}
        Input={Input}
        Select={Select}
        initialSortKey="student_name"
        initialSortDir="asc"
        defaultPageSize={10}
        exportFileName="attendance.csv"
        searchPlaceholder="Recherche (étudiant, session…)"
        getRowSearchText={(r) => `${r.student_name || ''} ${r.session || ''}`}
      />
    )
  }

  return (
    <div className="card">
      <div className="card__header">Présence</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`pill ${activeTab === 'recap' ? 'pill--active' : ''}`}
              onClick={() => setActiveTab('recap')}
            >
              Récapitulatif
            </button>
            <button
              type="button"
              className={`pill ${activeTab === 'sessions' ? 'pill--active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Séances
            </button>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, flex: '1 1 auto' }}>
            <div style={{ width: 140 }}>
              <Select value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)}>
                <option value="">Tout</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
              </Select>
            </div>
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">{loading ? 'Chargement…' : `Éléments: ${rows.length}`}</div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, flex: '1 1 auto' }} />
        </div>

        {canWrite ? (
          <form onSubmit={createSession} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Semestre</div>
              <Select value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
                <option value="">-- choisir --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Classe</div>
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">-- choisir --</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Matière</div>
              <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">-- optionnel --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Date</div>
              <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </div>

            <div style={{ gridColumn: 'span 4' }}>
              <div className="label">Notes</div>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Remarques…" />
            </div>

            <div style={{ gridColumn: 'span 6' }}>
              <div className="label">Marquage rapide (par étudiant)</div>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                {(students || []).map((s) => (
                  <label key={s.id} className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <span className="badge" style={{ minWidth: 150 }}>
                      {s.matricule} — {s.first_name} {s.last_name}
                    </span>
                    <select
                      className="input"
                      value={entriesByStudentId[String(s.id)] || 'present'}
                      onChange={(e) => setEntriesByStudentId((p) => ({ ...p, [String(s.id)]: e.target.value }))}
                      style={{ width: 120 }}
                    >
                      <option value="present">present</option>
                      <option value="absent">absent</option>
                      <option value="late">late</option>
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: 'span 6' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!canSubmit}>
                Enregistrer la séance
              </Button>
            </div>
          </form>
        ) : (
          <div className="label">Lecture seule.</div>
        )}

        {activeTab === 'recap' ? (
          <DataTable
            title="Récapitulatif"
            subtitle={loading ? 'Chargement…' : null}
            rows={rows}
            columns={columns}
            Button={Button}
            Input={Input}
            Select={Select}
            initialSortKey="student_name"
            initialSortDir="asc"
            defaultPageSize={10}
            exportFileName="attendance.csv"
            searchPlaceholder="Recherche (étudiant, session…)"
            getRowSearchText={(r) => `${r.student_name || ''} ${r.session || ''}`}
          />
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            <DataTable
              title="Séances"
              subtitle={loading ? 'Chargement…' : null}
              rows={sessionRows}
              columns={sessionColumns}
              Button={Button}
              Input={Input}
              Select={Select}
              initialSortKey="session_date"
              initialSortDir="desc"
              defaultPageSize={10}
              exportFileName="attendance_sessions.csv"
              searchPlaceholder="Recherche (date, classe, matière…)"
              getRowSearchText={(r) => `${r.session_date || ''} ${r._classLabel || ''} ${r._subjectLabel || ''} ${r._semesterLabel || ''}`}
            />

            {selectedSession ? (
              <DataTable
                title={`Détail séance #${selectedSession.id}`}
                subtitle={selectedSession.session_date || null}
                rows={entryRows}
                columns={entryColumns}
                rowKey={(r) => r._id}
                Button={Button}
                Input={Input}
                Select={Select}
                initialSortKey="student_id"
                initialSortDir="asc"
                defaultPageSize={10}
                exportFileName="attendance_entries.csv"
                searchPlaceholder="Recherche (étudiant id, status…)"
                getRowSearchText={(r) => `${r.student_id ?? ''} ${r.status || ''} ${r.remark || ''}`}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
