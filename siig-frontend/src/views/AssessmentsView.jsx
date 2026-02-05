import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function AssessmentsView({ user, role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])

  const [loading, setLoading] = useState(false)

  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [kind, setKind] = useState('exam')
  const [title, setTitle] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [coefficient, setCoefficient] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [editingId, setEditingId] = useState(null)
  const [editSemesterId, setEditSemesterId] = useState('')
  const [editClassId, setEditClassId] = useState('')
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editTeacherId, setEditTeacherId] = useState('')
  const [editKind, setEditKind] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editAssessmentDate, setEditAssessmentDate] = useState('')
  const [editMaxScore, setEditMaxScore] = useState('')
  const [editCoefficient, setEditCoefficient] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(true)

  const canWrite = role === 'admin' || role === 'prof'

  const myTeacherId = user?.teacher_id != null ? Number(user.teacher_id) : 0
  const isProf = role === 'prof'

  const teachersForCreate = useMemo(() => {
    if (!isProf) return teachers
    if (!myTeacherId) return []
    return teachers.filter((t) => Number(t.id) === myTeacherId)
  }, [teachers, isProf, myTeacherId])

  useEffect(() => {
    if (isProf && myTeacherId > 0) {
      setTeacherId(String(myTeacherId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProf, myTeacherId])

  function canEditAssessment(a) {
    if (role === 'admin') return true
    if (role !== 'prof') return false
    if (!myTeacherId) return false
    return Number(a.teacher_id) === myTeacherId
  }

  const semestersById = useMemo(() => new Map(semesters.map((s) => [Number(s.id), s])), [semesters])
  const classesById = useMemo(() => new Map(classes.map((c) => [Number(c.id), c])), [classes])
  const subjectsById = useMemo(() => new Map(subjects.map((s) => [Number(s.id), s])), [subjects])
  const teachersById = useMemo(() => new Map(teachers.map((t) => [Number(t.id), t])), [teachers])

  const enriched = useMemo(() => {
    return items.map((a) => {
      const sem = semestersById.get(Number(a.semester_id))
      const cls = classesById.get(Number(a.class_id))
      const subj = subjectsById.get(Number(a.subject_id))
      const tea = teachersById.get(Number(a.teacher_id))

      return {
        ...a,
        _semesterLabel: sem ? `${sem.code} — ${sem.title}` : `#${a.semester_id}`,
        _classLabel: cls ? `${cls.code} — ${cls.title}` : `#${a.class_id}`,
        _subjectLabel: subj ? `${subj.code} — ${subj.title}` : `#${a.subject_id}`,
        _teacherLabel: tea ? `${tea.matricule} — ${tea.first_name} ${tea.last_name}` : `#${a.teacher_id}`
      }
    })
  }, [items, semestersById, classesById, subjectsById, teachersById])

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    {
      header: 'Visible',
      key: 'is_public',
      width: 90,
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        if (isEditing) {
          return <input type="checkbox" checked={!!editIsPublic} onChange={(ev) => setEditIsPublic(ev.target.checked)} />
        }
        const pub = Number(a.is_public ?? 0) === 1
        return pub ? '🔓' : '🔒'
      },
      exportValue: (a) => (Number(a.is_public ?? 0) === 1 ? '1' : '0')
    },
    {
      header: 'Semestre',
      key: '_semesterLabel',
      sortValue: (r) => r._semesterLabel,
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Select value={editSemesterId} onChange={(ev) => setEditSemesterId(ev.target.value)}>
            <option value="">-- choisir --</option>
            {semesters.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.code} — {s.title}
              </option>
            ))}
          </Select>
        ) : (
          a._semesterLabel
        )
      },
      exportValue: (a) => a._semesterLabel
    },
    {
      header: 'Classe',
      key: '_classLabel',
      sortValue: (r) => r._classLabel,
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Select value={editClassId} onChange={(ev) => setEditClassId(ev.target.value)}>
            <option value="">-- choisir --</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.code} — {c.title}
              </option>
            ))}
          </Select>
        ) : (
          a._classLabel
        )
      },
      exportValue: (a) => a._classLabel
    },
    {
      header: 'Matière',
      key: '_subjectLabel',
      sortValue: (r) => r._subjectLabel,
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Select value={editSubjectId} onChange={(ev) => setEditSubjectId(ev.target.value)}>
            <option value="">-- choisir --</option>
            {subjects.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.code} — {s.title}
              </option>
            ))}
          </Select>
        ) : (
          a._subjectLabel
        )
      },
      exportValue: (a) => a._subjectLabel
    },
    {
      header: 'Enseignant',
      key: '_teacherLabel',
      sortValue: (r) => r._teacherLabel,
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Select value={editTeacherId} onChange={(ev) => setEditTeacherId(ev.target.value)}>
            <option value="">-- choisir --</option>
            {teachers.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.matricule} — {t.first_name} {t.last_name}
              </option>
            ))}
          </Select>
        ) : (
          a._teacherLabel
        )
      },
      exportValue: (a) => a._teacherLabel
    },
    {
      header: 'Type',
      key: 'kind',
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Select value={editKind} onChange={(ev) => setEditKind(ev.target.value)}>
            <option value="exam">Examen</option>
            <option value="tp">TP</option>
            <option value="devoir">Devoir</option>
            <option value="quiz">Quiz</option>
            <option value="autre">Autre</option>
          </Select>
        ) : (
          a.kind
        )
      },
      exportValue: (a) => a.kind || ''
    },
    {
      header: 'Titre',
      key: 'title',
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? <Input value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)} /> : a.title
      },
      exportValue: (a) => a.title || ''
    },
    {
      header: 'Date',
      key: 'assessment_date',
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Input type="date" value={editAssessmentDate || ''} onChange={(ev) => setEditAssessmentDate(ev.target.value)} />
        ) : (
          a.assessment_date || '-'
        )
      },
      exportValue: (a) => a.assessment_date || ''
    },
    {
      header: 'Barème',
      key: 'max_score',
      align: 'right',
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Input type="number" value={editMaxScore} onChange={(ev) => setEditMaxScore(ev.target.value)} placeholder="20" />
        ) : (
          a.max_score ?? '-'
        )
      },
      exportValue: (a) => a.max_score ?? ''
    },
    {
      header: 'Coeff',
      key: 'coefficient',
      align: 'right',
      render: (a) => {
        const isEditing = canWrite && canEditAssessment(a) && editingId === a.id
        return isEditing ? (
          <Input type="number" value={editCoefficient} onChange={(ev) => setEditCoefficient(ev.target.value)} placeholder="1" />
        ) : (
          a.coefficient ?? '-'
        )
      },
      exportValue: (a) => a.coefficient ?? ''
    },
    {
      header: 'Actions',
      render: (a) => {
        const canEditRow = canWrite && canEditAssessment(a)
        const isEditing = canEditRow && editingId === a.id
        return (
          <div style={{ textAlign: 'right' }}>
            {canEditRow ? (
              isEditing ? (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => saveEdit(a.id)}
                    disabled={!editSemesterId || !editClassId || !editSubjectId || !editTeacherId || !editKind || !editTitle}
                  >
                    Enregistrer
                  </Button>
                  <Button type="button" onClick={cancelEdit}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button type="button" onClick={() => startEdit(a)}>
                    Modifier
                  </Button>
                  <Button variant="danger" type="button" onClick={() => onDelete(a.id)}>
                    Supprimer
                  </Button>
                </div>
              )
            ) : canWrite && role === 'prof' ? (
              <span title="Verrouillé">🔒</span>
            ) : null}
          </div>
        )
      },
      exportValue: () => ''
    }
  ]

  async function refreshAll() {
    setLoading(true)
    try {
      const [ass, sem, cls, sub, tea] = await Promise.all([
        apiGet('/api/assessments'),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects'),
        apiGet('/api/teachers')
      ])
      setItems(ass.items || [])
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
      await apiPost('/api/assessments', {
        semester_id: Number(semesterId),
        class_id: Number(classId),
        subject_id: Number(subjectId),
        teacher_id: Number(teacherId),
        kind,
        title,
        assessment_date: assessmentDate || null,
        max_score: maxScore ? Number(maxScore) : null,
        coefficient: coefficient ? Number(coefficient) : null,
        is_public: isPublic ? 1 : 0
      })
      setSemesterId('')
      setClassId('')
      setSubjectId('')
      setTeacherId('')
      setKind('exam')
      setTitle('')
      setAssessmentDate('')
      setMaxScore('')
      setCoefficient('')
      setIsPublic(true)
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
    setEditKind(row.kind || '')
    setEditTitle(row.title || '')
    setEditAssessmentDate(row.assessment_date || '')
    setEditMaxScore(row.max_score == null ? '' : String(row.max_score))
    setEditCoefficient(row.coefficient == null ? '' : String(row.coefficient))
    setEditIsPublic(Number(row.is_public ?? 1) === 1)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditSemesterId('')
    setEditClassId('')
    setEditSubjectId('')
    setEditTeacherId('')
    setEditKind('')
    setEditTitle('')
    setEditAssessmentDate('')
    setEditMaxScore('')
    setEditCoefficient('')
    setEditIsPublic(true)
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/assessments/${id}`, {
        semester_id: Number(editSemesterId),
        class_id: Number(editClassId),
        subject_id: Number(editSubjectId),
        teacher_id: Number(editTeacherId),
        kind: editKind,
        title: editTitle,
        assessment_date: editAssessmentDate || null,
        max_score: editMaxScore ? Number(editMaxScore) : null,
        coefficient: editCoefficient ? Number(editCoefficient) : null,
        is_public: editIsPublic ? 1 : 0
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
      await apiDelete(`/api/assessments/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit = semesterId && classId && subjectId && teacherId && kind && title

  return (
    <div className="card">
      <div className="card__header">Examens / TP</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
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

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Type</div>
              <Select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="exam">Examen</option>
                <option value="tp">TP</option>
                <option value="devoir">Devoir</option>
                <option value="quiz">Quiz</option>
                <option value="autre">Autre</option>
              </Select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Enseignant</div>
              <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} disabled={isProf && myTeacherId > 0}>
                <option value="">-- choisir --</option>
                {teachersForCreate.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.matricule} — {t.first_name} {t.last_name}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Examen 1 / TP 2…" />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Date</div>
              <Input type="date" value={assessmentDate} onChange={(e) => setAssessmentDate(e.target.value)} />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Barème</div>
              <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} placeholder="20" />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Coeff</div>
              <Input type="number" value={coefficient} onChange={(e) => setCoefficient(e.target.value)} placeholder="1" />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Visible</div>
              <label className="row" style={{ alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input type="checkbox" checked={!!isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <span>Public</span>
              </label>
            </div>

            <div style={{ gridColumn: 'span 8', alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!canSubmit}>
                Ajouter
              </Button>
            </div>
          </form>
        ) : (
          <div className="label">Lecture seule.</div>
        )}

        <DataTable
          title="Tableau"
          subtitle={loading ? 'Chargement…' : null}
          rows={enriched}
          columns={columns}
          Button={Button}
          Input={Input}
          Select={Select}
          initialSortKey="id"
          initialSortDir="desc"
          defaultPageSize={10}
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="assessments.csv"
          searchPlaceholder="Recherche (titre, matière, classe, type…)"
          getRowSearchText={(r) => `${r.id} ${r._semesterLabel} ${r._classLabel} ${r._subjectLabel} ${r._teacherLabel} ${r.kind || ''} ${r.title || ''} ${r.assessment_date || ''}`}
        />
      </div>
    </div>
  )
}
