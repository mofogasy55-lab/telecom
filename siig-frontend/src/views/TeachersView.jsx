import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '../api.js'

export default function TeachersView({ role, Button, Input, onError }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const [matricule, setMatricule] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return teachers
    return teachers.filter((t) => {
      const hay = `${t.matricule || ''} ${t.first_name || ''} ${t.last_name || ''} ${t.email || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, teachers])

  async function refresh() {
    setLoading(true)
    try {
      const data = await apiGet('/api/teachers')
      setTeachers(data.items || [])
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

  async function onCreateTeacher(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/teachers', {
        matricule,
        first_name: firstName,
        last_name: lastName,
        email: email || null
      })
      setMatricule('')
      setFirstName('')
      setLastName('')
      setEmail('')
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDeleteTeacher(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/teachers/${id}`)
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">Enseignants</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            Total: {teachers.length} • Affichés: {filtered.length} {loading ? '• Chargement…' : ''}
          </div>
          <div style={{ minWidth: 260, flex: '0 0 auto' }}>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche (matricule, nom, email…)" />
          </div>
        </div>

        {canWrite ? (
          <form onSubmit={onCreateTeacher} className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Matricule</div>
              <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="PROF-001" />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Prénom</div>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Nom</div>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@espa.local" />
            </div>
            <div style={{ gridColumn: 'span 1', alignSelf: 'end' }}>
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
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
                <th>Matricule</th>
                <th>Nom</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.matricule}</td>
                  <td>
                    {t.first_name} {t.last_name}
                  </td>
                  <td>{t.email || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {canWrite ? (
                      <Button variant="danger" onClick={() => onDeleteTeacher(t.id)}>
                        Supprimer
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="label" style={{ padding: 16 }}>
                    Aucun enseignant.
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
