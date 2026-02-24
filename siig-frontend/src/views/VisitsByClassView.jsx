import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function VisitsByClassView({ user, role, Button, Input, Select, onError, embedded = false }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])

  const [visitDate, setVisitDate] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  async function refreshAll() {
    setLoading(true)
    onError?.(null)
    try {
      const [vis, sem, cls, sub] = await Promise.all([
        apiGet('/api/visits'),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects')
      ])
      setItems(vis.items || [])
      setSemesters(sem.items || [])
      setClasses(cls.items || [])
      setSubjects(sub.items || [])
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

  const semestersById = useMemo(() => new Map(semesters.map((s) => [Number(s.id), s])), [semesters])
  const classesById = useMemo(() => new Map(classes.map((c) => [Number(c.id), c])), [classes])
  const subjectsById = useMemo(() => new Map(subjects.map((s) => [Number(s.id), s])), [subjects])

  const rows = useMemo(() => {
    return (items || []).map((v) => {
      const sem = semestersById.get(Number(v.semester_id))
      const cls = classesById.get(Number(v.class_id))
      const subj = subjectsById.get(Number(v.subject_id))
      return {
        ...v,
        _semesterLabel: sem ? `${sem.code} — ${sem.title}` : `#${v.semester_id}`,
        _classLabel: cls ? `${cls.code} — ${cls.title}` : `#${v.class_id}`,
        _subjectLabel: subj ? `${subj.code} — ${subj.title}` : v.subject_id ? `#${v.subject_id}` : '-'
      }
    })
  }, [items, semestersById, classesById, subjectsById])

  const columns = useMemo(() => {
    return [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Date', key: 'visit_date', width: 120, exportValue: (r) => r.visit_date || '' },
      { header: 'Semestre', key: '_semesterLabel', sortValue: (r) => r._semesterLabel, exportValue: (r) => r._semesterLabel || '' },
      { header: 'Classe', key: '_classLabel', sortValue: (r) => r._classLabel, exportValue: (r) => r._classLabel || '' },
      { header: 'Matière', key: '_subjectLabel', sortValue: (r) => r._subjectLabel, exportValue: (r) => r._subjectLabel || '' },
      {
        header: 'Titre',
        key: 'title',
        render: (r) => {
          const isEditing = canWrite && editingId === r.id
          return isEditing ? <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> : r.title
        },
        exportValue: (r) => r.title || ''
      },
      {
        header: 'Notes',
        key: 'notes',
        render: (r) => {
          const isEditing = canWrite && editingId === r.id
          return isEditing ? <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} /> : r.notes || '-'
        },
        exportValue: (r) => r.notes || ''
      },
      {
        header: 'Actions',
        render: (r) => {
          if (!canWrite) return ''
          const isEditing = editingId === r.id
          return (
            <div style={{ textAlign: 'right' }}>
              {isEditing ? (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => saveEdit(r.id)}
                    disabled={!editTitle}
                  >
                    Enregistrer
                  </Button>
                  <Button type="button" onClick={cancelEdit}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button type="button" onClick={() => startEdit(r)}>
                    Modifier
                  </Button>
                  <Button variant="danger" type="button" onClick={() => onDelete(r.id)}>
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          )
        },
        exportValue: () => ''
      }
    ]
  }, [Input, Button, canWrite, editingId, editTitle, editNotes])

  async function onCreate(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/visits', {
        visit_date: visitDate,
        semester_id: Number(semesterId),
        class_id: Number(classId),
        subject_id: subjectId ? Number(subjectId) : null,
        title,
        notes: notes || null
      })
      setVisitDate('')
      setSemesterId('')
      setClassId('')
      setSubjectId('')
      setTitle('')
      setNotes('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditTitle(row.title || '')
    setEditNotes(row.notes || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditNotes('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/visits/${id}`, { title: editTitle, notes: editNotes || null })
      cancelEdit()
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/visits/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit = canWrite && visitDate && semesterId && classId && title

  if (embedded) {
    return (
      <DataTable
        title="Tableau"
        subtitle={loading ? 'Chargement…' : null}
        rows={rows}
        columns={columns}
        Button={Button}
        Input={Input}
        Select={Select}
        initialSortKey="visit_date"
        initialSortDir="desc"
        defaultPageSize={10}
        exportFileName="visits.csv"
        searchPlaceholder="Recherche (classe, titre, notes…)"
        getRowSearchText={(r) => `${r.visit_date || ''} ${r._semesterLabel || ''} ${r._classLabel || ''} ${r._subjectLabel || ''} ${r.title || ''} ${r.notes || ''}`}
      />
    )
  }

  return (
    <div className="card">
      <div className="card__header">Visites (par classe)</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Date</div>
              <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>
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
            <div style={{ gridColumn: 'span 3' }}>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Visite pédagogique…" />
            </div>
            <div style={{ gridColumn: 'span 5' }}>
              <div className="label">Notes</div>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Détails…" />
            </div>
            <div style={{ gridColumn: 'span 8' }}>
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
          rows={rows}
          columns={columns}
          Button={Button}
          Input={Input}
          Select={Select}
          initialSortKey="visit_date"
          initialSortDir="desc"
          defaultPageSize={10}
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="visits.csv"
          searchPlaceholder="Recherche (classe, titre, notes…)"
          getRowSearchText={(r) => `${r.visit_date || ''} ${r._semesterLabel || ''} ${r._classLabel || ''} ${r._subjectLabel || ''} ${r.title || ''} ${r.notes || ''}`}
        />
      </div>
    </div>
  )
}
