import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function GradesView({ user, role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [assessments, setAssessments] = useState([])
  const [students, setStudents] = useState([])

  const [loading, setLoading] = useState(false)

  const [assessmentId, setAssessmentId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [gradedAt, setGradedAt] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editAssessmentId, setEditAssessmentId] = useState('')
  const [editStudentId, setEditStudentId] = useState('')
  const [editScore, setEditScore] = useState('')
  const [editComment, setEditComment] = useState('')
  const [editGradedAt, setEditGradedAt] = useState('')

  const canWrite = role === 'admin' || role === 'prof'
  const myTeacherId = user?.teacher_id != null ? Number(user.teacher_id) : 0

  function canEditGrade(g) {
    if (role === 'admin') return true
    if (role !== 'prof') return false
    if (!myTeacherId) return false
    return Number(g.assessment_teacher_id) === myTeacherId
  }

  const assessmentsForWrite = useMemo(() => {
    if (role !== 'prof') return assessments
    if (!myTeacherId) return []
    return assessments.filter((a) => Number(a.teacher_id) === myTeacherId)
  }, [assessments, myTeacherId, role])

  const assessmentsById = useMemo(() => new Map(assessments.map((a) => [Number(a.id), a])), [assessments])
  const studentsById = useMemo(() => new Map(students.map((s) => [Number(s.id), s])), [students])

  const enriched = useMemo(() => {
    return items.map((g) => {
      const a = assessmentsById.get(Number(g.assessment_id))
      const s = studentsById.get(Number(g.student_id))

      const assessmentLabel = a ? `${a.kind || ''} — ${a.title || ''}`.trim() : `#${g.assessment_id}`
      const studentLabel = s ? `${s.matricule} — ${s.first_name} ${s.last_name}` : g.student_id ? `#${g.student_id}` : '-'

      return { ...g, _assessmentLabel: assessmentLabel, _studentLabel: studentLabel }
    })
  }, [items, assessmentsById, studentsById])

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    {
      header: 'Évaluation',
      key: '_assessmentLabel',
      sortValue: (r) => r._assessmentLabel,
      render: (g) => {
        const isEditing = canWrite && canEditGrade(g) && editingId === g.id
        return isEditing ? (
          <Select value={editAssessmentId} onChange={(ev) => setEditAssessmentId(ev.target.value)}>
            <option value="">-- choisir --</option>
            {assessmentsForWrite.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.kind} — {a.title}
              </option>
            ))}
          </Select>
        ) : (
          <span>
            {role === 'prof' && !canEditGrade(g) ? '🔒 ' : null}
            {g._assessmentLabel}
          </span>
        )
      },
      exportValue: (g) => g._assessmentLabel
    },
    {
      header: 'Étudiant',
      key: '_studentLabel',
      sortValue: (r) => r._studentLabel,
      render: (g) => {
        if (!canWrite) return g._studentLabel
        const isEditing = canEditGrade(g) && editingId === g.id
        return isEditing ? (
          <Select value={editStudentId} onChange={(ev) => setEditStudentId(ev.target.value)}>
            <option value="">-- choisir --</option>
            {students.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.matricule} — {s.first_name} {s.last_name}
              </option>
            ))}
          </Select>
        ) : (
          g._studentLabel
        )
      },
      exportValue: (g) => g._studentLabel
    },
    {
      header: 'Note',
      key: 'score',
      align: 'right',
      render: (g) => {
        const isEditing = canWrite && canEditGrade(g) && editingId === g.id
        return isEditing ? <Input type="number" value={editScore} onChange={(ev) => setEditScore(ev.target.value)} /> : g.score
      },
      exportValue: (g) => g.score
    },
    {
      header: 'Commentaire',
      key: 'comment',
      render: (g) => {
        const isEditing = canWrite && canEditGrade(g) && editingId === g.id
        return isEditing ? <Input value={editComment} onChange={(ev) => setEditComment(ev.target.value)} /> : g.comment || '-'
      },
      exportValue: (g) => g.comment || ''
    },
    {
      header: 'Date',
      key: 'graded_at',
      render: (g) => {
        const isEditing = canWrite && canEditGrade(g) && editingId === g.id
        return isEditing ? <Input type="date" value={editGradedAt} onChange={(ev) => setEditGradedAt(ev.target.value)} /> : g.graded_at || '-'
      },
      exportValue: (g) => g.graded_at || ''
    },
    {
      header: 'Actions',
      render: (g) => {
        const canEditRow = canWrite && canEditGrade(g)
        const isEditing = canEditRow && editingId === g.id
        return (
          <div style={{ textAlign: 'right' }}>
            {canEditRow ? (
              isEditing ? (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => saveEdit(g.id)}
                    disabled={!editAssessmentId || !editStudentId || editScore === ''}
                  >
                    Enregistrer
                  </Button>
                  <Button type="button" onClick={cancelEdit}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button type="button" onClick={() => startEdit(g)}>
                    Modifier
                  </Button>
                  <Button variant="danger" type="button" onClick={() => onDelete(g.id)}>
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
      const reqs = [apiGet('/api/grades'), apiGet('/api/assessments')]
      if (canWrite) reqs.push(apiGet('/api/students'))
      const [gr, ass, stu] = await Promise.all(reqs)

      setItems(gr.items || [])
      setAssessments(ass.items || [])
      setStudents(stu?.items || [])
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
      await apiPost('/api/grades', {
        assessment_id: Number(assessmentId),
        student_id: Number(studentId),
        score: Number(score),
        comment: comment || null,
        graded_at: gradedAt || null
      })
      setAssessmentId('')
      setStudentId('')
      setScore('')
      setComment('')
      setGradedAt('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditAssessmentId(String(row.assessment_id))
    setEditStudentId(String(row.student_id))
    setEditScore(row.score == null ? '' : String(row.score))
    setEditComment(row.comment || '')
    setEditGradedAt(row.graded_at || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditAssessmentId('')
    setEditStudentId('')
    setEditScore('')
    setEditComment('')
    setEditGradedAt('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/grades/${id}`, {
        assessment_id: Number(editAssessmentId),
        student_id: Number(editStudentId),
        score: Number(editScore),
        comment: editComment || null,
        graded_at: editGradedAt || null
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
      await apiDelete(`/api/grades/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit = assessmentId && studentId && score !== ''

  const visibleColumns = useMemo(() => {
    if (canWrite) return columns
    return columns.filter((c) => c.key !== '_studentLabel')
  }, [canWrite])

  return (
    <div className="card">
      <div className="card__header">Notes</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Évaluation</div>
              <Select value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
                <option value="">-- choisir --</option>
                {assessmentsForWrite.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.kind} — {a.title}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Étudiant</div>
              <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">-- choisir --</option>
                {students.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.matricule} — {s.first_name} {s.last_name}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Note</div>
              <Input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="0" />
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <div className="label">Commentaire (optionnel)</div>
              <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Remarque…" />
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Date (optionnel)</div>
              <Input type="date" value={gradedAt} onChange={(e) => setGradedAt(e.target.value)} />
            </div>

            <div style={{ gridColumn: 'span 1', alignSelf: 'end' }}>
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
          columns={visibleColumns}
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
          exportFileName="grades.csv"
          searchPlaceholder="Recherche (évaluation, étudiant, commentaire…)"
          getRowSearchText={(r) => `${r.id} ${r._assessmentLabel} ${r._studentLabel} ${r.score} ${r.comment || ''} ${r.graded_at || ''}`}
        />
      </div>
    </div>
  )
}
