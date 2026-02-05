import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function EcsView({ role, Button, Input, Select, onError }) {
  const [items, setItems] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)

  const [subjectId, setSubjectId] = useState('')
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [credit, setCredit] = useState('')
  const [coefficient, setCoefficient] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editCredit, setEditCredit] = useState('')
  const [editCoefficient, setEditCoefficient] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const subjectsById = useMemo(() => {
    const m = new Map()
    for (const s of subjects) m.set(Number(s.id), s)
    return m
  }, [subjects])

  const enriched = useMemo(() => {
    return items.map((ec) => {
      const subj = subjectsById.get(Number(ec.subject_id))
      const subjectLabel = subj ? `${subj.code} — ${subj.title}` : `#${ec.subject_id}`
      return { ...ec, _subjectLabel: subjectLabel }
    })
  }, [items, subjectsById])

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    {
      header: 'Matière',
      key: '_subjectLabel',
      sortValue: (r) => r._subjectLabel,
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? (
          <Select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)}>
            <option value="">-- choisir --</option>
            {subjects.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.code} — {s.title}
              </option>
            ))}
          </Select>
        ) : (
          r._subjectLabel
        )
      },
      exportValue: (r) => r._subjectLabel
    },
    {
      header: 'Code',
      key: 'code',
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} /> : r.code
      },
      exportValue: (r) => r.code
    },
    {
      header: 'Titre',
      key: 'title',
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> : r.title
      },
      exportValue: (r) => r.title
    },
    {
      header: 'Crédit',
      key: 'credit',
      align: 'right',
      sortValue: (r) => (r.credit == null ? -1 : Number(r.credit)),
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? <Input value={editCredit} onChange={(e) => setEditCredit(e.target.value)} /> : r.credit ?? '-'
      },
      exportValue: (r) => (r.credit == null ? '' : r.credit)
    },
    {
      header: 'Coeff',
      key: 'coefficient',
      align: 'right',
      sortValue: (r) => (r.coefficient == null ? -1 : Number(r.coefficient)),
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? <Input value={editCoefficient} onChange={(e) => setEditCoefficient(e.target.value)} /> : r.coefficient ?? '-'
      },
      exportValue: (r) => (r.coefficient == null ? '' : r.coefficient)
    },
    {
      header: 'Actions',
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return (
          <div style={{ textAlign: 'right' }}>
            {canWrite ? (
              isEditing ? (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button variant="primary" type="button" onClick={() => saveEdit(r.id)}>
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
      const [ecs, subs] = await Promise.all([apiGet('/api/ecs'), apiGet('/api/subjects')])
      setItems(ecs.items || [])
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
      await apiPost('/api/ecs', {
        subject_id: Number(subjectId),
        code,
        title,
        credit: credit ? Number(credit) : null,
        coefficient: coefficient ? Number(coefficient) : null
      })
      setSubjectId('')
      setCode('')
      setTitle('')
      setCredit('')
      setCoefficient('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditSubjectId(String(row.subject_id))
    setEditCode(row.code || '')
    setEditTitle(row.title || '')
    setEditCredit(row.credit == null ? '' : String(row.credit))
    setEditCoefficient(row.coefficient == null ? '' : String(row.coefficient))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditSubjectId('')
    setEditCode('')
    setEditTitle('')
    setEditCredit('')
    setEditCoefficient('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/ecs/${id}`, {
        subject_id: Number(editSubjectId),
        code: editCode,
        title: editTitle,
        credit: editCredit ? Number(editCredit) : null,
        coefficient: editCoefficient ? Number(editCoefficient) : null
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
      await apiDelete(`/api/ecs/${id}`)
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">EC</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
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
            <div>
              <div className="label">Code</div>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="EC-01" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TD / TP / Chapitre…" />
            </div>
            <div>
              <div className="label">Crédit</div>
              <Input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="1" />
            </div>
            <div>
              <div className="label">Coeff</div>
              <Input value={coefficient} onChange={(e) => setCoefficient(e.target.value)} placeholder="1" />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={!subjectId || !code || !title}>
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
            { key: 'with_coeff', label: 'Avec coeff', predicate: (r) => r.coefficient != null && r.coefficient !== '' },
            { key: 'no_coeff', label: 'Sans coeff', predicate: (r) => r.coefficient == null || r.coefficient === '' }
          ]}
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="ecs.csv"
          searchPlaceholder="Recherche (EC, matière, coeff…)"
        />
      </div>
    </div>
  )
}
