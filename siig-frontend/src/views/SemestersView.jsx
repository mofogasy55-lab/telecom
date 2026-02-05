import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

function levelToSessions(level) {
  const raw = String(level || '').toLowerCase()
  if (!raw) return null

  if (raw.includes('licencepro 1') || raw.includes('licence 1')) return ['S1', 'S2']
  if (raw.includes('licencepro 2') || raw.includes('licence 2')) return ['S3', 'S4']
  if (raw.includes('licencepro 3') || raw.includes('licence 3')) return ['S5', 'S6']
  if (raw.includes('masterpro 1') || raw.includes('master 1')) return ['S7', 'S8']
  if (raw.includes('masterpro 2') || raw.includes('master 2')) return ['S9', 'S10']

  return null
}

function formatScore(v) {
  if (v == null || Number.isNaN(Number(v))) return '-'
  const n = Number(v)
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function ProfSemestersDashboard({ Button, Input, Select, onError }) {
  const [loading, setLoading] = useState(false)
  const [grades, setGrades] = useState([])
  const [assessments, setAssessments] = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [semesters, setSemesters] = useState([])

  const [openMenu, setOpenMenu] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const nowYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(nowYear)

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const [selectedSession, setSelectedSession] = useState('')

  const [selectedStudentId, setSelectedStudentId] = useState('')

  const categories = useMemo(
    () => [
      {
        key: 'academique',
        label: 'Académique',
        levels: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
      },
      {
        key: 'professionnel',
        label: 'Professionnel',
        levels: ['LicencePro 1', 'LicencePro 2', 'LicencePro 3', 'MasterPro 1', 'MasterPro 2']
      },
      {
        key: 'luban',
        label: 'Luban',
        levels: ['Licence 1', 'Licence 2', 'Licence 3']
      }
    ],
    []
  )

  async function refreshAll() {
    setLoading(true)
    onError?.(null)
    try {
      const [gr, ass, stu, sub, sem] = await Promise.all([
        apiGet('/api/grades'),
        apiGet('/api/assessments'),
        apiGet('/api/students'),
        apiGet('/api/subjects'),
        apiGet('/api/semesters')
      ])
      setGrades(gr.items || [])
      setAssessments(ass.items || [])
      setStudents(stu.items || [])
      setSubjects(sub.items || [])
      setSemesters(sem.items || [])
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const semestersById = useMemo(() => new Map(semesters.map((s) => [Number(s.id), s])), [semesters])
  const assessmentsById = useMemo(() => new Map(assessments.map((a) => [Number(a.id), a])), [assessments])
  const subjectsById = useMemo(() => new Map(subjects.map((s) => [Number(s.id), s])), [subjects])

  const sessionsForLevel = useMemo(() => {
    return levelToSessions(selectedLevel) || ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']
  }, [selectedLevel])

  const allowedSessionCodes = useMemo(() => {
    if (selectedSession) return [selectedSession]
    return sessionsForLevel
  }, [selectedSession, sessionsForLevel])

  const filteredStudents = useMemo(() => {
    let list = students
    if (selectedCategory) list = list.filter((s) => String(s.track_category || '') === selectedCategory)
    if (selectedLevel) list = list.filter((s) => String(s.track_level || '') === selectedLevel)
    if (selectedStudentId) list = list.filter((s) => String(s.id) === String(selectedStudentId))
    return list
  }, [students, selectedCategory, selectedLevel, selectedStudentId])

  const filteredAssessments = useMemo(() => {
    if (!allowedSessionCodes.length) return []
    const codes = new Set(allowedSessionCodes)
    return assessments.filter((a) => {
      const sem = semestersById.get(Number(a.semester_id))
      const code = String(sem?.code || '')
      if (!codes.has(code)) return false

      const d = a.assessment_date ? new Date(a.assessment_date) : null
      if (d && !Number.isNaN(d.getTime())) {
        return d.getFullYear() === Number(selectedYear)
      }
      return true
    })
  }, [assessments, semestersById, allowedSessionCodes, selectedYear])

  const subjectColumns = useMemo(() => {
    const subjectIds = new Set(filteredAssessments.map((a) => Number(a.subject_id)))
    const base = subjects
      .filter((s) => (subjectIds.size ? subjectIds.has(Number(s.id)) : true))
      .slice()
      .sort((a, b) => String(a.code || '').localeCompare(String(b.code || ''), undefined, { numeric: true, sensitivity: 'base' }))
    return base.slice(0, 20)
  }, [subjects, filteredAssessments])

  const scoreByStudentSubject = useMemo(() => {
    const allowedAssessmentIds = new Set(filteredAssessments.map((a) => Number(a.id)))
    const map = new Map()

    for (const g of grades) {
      const aid = Number(g.assessment_id)
      if (!allowedAssessmentIds.has(aid)) continue
      const a = assessmentsById.get(aid)
      if (!a) continue
      const sid = Number(g.student_id)
      const subjId = Number(a.subject_id)
      const score = g.score == null ? null : Number(g.score)
      if (score == null || Number.isNaN(score)) continue

      let bySubj = map.get(sid)
      if (!bySubj) {
        bySubj = new Map()
        map.set(sid, bySubj)
      }
      const cur = bySubj.get(subjId) || { sum: 0, count: 0 }
      cur.sum += score
      cur.count += 1
      bySubj.set(subjId, cur)
    }

    return map
  }, [grades, filteredAssessments, assessmentsById])

  const tableRows = useMemo(() => {
    return filteredStudents.map((s) => {
      const sid = Number(s.id)
      const bySubj = scoreByStudentSubject.get(sid) || new Map()
      const row = {
        id: s.id,
        full_name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || `#${s.id}`,
        matricule: s.matricule || ''
      }

      let sum = 0
      let count = 0

      for (const subj of subjectColumns) {
        const subjId = Number(subj.id)
        const agg = bySubj.get(subjId)
        const avg = agg && agg.count ? agg.sum / agg.count : null
        row[`sub_${subjId}`] = avg
        if (avg != null && !Number.isNaN(avg)) {
          sum += avg
          count += 1
        }
      }

      row.moyenne = count ? sum / count : null
      return row
    })
  }, [filteredStudents, scoreByStudentSubject, subjectColumns])

  const columns = useMemo(() => {
    const cols = [
      {
        header: 'Nom complet',
        key: 'full_name',
        sortValue: (r) => `${r.full_name || ''}`,
        exportValue: (r) => r.full_name || ''
      }
    ]

    for (const subj of subjectColumns) {
      const subjId = Number(subj.id)
      cols.push({
        header: subj.code || subj.title || `#${subj.id}`,
        key: `sub_${subjId}`,
        align: 'right',
        width: 90,
        render: (r) => formatScore(r[`sub_${subjId}`]),
        exportValue: (r) => (r[`sub_${subjId}`] == null ? '' : r[`sub_${subjId}`])
      })
    }

    cols.push({
      header: 'Moyenne',
      key: 'moyenne',
      align: 'right',
      width: 110,
      render: (r) => formatScore(r.moyenne),
      exportValue: (r) => (r.moyenne == null ? '' : r.moyenne)
    })
    return cols
  }, [subjectColumns])

  const parcoursRows = useMemo(() => {
    if (!selectedStudentId) return []
    const sid = Number(selectedStudentId)
    const res = []

    for (const g of grades) {
      if (Number(g.student_id) !== sid) continue
      const a = assessmentsById.get(Number(g.assessment_id))
      const sem = a ? semestersById.get(Number(a.semester_id)) : null
      const subj = a ? subjectsById.get(Number(a.subject_id)) : null

      const d = a?.assessment_date ? new Date(a.assessment_date) : null
      if (d && !Number.isNaN(d.getTime()) && d.getFullYear() !== Number(selectedYear)) continue

      res.push({
        id: g.id,
        session: sem?.code || (a?.semester_id ? `#${a.semester_id}` : '-'),
        subject: subj ? `${subj.code || ''} — ${subj.title || ''}`.trim() : a?.subject_id ? `#${a.subject_id}` : '-',
        assessment: a ? `${a.kind || ''} — ${a.title || ''}`.trim() : g.assessment_id ? `#${g.assessment_id}` : '-',
        score: g.score,
        date: g.graded_at || a?.assessment_date || ''
      })
    }

    res.sort((x, y) => {
      const xs = String(x.session || '')
      const ys = String(y.session || '')
      const c = xs.localeCompare(ys, undefined, { numeric: true, sensitivity: 'base' })
      if (c !== 0) return c
      return String(x.subject || '').localeCompare(String(y.subject || ''), undefined, { numeric: true, sensitivity: 'base' })
    })

    return res
  }, [selectedStudentId, grades, assessmentsById, semestersById, subjectsById, selectedYear])

  const parcoursColumns = useMemo(() => {
    return [
      { header: 'Session', key: 'session', width: 90, sortValue: (r) => r.session, exportValue: (r) => r.session || '' },
      { header: 'Matière', key: 'subject', sortValue: (r) => r.subject, exportValue: (r) => r.subject || '' },
      { header: 'Évaluation', key: 'assessment', sortValue: (r) => r.assessment, exportValue: (r) => r.assessment || '' },
      {
        header: 'Note',
        key: 'score',
        align: 'right',
        width: 90,
        render: (r) => formatScore(r.score),
        exportValue: (r) => (r.score == null ? '' : r.score)
      },
      { header: 'Date', key: 'date', width: 120, exportValue: (r) => r.date || '' }
    ]
  }, [])

  const years = useMemo(() => {
    const res = []
    for (let y = selectedYear - 3; y <= selectedYear + 3; y += 1) res.push(y)
    return res
  }, [selectedYear])

  function closeMenus() {
    setOpenMenu(null)
    setHoveredCategory(null)
  }

  const studentOptions = useMemo(() => {
    return students
      .slice()
      .sort((a, b) => {
        const as = `${a.last_name || ''} ${a.first_name || ''}`.trim()
        const bs = `${b.last_name || ''} ${b.first_name || ''}`.trim()
        return as.localeCompare(bs, undefined, { numeric: true, sensitivity: 'base' })
      })
      .map((s) => ({
        id: String(s.id),
        label: `${s.matricule || ''} — ${s.first_name || ''} ${s.last_name || ''}`.trim()
      }))
  }, [students])

  return (
    <div className="card">
      <div className="card__header">
        <div className="semHeader">
          <div className="semHeader__title">Semestres</div>

          <div className="semHeader__actions">
            <div className="hoverMenu" onMouseEnter={() => setOpenMenu('date')} onMouseLeave={() => setOpenMenu((v) => (v === 'date' ? null : v))}>
              <button type="button" className="hoverMenu__btn">
                Date
              </button>
              {openMenu === 'date' ? (
                <div className="hoverMenu__panel" style={{ width: 260 }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedYear((y) => y - 1)
                      }}
                    >
                      Année -
                    </Button>
                    <div style={{ fontWeight: 900, color: '#000' }}>{selectedYear}</div>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedYear((y) => y + 1)
                      }}
                    >
                      Année +
                    </Button>
                  </div>

                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        className={`whiteItem ${y === selectedYear ? 'whiteItem--active' : ''}`}
                        onClick={() => {
                          setSelectedYear(y)
                          closeMenus()
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="hoverMenu"
              onMouseEnter={() => {
                setOpenMenu('type')
                setHoveredCategory((v) => v || selectedCategory || categories[0]?.key || null)
              }}
              onMouseLeave={() => {
                setOpenMenu((v) => (v === 'type' ? null : v))
                setHoveredCategory(null)
              }}
            >
              <button type="button" className="hoverMenu__btn">
                Type
              </button>
              {openMenu === 'type' ? (
                <div className="hoverMenu__panel hoverMenu__panel--step">
                  <div className="stepMenu">
                    <div className="stepMenu__col">
                      {categories.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          className={`whiteItem ${selectedCategory === c.key ? 'whiteItem--active' : ''}`}
                          onMouseEnter={() => setHoveredCategory(c.key)}
                          onClick={() => {
                            setSelectedCategory(c.key)
                            setSelectedLevel('')
                          }}
                        >
                          {c.label}
                        </button>
                      ))}

                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('')
                          setSelectedLevel('')
                          closeMenus()
                        }}
                      >
                        Réinitialiser
                      </Button>
                    </div>

                    <div className="stepMenu__col stepMenu__col--right">
                      {(categories.find((c) => c.key === hoveredCategory)?.levels || []).map((lvl) => (
                        <button
                          key={`${hoveredCategory}:${lvl}`}
                          type="button"
                          className={`whiteSubItem ${selectedLevel === lvl ? 'whiteSubItem--active' : ''}`}
                          onClick={() => {
                            setSelectedLevel(lvl)
                            closeMenus()
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="hoverMenu" onMouseEnter={() => setOpenMenu('session')} onMouseLeave={() => setOpenMenu((v) => (v === 'session' ? null : v))}>
              <button type="button" className="hoverMenu__btn">
                Session
              </button>
              {openMenu === 'session' ? (
                <div className="hoverMenu__panel" style={{ width: 240 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button
                      type="button"
                      className={`whiteItem ${selectedSession === '' ? 'whiteItem--active' : ''}`}
                      onClick={() => {
                        setSelectedSession('')
                        closeMenus()
                      }}
                    >
                      Toutes ({sessionsForLevel.join(', ')})
                    </button>
                    {sessionsForLevel.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`whiteItem ${selectedSession === s ? 'whiteItem--active' : ''}`}
                        onClick={() => {
                          setSelectedSession(s)
                          closeMenus()
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            {loading ? 'Chargement…' : 'Prêt'} • Année: {selectedYear} • Type: {selectedCategory || '-'} • Niveau: {selectedLevel || '-'} • Session: {selectedSession || 'Toutes'}
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
            <div style={{ minWidth: 320, flex: '0 0 auto' }}>
              <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                <option value="">-- tous les étudiants --</option>
                {studentOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </div>

        <DataTable
          title="Tableau des notes globales"
          subtitle={loading ? 'Chargement…' : null}
          rows={tableRows}
          columns={columns}
          Button={Button}
          Input={Input}
          Select={Select}
          initialSortKey="full_name"
          initialSortDir="asc"
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          exportFileName="notes_globales.csv"
          searchPlaceholder="Recherche (nom, notes…)"
          getRowSearchText={(r) => {
            const parts = [r.full_name || '', r.matricule || '']
            for (const subj of subjectColumns) {
              parts.push(String(r[`sub_${Number(subj.id)}`] ?? ''))
            }
            parts.push(String(r.moyenne ?? ''))
            return parts.join(' ')
          }}
        />

        {selectedStudentId ? (
          <DataTable
            title="Parcours de l'étudiant"
            subtitle={loading ? 'Chargement…' : `Éléments: ${parcoursRows.length}`}
            rows={parcoursRows}
            columns={parcoursColumns}
            Button={Button}
            Input={Input}
            Select={Select}
            initialSortKey="session"
            initialSortDir="asc"
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            exportFileName="parcours_etudiant.csv"
            searchPlaceholder="Recherche (session, matière, évaluation…)"
            getRowSearchText={(r) => `${r.session || ''} ${r.subject || ''} ${r.assessment || ''} ${r.score ?? ''} ${r.date || ''}`}
          />
        ) : null}

        <div className="label" style={{ margin: 0 }}>
          Astuce: le tableau est scrollable horizontalement pour afficher toutes les colonnes (matières).
        </div>
      </div>
    </div>
  )
}

export default function SemestersView({ role, Button, Input, Select, onError }) {
  if (role === 'prof') {
    return <ProfSemestersDashboard Button={Button} Input={Input} Select={Select} onError={onError} />
  }

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editCode, setEditCode] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((s) => `${s.code || ''} ${s.title || ''}`.toLowerCase().includes(q))
  }, [items, query])

  async function refresh() {
    setLoading(true)
    try {
      const data = await apiGet('/api/semesters')
      setItems(data.items || [])
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  async function onCreate(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/semesters', { code, title })
      setCode('')
      setTitle('')
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditCode(row.code || '')
    setEditTitle(row.title || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditCode('')
    setEditTitle('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/semesters/${id}`, { code: editCode, title: editTitle })
      cancelEdit()
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/semesters/${id}`)
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">Semestres</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            Total: {items.length} • Affichés: {filtered.length} {loading ? '• Chargement…' : ''}
          </div>
          <div style={{ minWidth: 260, flex: '0 0 auto' }}>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche (code, titre…)" />
          </div>
        </div>

        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>
              <div className="label">Code</div>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="S1" />
            </div>
            <div>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Semestre 1" />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
                Ajouter
              </Button>
            </div>
          </form>
        ) : null}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Titre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isEditing = canWrite && editingId === s.id
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      {isEditing ? (
                        <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                      ) : (
                        s.code
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      ) : (
                        s.title
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {canWrite ? (
                        isEditing ? (
                          <div className="row" style={{ justifyContent: 'flex-end' }}>
                            <Button variant="primary" type="button" onClick={() => saveEdit(s.id)}>
                              Enregistrer
                            </Button>
                            <Button type="button" onClick={cancelEdit}>
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <div className="row" style={{ justifyContent: 'flex-end' }}>
                            <Button type="button" onClick={() => startEdit(s)}>
                              Modifier
                            </Button>
                            <Button variant="danger" type="button" onClick={() => onDelete(s.id)}>
                              Supprimer
                            </Button>
                          </div>
                        )
                      ) : null}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="label" style={{ padding: 16 }}>
                    Aucun semestre.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
