import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'

function dayLabel(n) {
  const d = Number(n)
  if (d === 1) return 'Lundi'
  if (d === 2) return 'Mardi'
  if (d === 3) return 'Mercredi'
  if (d === 4) return 'Jeudi'
  if (d === 5) return 'Vendredi'
  if (d === 6) return 'Samedi'
  if (d === 7) return 'Dimanche'
  return String(n)
}

export default function TimetableView({ role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])

  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [room, setRoom] = useState('')
  const [mode, setMode] = useState('')
  const [onlineUrl, setOnlineUrl] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editSemesterId, setEditSemesterId] = useState('')
  const [editClassId, setEditClassId] = useState('')
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editTeacherId, setEditTeacherId] = useState('')
  const [editDayOfWeek, setEditDayOfWeek] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [editRoom, setEditRoom] = useState('')
  const [editMode, setEditMode] = useState('')
  const [editOnlineUrl, setEditOnlineUrl] = useState('')

  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = useMemo(
    () => [
      { key: 'academique', label: 'Académique' },
      { key: 'professionnel', label: 'Professionnel' },
      { key: 'luban', label: 'Luban' }
    ],
    []
  )

  const canWrite = role === 'admin'

  const semestersById = useMemo(() => {
    const m = new Map()
    for (const s of semesters) m.set(Number(s.id), s)
    return m
  }, [semesters])

  const classesById = useMemo(() => {
    const m = new Map()
    for (const c of classes) m.set(Number(c.id), c)
    return m
  }, [classes])

  const subjectsById = useMemo(() => {
    const m = new Map()
    for (const s of subjects) m.set(Number(s.id), s)
    return m
  }, [subjects])

  const teachersById = useMemo(() => {
    const m = new Map()
    for (const t of teachers) m.set(Number(t.id), t)
    return m
  }, [teachers])

  function classToCategoryKey(cls) {
    if (!cls) return 'academique'
    const code = String(cls.code || '').toLowerCase()
    const title = String(cls.title || '').toLowerCase()
    const hay = `${code} ${title}`
    if (hay.includes('lub')) return 'luban'
    if (hay.includes('pro')) return 'professionnel'
    return 'academique'
  }

  const enriched = useMemo(() => {
    return items.map((e) => {
      const sem = semestersById.get(Number(e.semester_id))
      const cls = classesById.get(Number(e.class_id))
      const subj = subjectsById.get(Number(e.subject_id))
      const t = teachersById.get(Number(e.teacher_id))

      const semesterLabel = sem ? `${sem.code} — ${sem.title}` : `#${e.semester_id}`
      const classLabel = cls ? `${cls.code} — ${cls.title}` : `#${e.class_id}`
      const subjectLabel = subj ? `${subj.code} — ${subj.title}` : `#${e.subject_id}`
      const teacherLabel = t
        ? `${t.first_name} ${t.last_name}${t.specialite ? ` — ${t.specialite}` : ''}`
        : `#${e.teacher_id}`

      const whenLabel = `${dayLabel(e.day_of_week)} ${e.start_time} - ${e.end_time}`
      const categoryKey = classToCategoryKey(cls)

      return {
        ...e,
        _semesterLabel: semesterLabel,
        _classLabel: classLabel,
        _subjectLabel: subjectLabel,
        _teacherLabel: teacherLabel,
        _whenLabel: whenLabel,
        _categoryKey: categoryKey
      }
    })
  }, [items, semestersById, classesById, subjectsById, teachersById])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = enriched
    list = list.filter((e) => {
      const d = Number(e.day_of_week)
      return d >= 1 && d <= 6
    })
    if (selectedCategory) {
      list = list.filter((e) => String(e._categoryKey || '') === String(selectedCategory))
    }
    if (!q) return list
    return list.filter((e) => {
      const hay = `${e.id} ${e._semesterLabel} ${e._classLabel} ${e._subjectLabel} ${e._teacherLabel} ${e._whenLabel} ${e.room || ''} ${
        e.mode || ''
      } ${e.online_url || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [enriched, query, selectedCategory])

  async function refreshAll() {
    setLoading(true)
    try {
      const [tt, sem, cls, sub, tea] = await Promise.all([
        apiGet('/api/timetable'),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects'),
        apiGet('/api/teachers')
      ])
      setItems(tt.items || [])
      setSemesters(sem.items || [])
      setClasses(cls.items || [])
      setSubjects(sub.items || [])
      setTeachers(tea.items || [])
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  async function onCreate(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/timetable', {
        semester_id: Number(semesterId),
        class_id: Number(classId),
        subject_id: Number(subjectId),
        teacher_id: Number(teacherId),
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        room: room || null,
        mode: mode || null,
        online_url: onlineUrl || null
      })
      setSemesterId('')
      setClassId('')
      setSubjectId('')
      setTeacherId('')
      setDayOfWeek('')
      setStartTime('')
      setEndTime('')
      setRoom('')
      setMode('')
      setOnlineUrl('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditSemesterId(String(row.semester_id))
    setEditClassId(String(row.class_id))
    setEditSubjectId(String(row.subject_id))
    setEditTeacherId(String(row.teacher_id))
    setEditDayOfWeek(String(row.day_of_week))
    setEditStartTime(row.start_time || '')
    setEditEndTime(row.end_time || '')
    setEditRoom(row.room || '')
    setEditMode(row.mode || '')
    setEditOnlineUrl(row.online_url || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditSemesterId('')
    setEditClassId('')
    setEditSubjectId('')
    setEditTeacherId('')
    setEditDayOfWeek('')
    setEditStartTime('')
    setEditEndTime('')
    setEditRoom('')
    setEditMode('')
    setEditOnlineUrl('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/timetable/${id}`, {
        semester_id: Number(editSemesterId),
        class_id: Number(editClassId),
        subject_id: Number(editSubjectId),
        teacher_id: Number(editTeacherId),
        day_of_week: Number(editDayOfWeek),
        start_time: editStartTime,
        end_time: editEndTime,
        room: editRoom || null,
        mode: editMode || null,
        online_url: editOnlineUrl || null
      })
      cancelEdit()
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/timetable/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit =
    semesterId && classId && subjectId && teacherId && dayOfWeek && startTime && endTime

  const days = useMemo(() => [1, 2, 3, 4, 5, 6], [])

  const filteredByDay = useMemo(() => {
    const m = new Map()
    for (const d of days) m.set(d, [])
    for (const e of filtered) {
      const d = Number(e.day_of_week)
      if (m.has(d)) m.get(d).push(e)
    }
    return m
  }, [filtered, days])

  return (
    <div className="card">
      <div className="card__header">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800 }}>Emplois du temps</div>

          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              {categories.map((c) => {
                const isActive = selectedCategory === c.key
                return (
                  <div key={c.key} style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: 150,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        border: isActive ? '2px solid #000' : '1px solid #d9d9d9',
                        borderRadius: 10,
                        background: '#fff',
                        fontWeight: 800,
                        color: '#000'
                      }}
                      onClick={() => {
                        setSelectedCategory((cur) => (cur === c.key ? '' : c.key))
                      }}
                    >
                      {c.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            Total: {items.length} • Affichés: {filtered.length} {loading ? '• Chargement…' : ''}
          </div>
          <div style={{ minWidth: 260, flex: '0 0 auto' }}>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche (classe, matière, prof, horaire…)" />
          </div>
        </div>

        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
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
                <option value="">-- choisir --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Enseignant</div>
              <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                <option value="">-- choisir --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.first_name} {t.last_name}
                    {t.specialite ? ` — ${t.specialite}` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Jour</div>
              <Select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                <option value="">--</option>
                <option value="1">Lundi</option>
                <option value="2">Mardi</option>
                <option value="3">Mercredi</option>
                <option value="4">Jeudi</option>
                <option value="5">Vendredi</option>
                <option value="6">Samedi</option>
              </Select>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Début</div>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Fin</div>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Salle</div>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Salle 12" />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Mode</div>
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="">--</option>
                <option value="presentiel">Présentiel</option>
                <option value="online">En ligne</option>
              </Select>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Lien (optionnel)</div>
              <Input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="https://…" />
            </div>

            <div style={{ gridColumn: 'span 6', alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!canSubmit}>
                Ajouter
              </Button>
            </div>
          </form>
        ) : (
          <div className="label">Lecture seule.</div>
        )}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Jour</th>
                <th>Semestre</th>
                <th>Classe</th>
                <th>Matière</th>
                <th>Enseignant</th>
                <th>Heure</th>
                <th>Salle</th>
                <th>Mode</th>
                <th>Lien</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {canWrite
                ? filtered.map((e) => {
                    const isEditing = canWrite && editingId === e.id
                    return (
                      <tr
                        key={e.id}
                        onClick={
                          canWrite && !isEditing
                            ? () => {
                                startEdit(e)
                              }
                            : undefined
                        }
                        style={{ cursor: canWrite && !isEditing ? 'pointer' : undefined }}
                      >
                        <td>
                          {isEditing ? (
                            <Select value={editDayOfWeek} onChange={(ev) => setEditDayOfWeek(ev.target.value)}>
                              <option value="">--</option>
                              <option value="1">Lundi</option>
                              <option value="2">Mardi</option>
                              <option value="3">Mercredi</option>
                              <option value="4">Jeudi</option>
                              <option value="5">Vendredi</option>
                              <option value="6">Samedi</option>
                            </Select>
                          ) : (
                            dayLabel(e.day_of_week)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Select value={editSemesterId} onChange={(ev) => setEditSemesterId(ev.target.value)}>
                              <option value="">-- choisir --</option>
                              {semesters.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                  {s.code} — {s.title}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            e._semesterLabel
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Select value={editClassId} onChange={(ev) => setEditClassId(ev.target.value)}>
                              <option value="">-- choisir --</option>
                              {classes.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                  {c.code} — {c.title}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            e._classLabel
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Select value={editSubjectId} onChange={(ev) => setEditSubjectId(ev.target.value)}>
                              <option value="">-- choisir --</option>
                              {subjects.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                  {s.code} — {s.title}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            e._subjectLabel
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Select value={editTeacherId} onChange={(ev) => setEditTeacherId(ev.target.value)}>
                              <option value="">-- choisir --</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={String(t.id)}>
                                  {t.first_name} {t.last_name}
                                  {t.specialite ? ` — ${t.specialite}` : ''}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            e._teacherLabel
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="row">
                              <Input type="time" value={editStartTime} onChange={(ev) => setEditStartTime(ev.target.value)} />
                              <Input type="time" value={editEndTime} onChange={(ev) => setEditEndTime(ev.target.value)} />
                            </div>
                          ) : (
                            `${e.start_time} - ${e.end_time}`
                          )}
                        </td>
                        <td>
                          {isEditing ? <Input value={editRoom} onChange={(ev) => setEditRoom(ev.target.value)} /> : e.room || '-'}
                        </td>
                        <td>
                          {isEditing ? (
                            <Select value={editMode} onChange={(ev) => setEditMode(ev.target.value)}>
                              <option value="">--</option>
                              <option value="presentiel">Présentiel</option>
                              <option value="online">En ligne</option>
                            </Select>
                          ) : (
                            e.mode || '-'
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input value={editOnlineUrl} onChange={(ev) => setEditOnlineUrl(ev.target.value)} placeholder="https://…" />
                          ) : e.online_url ? (
                            <a href={e.online_url} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()}>
                              Ouvrir
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {canWrite ? (
                            isEditing ? (
                              <div className="row" style={{ justifyContent: 'flex-end' }}>
                                <Button
                                  variant="primary"
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    saveEdit(e.id)
                                  }}
                                  disabled={
                                    !editSemesterId ||
                                    !editClassId ||
                                    !editSubjectId ||
                                    !editTeacherId ||
                                    !editDayOfWeek ||
                                    !editStartTime ||
                                    !editEndTime
                                  }
                                >
                                  Enregistrer
                                </Button>
                                <Button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    cancelEdit()
                                  }}
                                >
                                  Annuler
                                </Button>
                              </div>
                            ) : (
                              <div className="row" style={{ justifyContent: 'flex-end' }}>
                                <Button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    startEdit(e)
                                  }}
                                >
                                  Modifier
                                </Button>
                                <Button
                                  variant="danger"
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    onDelete(e.id)
                                  }}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            )
                          ) : null}
                        </td>
                      </tr>
                    )
                  })
                : days.map((d) => {
                    const list = (filteredByDay.get(d) || []).slice().sort((a, b) => String(a.start_time || '').localeCompare(String(b.start_time || '')))
                    const cellWrapStyle = { display: 'grid', gap: 4 }
                    const dash = <span className="label">-</span>

                    return (
                      <tr key={`day-${d}`}>
                        <td style={{ fontWeight: 800, color: 'var(--brand)' }}>{dayLabel(d)}</td>
                        <td>{list.length ? <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{e._semesterLabel}</div>)}</div> : dash}</td>
                        <td>{list.length ? <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{e._classLabel}</div>)}</div> : dash}</td>
                        <td>{list.length ? <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{e._subjectLabel}</div>)}</div> : dash}</td>
                        <td>{list.length ? <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{e._teacherLabel}</div>)}</div> : dash}</td>
                        <td>
                          {list.length ? (
                            <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{`${e.start_time} - ${e.end_time}`}</div>)}</div>
                          ) : (
                            dash
                          )}
                        </td>
                        <td>{list.length ? <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{e.room || '-'}</div>)}</div> : dash}</td>
                        <td>{list.length ? <div style={cellWrapStyle}>{list.map((e) => <div key={e.id}>{e.mode || '-'}</div>)}</div> : dash}</td>
                        <td>
                          {list.length ? (
                            <div style={cellWrapStyle}>
                              {list.map((e) => (
                                <div key={e.id}>
                                  {e.online_url ? (
                                    <a href={e.online_url} target="_blank" rel="noreferrer">
                                      Ouvrir
                                    </a>
                                  ) : (
                                    '-'
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            dash
                          )}
                        </td>
                        <td></td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
