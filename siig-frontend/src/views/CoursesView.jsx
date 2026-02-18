import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'

export default function CoursesView({ role, Button, Input, Select, onError }) {
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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editSemesterId, setEditSemesterId] = useState('')
  const [editClassId, setEditClassId] = useState('')
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editTeacherId, setEditTeacherId] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editResourceUrl, setEditResourceUrl] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

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

  const enriched = useMemo(() => {
    return items.map((c) => {
      const sem = semestersById.get(Number(c.semester_id))
      const cls = classesById.get(Number(c.class_id))
      const subj = subjectsById.get(Number(c.subject_id))
      const t = teachersById.get(Number(c.teacher_id))

      return {
        ...c,
        _semesterLabel: sem ? `${sem.code} — ${sem.title}` : `#${c.semester_id}`,
        _classLabel: cls ? `${cls.code} — ${cls.title}` : `#${c.class_id}`,
        _subjectLabel: subj ? `${subj.code} — ${subj.title}` : `#${c.subject_id}`,
        _teacherLabel: t ? `${t.first_name} ${t.last_name}${t.specialite ? ` — ${t.specialite}` : ''}` : `#${c.teacher_id}`
      }
    })
  }, [items, semestersById, classesById, subjectsById, teachersById])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return enriched
    return enriched.filter((c) => {
      const hay = `${c.id} ${c._semesterLabel} ${c._classLabel} ${c._subjectLabel} ${c._teacherLabel} ${c.title || ''} ${
        c.description || ''
      } ${c.resource_url || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [enriched, query])

  async function refreshAll() {
    setLoading(true)
    try {
      const [courses, sem, cls, sub, tea] = await Promise.all([
        apiGet('/api/courses'),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects'),
        apiGet('/api/teachers')
      ])
      setItems(courses.items || [])
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
      await apiPost('/api/courses', {
        semester_id: Number(semesterId),
        class_id: Number(classId),
        subject_id: Number(subjectId),
        teacher_id: Number(teacherId),
        title,
        description: description || null,
        resource_url: resourceUrl || null
      })
      setSemesterId('')
      setClassId('')
      setSubjectId('')
      setTeacherId('')
      setTitle('')
      setDescription('')
      setResourceUrl('')
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
    setEditTitle(row.title || '')
    setEditDescription(row.description || '')
    setEditResourceUrl(row.resource_url || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditSemesterId('')
    setEditClassId('')
    setEditSubjectId('')
    setEditTeacherId('')
    setEditTitle('')
    setEditDescription('')
    setEditResourceUrl('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/courses/${id}`, {
        semester_id: Number(editSemesterId),
        class_id: Number(editClassId),
        subject_id: Number(editSubjectId),
        teacher_id: Number(editTeacherId),
        title: editTitle,
        description: editDescription || null,
        resource_url: editResourceUrl || null
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
      await apiDelete(`/api/courses/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit = semesterId && classId && subjectId && teacherId && title

  return (
    <div className="card">
      <div className="card__header">Cours en ligne</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            Total: {items.length} • Affichés: {filtered.length} {loading ? '• Chargement…' : ''}
          </div>
          <div style={{ minWidth: 260, flex: '0 0 auto' }}>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche (titre, matière, classe, lien…)" />
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

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapitre 1 — …" />
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <div className="label">Description (optionnel)</div>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Résumé / consignes…" />
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <div className="label">Lien ressource (optionnel)</div>
              <Input value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="https://…" />
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
                <th>ID</th>
                <th>Semestre</th>
                <th>Classe</th>
                <th>Matière</th>
                <th>Enseignant</th>
                <th>Titre</th>
                <th>Lien</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isEditing = canWrite && editingId === c.id
                return (
                  <tr key={c.id}>
                    <td>{c.id}</td>
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
                        c._semesterLabel
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Select value={editClassId} onChange={(ev) => setEditClassId(ev.target.value)}>
                          <option value="">-- choisir --</option>
                          {classes.map((cl) => (
                            <option key={cl.id} value={String(cl.id)}>
                              {cl.code} — {cl.title}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        c._classLabel
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
                        c._subjectLabel
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
                        c._teacherLabel
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)} />
                      ) : (
                        <div>
                          <div>{c.title}</div>
                          {c.description ? <div className="label">{c.description}</div> : null}
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input value={editResourceUrl} onChange={(ev) => setEditResourceUrl(ev.target.value)} placeholder="https://…" />
                      ) : c.resource_url ? (
                        <a href={c.resource_url} target="_blank" rel="noreferrer">
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
                              onClick={() => saveEdit(c.id)}
                              disabled={!editSemesterId || !editClassId || !editSubjectId || !editTeacherId || !editTitle}
                            >
                              Enregistrer
                            </Button>
                            <Button type="button" onClick={cancelEdit}>
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <div className="row" style={{ justifyContent: 'flex-end' }}>
                            <Button type="button" onClick={() => startEdit(c)}>
                              Modifier
                            </Button>
                            <Button variant="danger" type="button" onClick={() => onDelete(c.id)}>
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
                  <td colSpan={8} className="label" style={{ padding: 16 }}>
                    Aucun cours.
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
