import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function EnrollmentsView({ role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [students, setStudents] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])

  const [loading, setLoading] = useState(false)

  const [studentId, setStudentId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editStudentId, setEditStudentId] = useState('')
  const [editSemesterId, setEditSemesterId] = useState('')
  const [editClassId, setEditClassId] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const studentsById = useMemo(() => {
    const m = new Map()
    for (const s of students) m.set(Number(s.id), s)
    return m
  }, [students])

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

  const enriched = useMemo(() => {
    return items.map((e) => {
      const s = studentsById.get(Number(e.student_id))
      const sem = semestersById.get(Number(e.semester_id))
      const cls = e.class_id != null ? classesById.get(Number(e.class_id)) : null
      const studentLabel = s ? `${s.matricule} — ${s.first_name} ${s.last_name}` : `#${e.student_id}`
      const semesterLabel = sem ? `${sem.code} — ${sem.title}` : `#${e.semester_id}`
      const classLabel = cls ? `${cls.code} — ${cls.title}` : e.class_id ? `#${e.class_id}` : '-'
      return { ...e, _studentLabel: studentLabel, _semesterLabel: semesterLabel, _classLabel: classLabel }
    })
  }, [items, studentsById, semestersById, classesById])

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    {
      header: 'Étudiant',
      key: '_studentLabel',
      sortValue: (r) => r._studentLabel,
      render: (e) => {
        const isEditing = canWrite && editingId === e.id
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
          e._studentLabel
        )
      },
      exportValue: (e) => e._studentLabel
    },
    {
      header: 'Semestre',
      key: '_semesterLabel',
      sortValue: (r) => r._semesterLabel,
      render: (e) => {
        const isEditing = canWrite && editingId === e.id
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
          e._semesterLabel
        )
      },
      exportValue: (e) => e._semesterLabel
    },
    {
      header: 'Classe',
      key: '_classLabel',
      sortValue: (r) => r._classLabel,
      render: (e) => {
        const isEditing = canWrite && editingId === e.id
        return isEditing ? (
          <Select value={editClassId} onChange={(ev) => setEditClassId(ev.target.value)}>
            <option value="">-- aucune --</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.code} — {c.title}
              </option>
            ))}
          </Select>
        ) : (
          e._classLabel
        )
      },
      exportValue: (e) => (e._classLabel === '-' ? '' : e._classLabel)
    },
    {
      header: 'Actions',
      render: (e) => {
        const isEditing = canWrite && editingId === e.id
        return (
          <div style={{ textAlign: 'right' }}>
            {canWrite ? (
              isEditing ? (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => saveEdit(e.id)}
                    disabled={!editStudentId || !editSemesterId}
                  >
                    Enregistrer
                  </Button>
                  <Button type="button" onClick={cancelEdit}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button type="button" onClick={() => startEdit(e)}>
                    Modifier
                  </Button>
                  <Button variant="danger" type="button" onClick={() => onDelete(e.id)}>
                    Supprimer
                  </Button>
                </div>
              )
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
      const [enr, stu, sem, cls] = await Promise.all([
        apiGet('/api/enrollments'),
        apiGet('/api/students'),
        apiGet('/api/semesters'),
        apiGet('/api/classes')
      ])
      setItems(enr.items || [])
      setStudents(stu.items || [])
      setSemesters(sem.items || [])
      setClasses(cls.items || [])
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
      await apiPost('/api/enrollments', {
        student_id: Number(studentId),
        semester_id: Number(semesterId),
        class_id: classId ? Number(classId) : null
      })
      setStudentId('')
      setSemesterId('')
      setClassId('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditStudentId(String(row.student_id))
    setEditSemesterId(String(row.semester_id))
    setEditClassId(row.class_id == null ? '' : String(row.class_id))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditStudentId('')
    setEditSemesterId('')
    setEditClassId('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/enrollments/${id}`, {
        student_id: Number(editStudentId),
        semester_id: Number(editSemesterId),
        class_id: editClassId ? Number(editClassId) : null
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
      await apiDelete(`/api/enrollments/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">Inscriptions</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div>
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
            <div>
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
            <div>
              <div className="label">Classe (optionnel)</div>
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">-- aucune --</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!studentId || !semesterId}>
                Ajouter
              </Button>
            </div>
          </form>
        ) : null}

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
          quickFilters={[
            { key: 'with_class', label: 'Avec classe', predicate: (r) => r.class_id != null && r.class_id !== '' },
            { key: 'no_class', label: 'Sans classe', predicate: (r) => r.class_id == null || r.class_id === '' }
          ]}
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="enrollments.csv"
          searchPlaceholder="Recherche (étudiant, semestre, classe…)"
          getRowSearchText={(r) => `${r.id} ${r._studentLabel} ${r._semesterLabel} ${r._classLabel}`}
        />
      </div>
    </div>
  )
}
