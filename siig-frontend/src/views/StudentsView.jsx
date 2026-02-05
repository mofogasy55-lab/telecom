import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function StudentsView({ role, Button, Input, onError }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const [expandedCategory, setExpandedCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const [matricule, setMatricule] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [semester, setSemester] = useState('')

  const [trackCategory, setTrackCategory] = useState('')
  const [trackLevel, setTrackLevel] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const categories = useMemo(
    () => [
      {
        key: 'academique',
        label: 'Académique',
        levels: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
      },
      {
        key: 'professionnel',
        label: 'Professionnel',
        levels: ['LicencePro 1', 'LicencePro 2', 'LicencePro 3', 'MasterPro 1', 'MasterPro 2']
      },
      {
        key: 'luban',
        label: 'Luban',
        levels: ['Licence 1', 'Licence 2', 'Licence 3']
      }
    ],
    []
  )

  const columns = [
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Matricule', key: 'matricule', exportValue: (r) => r.matricule },
    {
      header: 'Nom',
      key: 'last_name',
      sortValue: (r) => `${r.last_name || ''} ${r.first_name || ''}`,
      render: (r) => (
        <span>
          {r.first_name} {r.last_name}
        </span>
      ),
      exportValue: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim()
    },
    { header: 'Semestre', key: 'semester', exportValue: (r) => r.semester || '' },
    { header: 'Catégorie', key: 'track_category', exportValue: (r) => r.track_category || '' },
    { header: 'Niveau', key: 'track_level', exportValue: (r) => r.track_level || '' },
    {
      header: 'Actions',
      render: (r) => (
        <div style={{ textAlign: 'right' }}>
          {canWrite ? (
            <Button variant="danger" onClick={() => onDeleteStudent(r.id)}>
              Supprimer
            </Button>
          ) : null}
        </div>
      ),
      exportValue: () => ''
    }
  ]

  async function refresh(opts = {}) {
    setLoading(true)
    try {
      const cat = (opts.track_category ?? selectedCategory ?? '').trim()
      const lvl = (opts.track_level ?? selectedLevel ?? '').trim()

      const params = new URLSearchParams()
      if (cat) params.set('track_category', cat)
      if (lvl) params.set('track_level', lvl)
      const qs = params.toString() ? `?${params.toString()}` : ''

      const data = await apiGet(`/api/students${qs}`)
      setStudents(data.items || [])
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

  async function selectTrack(cat, level) {
    onError?.(null)
    setSelectedCategory(cat)
    setSelectedLevel(level)
    setTrackCategory(cat)
    setTrackLevel(level)
    await refresh({ track_category: cat, track_level: level })
  }

  async function onCreateStudent(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/students', {
        matricule,
        first_name: firstName,
        last_name: lastName,
        semester: semester || null,
        track_category: trackCategory || null,
        track_level: trackLevel || null
      })
      setMatricule('')
      setFirstName('')
      setLastName('')
      setSemester('')
      setTrackCategory('')
      setTrackLevel('')
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onDeleteStudent(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/students/${id}`)
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="card">
      <div className="card__header">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800 }}>Étudiants</div>

          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              {categories.map((c) => {
                const isOpen = expandedCategory === c.key
                return (
                  <div
                    key={c.key}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setExpandedCategory(c.key)}
                    onMouseLeave={() => setExpandedCategory((cur) => (cur === c.key ? null : cur))}
                    onClick={() => toggleCategory(c.key)}
                  >
                    <div
                      style={{
                        width: 150,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        border: isOpen ? '2px solid #000' : '1px solid #d9d9d9',
                        borderRadius: 10,
                        background: '#fff',
                        fontWeight: 800,
                        color: '#000'
                      }}
                    >
                      {c.label}
                    </div>

                    {isOpen ? (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 8,
                          width: 220,
                          background: '#fff',
                          border: '1px solid #e6e6e6',
                          borderRadius: 12,
                          boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
                          zIndex: 50
                        }}
                      >
                        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {c.levels.map((lvl) => (
                            <button
                              key={`${c.key}:${lvl}`}
                              type="button"
                              className="btn"
                              style={{ textAlign: 'left', width: '100%', fontWeight: 700, color: '#000' }}
                              onClick={async () => {
                                await selectTrack(c.key, lvl)
                                setExpandedCategory(null)
                              }}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">
            Total: {students.length} {loading ? '• Chargement…' : ''}
          </div>
        </div>

        {canWrite ? (
          <form onSubmit={onCreateStudent} className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Matricule</div>
              <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="2026-TLC-001" />
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
              <div className="label">Semestre</div>
              <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="S1" />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Catégorie</div>
              <select className="input" value={trackCategory} onChange={(e) => setTrackCategory(e.target.value)}>
                <option value="">--</option>
                <option value="academique">Académique</option>
                <option value="professionnel">Professionnel</option>
                <option value="luban">Luban</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label">Niveau</div>
              <select className="input" value={trackLevel} onChange={(e) => setTrackLevel(e.target.value)}>
                <option value="">--</option>
                {categories
                  .find((c) => c.key === trackCategory)
                  ?.levels.map((lvl) => (
                    <option key={`${trackCategory}:${lvl}`} value={lvl}>
                      {lvl}
                    </option>
                  ))}
              </select>
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

        <DataTable
          title="Tableau"
          subtitle={null}
          rows={students}
          columns={columns}
          Button={Button}
          Input={Input}
          initialSortKey="id"
          initialSortDir="desc"
          defaultPageSize={10}
          quickFilters={[
            { key: 'academique', label: 'Académique', predicate: (r) => r.track_category === 'academique' },
            { key: 'professionnel', label: 'Professionnel', predicate: (r) => r.track_category === 'professionnel' },
            { key: 'luban', label: 'Luban', predicate: (r) => r.track_category === 'luban' }
          ]}
          actions={
            <Button type="button" onClick={() => refresh()} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="students.csv"
          searchPlaceholder="Recherche (matricule, nom, semestre…)"
          getRowSearchText={(r) => `${r.matricule || ''} ${r.first_name || ''} ${r.last_name || ''} ${r.semester || ''} ${r.track_category || ''} ${r.track_level || ''}`}
        />
      </div>
    </div>
  )
}
