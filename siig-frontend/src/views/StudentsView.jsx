import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function StudentsView({ role, Button, Input, onError }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState('note')

  const [subjects, setSubjects] = useState([])
  const [assessments, setAssessments] = useState([])
  const [grades, setGrades] = useState([])

  const [expandedCategory, setExpandedCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const [queryMatricule, setQueryMatricule] = useState('')
  const [queryFirstName, setQueryFirstName] = useState('')
  const [queryLastName, setQueryLastName] = useState('')
  const [querySemester, setQuerySemester] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formMatricule, setFormMatricule] = useState('')
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formPhotoFile, setFormPhotoFile] = useState(null)
  const [formPhotoPreviewUrl, setFormPhotoPreviewUrl] = useState('')

  const [formSemester, setFormSemester] = useState('')
  const [formTrackCategory, setFormTrackCategory] = useState('')
  const [formTrackLevel, setFormTrackLevel] = useState('')
  const [formRemark, setFormRemark] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  const filteredStudents = useMemo(() => {
    const qMat = queryMatricule.trim().toLowerCase()
    const qFirst = queryFirstName.trim().toLowerCase()
    const qLast = queryLastName.trim().toLowerCase()
    const qSem = querySemester.trim().toLowerCase()
    if (!qMat && !qFirst && !qLast && !qSem) return students
    return students.filter((s) => {
      const mat = String(s.matricule || '').toLowerCase()
      const first = String(s.first_name || '').toLowerCase()
      const last = String(s.last_name || '').toLowerCase()
      const sem = String(s.semester || '').toLowerCase()
      if (qMat && !mat.includes(qMat)) return false
      if (qFirst && !first.includes(qFirst)) return false
      if (qLast && !last.includes(qLast)) return false
      if (qSem && !sem.includes(qSem)) return false
      return true
    })
  }, [students, queryMatricule, queryFirstName, queryLastName, querySemester])

  function openCreateModal() {
    setFormMatricule('')
    setFormFirstName('')
    setFormLastName('')
    setFormEmail('')
    setFormTelephone('')
    setFormAddress('')
    setFormPhotoFile(null)
    setFormPhotoPreviewUrl('')
    setFormSemester('')
    setFormTrackCategory(selectedCategory || '')
    setFormTrackLevel(selectedLevel || '')
    setFormRemark('')
    setIsModalOpen(true)
  }

  function openEditModal(student) {
    setFormMatricule(student.matricule || '')
    setFormFirstName(student.first_name || '')
    setFormLastName(student.last_name || '')
    setFormEmail(student.email || '')
    setFormTelephone(student.telephone || '')
    setFormAddress(student.address || '')
    setFormPhotoFile(null)
    setFormPhotoPreviewUrl('')
    setFormSemester(student.semester || '')
    setFormTrackCategory(student.track_category || '')
    setFormTrackLevel(student.track_level || '')
    setFormRemark(student.remark || '')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (!formPhotoFile) {
      if (formPhotoPreviewUrl) URL.revokeObjectURL(formPhotoPreviewUrl)
      setFormPhotoPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(formPhotoFile)
    if (formPhotoPreviewUrl) URL.revokeObjectURL(formPhotoPreviewUrl)
    setFormPhotoPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formPhotoFile])

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

  const generalColumns = [
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
    { header: 'Email', key: 'email', exportValue: (r) => r.email || '' },
    { header: 'Téléphone', key: 'telephone', exportValue: (r) => r.telephone || '' },
    { header: 'Adresse', key: 'address', exportValue: (r) => r.address || '' },
    { header: 'Semestre', key: 'semester', exportValue: (r) => r.semester || '' },
    { header: 'Catégorie', key: 'track_category', exportValue: (r) => r.track_category || '' },
    { header: 'Niveau', key: 'track_level', exportValue: (r) => r.track_level || '' },
    {
      header: 'Actions',
      render: (r) => (
        <div style={{ textAlign: 'right' }}>
          {role === 'admin' ? (
            <>
              <Button variant="secondary" onClick={() => openEditModal(r)} style={{ marginRight: 8 }}>
                Éditer
              </Button>
              <Button variant="danger" onClick={() => onDeleteStudent(r.id)}>
                Supprimer
              </Button>
            </>
          ) : null}
        </div>
      ),
      exportValue: () => ''
    }
  ]

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
          {role === 'admin' ? (
            <>
              <Button variant="secondary" onClick={() => openEditModal(r)} style={{ marginRight: 8 }}>
                Éditer
              </Button>
              <Button variant="danger" onClick={() => onDeleteStudent(r.id)}>
                Supprimer
              </Button>
            </>
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

  async function refreshNoteData() {
    setLoading(true)
    try {
      const [sub, ass, gr] = await Promise.all([apiGet('/api/subjects'), apiGet('/api/assessments'), apiGet('/api/grades')])
      setSubjects(sub.items || [])
      setAssessments(ass.items || [])
      setGrades(gr.items || [])
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

  useEffect(() => {
    if (activeTab === 'note') {
      void refreshNoteData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role])

  const assessmentsById = useMemo(() => new Map(assessments.map((a) => [Number(a.id), a])), [assessments])

  function computeStudentSubjectScore(studentId, subjectId) {
    // Weighted by assessment coefficient (fallback 1)
    let sum = 0
    let wsum = 0
    for (const g of grades) {
      if (Number(g.student_id) !== Number(studentId)) continue
      const a = assessmentsById.get(Number(g.assessment_id))
      if (!a || Number(a.subject_id) !== Number(subjectId)) continue
      const w = a.coefficient == null || a.coefficient === '' ? 1 : Number(a.coefficient)
      const v = g.score == null || g.score === '' ? null : Number(g.score)
      if (v == null || Number.isNaN(v)) continue
      sum += v * w
      wsum += w
    }
    if (!wsum) return null
    return sum / wsum
  }

  const noteRows = useMemo(() => {
    if (!students?.length) return []
    return students.map((s) => {
      const row = {
        id: s.id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim()
      }
      let sum = 0
      let n = 0
      for (const subj of subjects) {
        const v = computeStudentSubjectScore(s.id, subj.id)
        row[`subj_${subj.id}`] = v
        if (v != null && !Number.isNaN(Number(v))) {
          sum += Number(v)
          n += 1
        }
      }
      row.average = n ? sum / n : null
      return row
    })
  }, [students, subjects, grades, assessmentsById])

  const noteColumns = useMemo(() => {
    const cols = [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Nom', key: 'name', sortValue: (r) => r.name, exportValue: (r) => r.name || '' }
    ]

    for (const s of subjects) {
      const label = (s.code || s.title || '').toString().trim() || `MAT${s.id}`
      cols.push({
        header: label,
        key: `subj_${s.id}`,
        width: 120,
        align: 'right',
        sortValue: (r) => (r[`subj_${s.id}`] == null ? -Infinity : r[`subj_${s.id}`]),
        render: (r) => {
          const v = r[`subj_${s.id}`]
          if (v == null) return '-'
          const n = Number(v)
          if (Number.isNaN(n)) return '-'
          return n.toFixed(2)
        },
        exportValue: (r) => (r[`subj_${s.id}`] == null ? '' : r[`subj_${s.id}`])
      })
    }

    cols.push({
      header: 'Moyenne',
      key: 'average',
      width: 120,
      align: 'right',
      render: (r) => (r.average == null ? '-' : Number(r.average).toFixed(2)),
      exportValue: (r) => (r.average == null ? '' : r.average)
    })

    return cols
  }, [subjects])

  const presenceRows = useMemo(() => {
    // Placeholder until we have backend attendance data.
    return students.map((s) => ({
      id: s.id,
      name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
      m5: 0,
      m6: 0,
      m7: 0
    }))
  }, [students])

  const presenceColumns = useMemo(() => {
    return [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Nom', key: 'name', sortValue: (r) => r.name, exportValue: (r) => r.name || '' },
      { header: 'Mois 1', key: 'm1', align: 'right', width: 110 },
      { header: 'Mois 2', key: 'm2', align: 'right', width: 110 },
      { header: 'Mois 3', key: 'm3', align: 'right', width: 110 },
      { header: 'Mois 4', key: 'm4', align: 'right', width: 110 },
      { header: 'Mois 5', key: 'm5', align: 'right', width: 110 },
      { header: 'Mois 6', key: 'm6', align: 'right', width: 110 },
      { header: 'Mois 7', key: 'm7', align: 'right', width: 110 }
    ]
  }, [])

  async function selectTrack(cat, level) {
    onError?.(null)
    setSelectedCategory(cat)
    setSelectedLevel(level)
    await refresh({ track_category: cat, track_level: level })
  }

  async function onSubmitStudentForm(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/students', {
        matricule: formMatricule,
        first_name: formFirstName,
        last_name: formLastName,
        email: formEmail || null,
        telephone: formTelephone || null,
        address: formAddress || null,
        photo_url: null,
        semester: formSemester || null,
        track_category: formTrackCategory || null,
        track_level: formTrackLevel || null,
        remark: formRemark || null
      })
      closeModal()
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
                    onClick={() => setExpandedCategory(isOpen ? null : c.key)}
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

        <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Matricule</div>
            <Input value={queryMatricule} onChange={(e) => setQueryMatricule(e.target.value)} placeholder="2026-TLC-001" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Prénom</div>
            <Input value={queryFirstName} onChange={(e) => setQueryFirstName(e.target.value)} placeholder="Ex: Aina" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Nom</div>
            <Input value={queryLastName} onChange={(e) => setQueryLastName(e.target.value)} placeholder="Ex: Rakoto" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Semestre</div>
            <Input value={querySemester} onChange={(e) => setQuerySemester(e.target.value)} placeholder="S1" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <Button type="button" variant="secondary" style={{ width: '100%' }} onClick={() => onError?.(null)}>
              Rechercher
            </Button>
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            {canWrite ? (
              <Button variant="primary" type="button" style={{ width: '100%' }} onClick={openCreateModal}>
                Ajouter
              </Button>
            ) : null}
          </div>
        </div>

        {canWrite ? <div /> : <div className="label">Lecture seule.</div>}

        {isModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal()
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              zIndex: 200,
              overflow: 'auto'
            }}
          >
            <div
              className="card"
              style={{
                width: 'min(1320px, 98vw)',
                background: '#fff',
                color: '#000',
                position: 'relative',
                zIndex: 201,
                minHeight: 260,
                maxHeight: 'calc(100vh - 40px)',
                overflow: 'auto',
                border: '1px solid rgba(0,0,0,0.12)',
                boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
                outline: '3px solid #ef4444',
                opacity: 1
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <div
                className="card__header"
                style={{ background: '#fff', color: '#000', borderBottom: '1px solid rgba(0,0,0,0.12)' }}
              >
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>Ajouter étudiant</div>
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Fermer
                  </Button>
                </div>
              </div>

              <div className="card__body" style={{ color: '#000', background: '#fff' }}>
                <form onSubmit={onSubmitStudentForm}>
                  <div className="grid" style={{ gridTemplateColumns: '1.35fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
                    <div style={{ border: '1px solid #e6e6e6', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e6e6e6' }}>Info</div>
                      <div style={{ padding: 12, maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Photo</div>
                            <input
                              className="input"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null
                                setFormPhotoFile(f)
                              }}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                            {formPhotoPreviewUrl ? (
                              <div style={{ marginTop: 10 }}>
                                <img
                                  src={formPhotoPreviewUrl}
                                  alt="photo"
                                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid #e6e6e6' }}
                                />
                              </div>
                            ) : null}
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Matricule</div>
                            <Input value={formMatricule} onChange={(e) => setFormMatricule(e.target.value)} style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>

                          <div>
                            <div className="label" style={{ color: '#000' }}>Prénom</div>
                            <Input value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Nom</div>
                            <Input value={formLastName} onChange={(e) => setFormLastName(e.target.value)} style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Email</div>
                            <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>

                          <div>
                            <div className="label" style={{ color: '#000' }}>Téléphone</div>
                            <Input value={formTelephone} onChange={(e) => setFormTelephone(e.target.value)} style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Semestre</div>
                            <Input value={formSemester} onChange={(e) => setFormSemester(e.target.value)} placeholder="S1" style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Adresse</div>
                            <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e6e6e6', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e6e6e6' }}>Parcours</div>
                      <div style={{ padding: 12, maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Catégorie</div>
                            <select
                              className="input"
                              value={formTrackCategory}
                              onChange={(e) => {
                                const v = e.target.value
                                setFormTrackCategory(v)
                                setFormTrackLevel('')
                              }}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                              <option value="">--</option>
                              <option value="academique">Académique</option>
                              <option value="professionnel">Professionnel</option>
                              <option value="luban">Luban</option>
                            </select>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Niveau</div>
                            <select
                              className="input"
                              value={formTrackLevel}
                              onChange={(e) => setFormTrackLevel(e.target.value)}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                              <option value="">--</option>
                              {categories
                                .find((c) => c.key === formTrackCategory)
                                ?.levels.map((lvl) => (
                                  <option key={`${formTrackCategory}:${lvl}`} value={lvl}>
                                    {lvl}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Remarque</div>
                            <textarea
                              className="input"
                              value={formRemark}
                              onChange={(e) => setFormRemark(e.target.value)}
                              style={{ minHeight: 140, resize: 'vertical', color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                              placeholder="Remarques…"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e6e6e6', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e6e6e6' }}>Autre</div>
                      <div style={{ padding: 12, maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="label" style={{ color: '#000' }}>Encore vide.</div>
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                    <Button variant="primary" type="submit" disabled={!formMatricule.trim() || !formFirstName.trim() || !formLastName.trim()}>
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'note' ? (
          <DataTable
            title="Tableau"
            subtitle={loading ? 'Chargement…' : null}
            rows={noteRows}
            columns={noteColumns}
            Button={Button}
            Input={Input}
            initialSortKey="id"
            initialSortDir="asc"
            defaultPageSize={10}
            toolbarContent={
              <>
                {[
                  { key: 'note', label: 'Note' },
                  { key: 'presence', label: 'Presence' },
                  { key: 'info', label: 'Info' },
                  { key: 'general', label: 'General' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`pill ${activeTab === t.key ? 'pill--active' : ''}`}
                    onClick={() => {
                      onError?.(null)
                      setActiveTab(t.key)
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            }
            actions={
              <Button type="button" onClick={() => refreshNoteData()} disabled={loading}>
                Rafraîchir
              </Button>
            }
            exportFileName="notes.csv"
            searchPlaceholder="Recherche (id, nom…)"
            getRowSearchText={(r) => `${r.id} ${r.name || ''}`}
          />
        ) : activeTab === 'presence' ? (
          <DataTable
            title="Tableau"
            subtitle="(Données de présence à connecter côté backend)"
            rows={presenceRows}
            columns={presenceColumns}
            Button={Button}
            Input={Input}
            initialSortKey="id"
            initialSortDir="asc"
            defaultPageSize={10}
            toolbarContent={
              <>
                {[
                  { key: 'note', label: 'Note' },
                  { key: 'presence', label: 'Presence' },
                  { key: 'info', label: 'Info' },
                  { key: 'general', label: 'General' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`pill ${activeTab === t.key ? 'pill--active' : ''}`}
                    onClick={() => {
                      onError?.(null)
                      setActiveTab(t.key)
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            }
            actions={
              <Button type="button" onClick={() => refresh()} disabled={loading}>
                Rafraîchir
              </Button>
            }
            exportFileName="presence.csv"
            searchPlaceholder="Recherche (id, nom…)"
            getRowSearchText={(r) => `${r.id} ${r.name || ''}`}
          />
        ) : activeTab === 'general' ? (
          <DataTable
            title="Tableau"
            subtitle={null}
            rows={filteredStudents}
            columns={generalColumns}
            Button={Button}
            Input={Input}
            initialSortKey="id"
            initialSortDir="desc"
            defaultPageSize={10}
            toolbarContent={
              <>
                {[
                  { key: 'note', label: 'Note' },
                  { key: 'presence', label: 'Presence' },
                  { key: 'info', label: 'Info' },
                  { key: 'general', label: 'General' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`pill ${activeTab === t.key ? 'pill--active' : ''}`}
                    onClick={() => {
                      onError?.(null)
                      setActiveTab(t.key)
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            }
            actions={
              <Button type="button" onClick={() => refresh()} disabled={loading}>
                Rafraîchir
              </Button>
            }
            exportFileName="students_general.csv"
            searchPlaceholder="Recherche (matricule, nom, semestre…)"
            getRowSearchText={(r) => `${r.matricule || ''} ${r.first_name || ''} ${r.last_name || ''} ${r.semester || ''} ${r.track_category || ''} ${r.track_level || ''} ${r.email || ''} ${r.telephone || ''} ${r.address || ''}`}
          />
        ) : (
          <DataTable
            title="Tableau"
            subtitle={null}
            rows={filteredStudents}
            columns={columns}
            Button={Button}
            Input={Input}
            initialSortKey="id"
            initialSortDir="desc"
            defaultPageSize={10}
            toolbarContent={
              <>
                {[
                  { key: 'note', label: 'Note' },
                  { key: 'presence', label: 'Presence' },
                  { key: 'info', label: 'Info' },
                  { key: 'general', label: 'General' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`pill ${activeTab === t.key ? 'pill--active' : ''}`}
                    onClick={() => {
                      onError?.(null)
                      setActiveTab(t.key)
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            }
            actions={
              <Button type="button" onClick={() => refresh()} disabled={loading}>
                Rafraîchir
              </Button>
            }
            exportFileName="students.csv"
            searchPlaceholder="Recherche (matricule, nom, semestre…)"
            getRowSearchText={(r) => `${r.matricule || ''} ${r.first_name || ''} ${r.last_name || ''} ${r.semester || ''} ${r.track_category || ''} ${r.track_level || ''}`}
          />
        )}
      </div>
    </div>
  )
}
