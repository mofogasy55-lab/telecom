import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'

export default function SubjectsView({ role, Button, Input, onError }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editCode, setEditCode] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((s) => `${s.code || ''} ${s.title || ''}`.toLowerCase().includes(q))
  }, [items, query])

  async function refresh() {
    setLoading(true)
    try {
      const data = await apiGet('/api/subjects')
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
      await apiPost('/api/subjects', { code, title })
      setCode('')
      setTitle('')
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditCode(row.code || '')
    setEditTitle(row.title || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditCode('')
    setEditTitle('')
  }

  async function saveEdit(id) {
    onError?.(null)
    try {
      await apiPut(`/api/subjects/${id}`, { code: editCode, title: editTitle })
      cancelEdit()
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDelete(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/subjects/${id}`)
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">Matières (UE/EC)</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            Total: {items.length} • Affichés: {filtered.length} {loading ? '• Chargement…' : ''}
          </div>
          <div style={{ minWidth: 260, flex: '0 0 auto' }}>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche (code, titre…)" />
          </div>
        </div>

        {canWrite ? (
          <form onSubmit={onCreate} className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>
              <div className="label">Code</div>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="UE-TLC-101" />
            </div>
            <div>
              <div className="label">Titre</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Transmission numérique" />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
                Ajouter
              </Button>
            </div>
          </form>
        ) : null}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Titre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isEditing = canWrite && editingId === s.id
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      {isEditing ? <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} /> : s.code}
                    </td>
                    <td>
                      {isEditing ? <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> : s.title}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {canWrite ? (
                        isEditing ? (
                          <div className="row" style={{ justifyContent: 'flex-end' }}>
                            <Button variant="primary" type="button" onClick={() => saveEdit(s.id)}>
                              Enregistrer
                            </Button>
                            <Button type="button" onClick={cancelEdit}>
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <div className="row" style={{ justifyContent: 'flex-end' }}>
                            <Button type="button" onClick={() => startEdit(s)}>
                              Modifier
                            </Button>
                            <Button variant="danger" type="button" onClick={() => onDelete(s.id)}>
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
                  <td colSpan={4} className="label" style={{ padding: 16 }}>
                    Aucune matière.
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
