import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function ClassSubjectsView({ role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)

  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

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

  const enriched = useMemo(() => {
    return items.map((r) => {
      const cls = classesById.get(Number(r.class_id))
      const subj = subjectsById.get(Number(r.subject_id))
      return {
        ...r,
        _classLabel: cls ? `${cls.code} — ${cls.title}` : `#${r.class_id}`,
        _subjectLabel: subj ? `${subj.code} — ${subj.title}` : `#${r.subject_id}`
      }
    })
  }, [items, classesById, subjectsById])

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Classe', key: '_classLabel', sortValue: (r) => r._classLabel, exportValue: (r) => r._classLabel },
    { header: 'Matière', key: '_subjectLabel', sortValue: (r) => r._subjectLabel, exportValue: (r) => r._subjectLabel },
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
      const [links, cls, subs] = await Promise.all([
        apiGet('/api/class-subjects'),
        apiGet('/api/classes'),
        apiGet('/api/subjects')
      ])
      setItems(links.items || [])
      setClasses(cls.items || [])
      setSubjects(subs.items || [])
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
      await apiPost('/api/class-subjects', { class_id: Number(classId), subject_id: Number(subjectId) })
      setClassId('')
      setSubjectId('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/class-subjects/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">Matières par classe</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!classId || !subjectId}>
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
          quickFilters={
            classId
              ? [
                  {
                    key: 'selected_class',
                    label: 'Classe sélectionnée',
                    predicate: (r) => Number(r.class_id) === Number(classId)
                  }
                ]
              : []
          }
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="class-subjects.csv"
          searchPlaceholder="Recherche (classe, matière…)"
        />
      </div>
    </div>
  )
}
