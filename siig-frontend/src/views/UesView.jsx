import React, { useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function UesView({ role, Button, Input, onError }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [credit, setCredit] = useState('')
  const [semestreCode, setSemestreCode] = useState('')
  const [typeUe, setTypeUe] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editCode, setEditCode] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editCredit, setEditCredit] = useState('')
  const [editSemestreCode, setEditSemestreCode] = useState('')
  const [editTypeUe, setEditTypeUe] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
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
      header: 'Semestre',
      key: 'semestre_code',
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? (
          <Input value={editSemestreCode} onChange={(e) => setEditSemestreCode(e.target.value)} />
        ) : (
          r.semestre_code || '-'
        )
      },
      exportValue: (r) => r.semestre_code || ''
    },
    {
      header: 'Type',
      key: 'type_ue',
      render: (r) => {
        const isEditing = canWrite && editingId === r.id
        return isEditing ? <Input value={editTypeUe} onChange={(e) => setEditTypeUe(e.target.value)} /> : r.type_ue || '-'
      },
      exportValue: (r) => r.type_ue || ''
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

  async function refresh() {
    setLoading(true)
    try {
      const data = await apiGet('/api/ues')
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
      await apiPost('/api/ues', {
        code,
        title,
        credit: credit ? Number(credit) : null,
        semestre_code: semestreCode || null,
        type_ue: typeUe || null
      })
      setCode('')
      setTitle('')
      setCredit('')
      setSemestreCode('')
      setTypeUe('')
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditCode(row.code || '')
    setEditTitle(row.title || '')
    setEditCredit(row.credit == null ? '' : String(row.credit))
    setEditSemestreCode(row.semestre_code || '')
    setEditTypeUe(row.type_ue || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditCode('')
    setEditTitle('')
    setEditCredit('')
    setEditSemestreCode('')
    setEditTypeUe('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/ues/${id}`, {
        code: editCode,
        title: editTitle,
        credit: editCredit ? Number(editCredit) : null,
        semestre_code: editSemestreCode || null,
        type_ue: editTypeUe || null
      })
      cancelEdit()
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/ues/${id}`)
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">UE</div>
      <div className="card__body grid">
        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            <div>
              <div className="label">Code</div>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="UE-TLC-101" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fondamentaux Télécom" />
            </div>
            <div>
              <div className="label">Crédit</div>
              <Input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="6" />
            </div>
            <div>
              <div className="label">Semestre</div>
              <Input value={semestreCode} onChange={(e) => setSemestreCode(e.target.value)} placeholder="S1" />
            </div>
            <div>
              <div className="label">Type</div>
              <Input value={typeUe} onChange={(e) => setTypeUe(e.target.value)} placeholder="Obligatoire" />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
                Ajouter
              </Button>
            </div>
          </form>
        ) : null}

        <DataTable
          title="Tableau"
          subtitle={loading ? 'Chargement…' : null}
          rows={items}
          columns={columns}
          Button={Button}
          Input={Input}
          initialSortKey="id"
          initialSortDir="desc"
          defaultPageSize={10}
          quickFilters={[
            { key: 'with_sem', label: 'Avec semestre', predicate: (r) => !!r.semestre_code },
            { key: 'no_sem', label: 'Sans semestre', predicate: (r) => !r.semestre_code }
          ]}
          actions={
            <Button type="button" onClick={refresh} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="ues.csv"
          searchPlaceholder="Recherche (code, titre, semestre…)"
        />
      </div>
    </div>
  )
}
