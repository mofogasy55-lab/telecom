import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function StudentClassAssignmentsView({ role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)

  const [studentId, setStudentId] = useState('')
  const [classId, setClassId] = useState('')
  const [dateAffectation, setDateAffectation] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const studentsById = useMemo(() => {
    const m = new Map()
    for (const s of students) m.set(Number(s.id), s)
    return m
  }, [students])

  const classesById = useMemo(() => {
    const m = new Map()
    for (const c of classes) m.set(Number(c.id), c)
    return m
  }, [classes])

  const enriched = useMemo(() => {
    return items.map((r) => {
      const s = studentsById.get(Number(r.student_id))
      const c = classesById.get(Number(r.class_id))
      const studentLabel = s ? `${s.matricule} — ${s.first_name} ${s.last_name}` : `#${r.student_id}`
      const classLabel = c ? `${c.code} — ${c.title}` : `#${r.class_id}`
      return { ...r, _studentLabel: studentLabel, _classLabel: classLabel }
    })
  }, [items, studentsById, classesById])

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Étudiant', key: '_studentLabel', sortValue: (r) => r._studentLabel, exportValue: (r) => r._studentLabel },
    { header: 'Classe', key: '_classLabel', sortValue: (r) => r._classLabel, exportValue: (r) => r._classLabel },
    { header: 'Date affectation', key: 'date_affectation', exportValue: (r) => r.date_affectation || '' },
    {
      header: 'Actions',
      render: (r) => (
        <div style={{ textAlign: 'right' }}>
          {canWrite ? (
            <Button variant="danger" type="button" onClick={() => onDelete(r.id)}>
              Supprimer
            </Button>
          ) : null}
        </div>
      ),
      exportValue: () => ''
    }
  ]

  async function refreshAll() {
    setLoading(true)
    try {
      const [ass, stu, cls] = await Promise.all([
        apiGet('/api/student-class-assignments'),
        apiGet('/api/students'),
        apiGet('/api/classes')
      ])
      setItems(ass.items || [])
      setStudents(stu.items || [])
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
      await apiPost('/api/student-class-assignments', {
        student_id: Number(studentId),
        class_id: Number(classId),
        date_affectation: dateAffectation || null
      })
      setStudentId('')
      setClassId('')
      setDateAffectation('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/student-class-assignments/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">Affectations classe</div>
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
            <div>
              <div className="label">Date affectation</div>
              <Input value={dateAffectation} onChange={(e) => setDateAffectation(e.target.value)} placeholder="2026-01-27" />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!studentId || !classId}>
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
            { key: 'with_date', label: 'Avec date', predicate: (r) => !!r.date_affectation },
            { key: 'no_date', label: 'Sans date', predicate: (r) => !r.date_affectation }
          ]}
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="student-class-assignments.csv"
          searchPlaceholder="Recherche (étudiant, classe…)"
        />
      </div>
    </div>
  )
}
