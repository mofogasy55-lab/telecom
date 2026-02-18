import React, { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js'

export default function TeachersView({ role, Button, Input, onError }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [queryFirstName, setQueryFirstName] = useState('')
  const [queryLastName, setQueryLastName] = useState('')
  const [querySpecialite, setQuerySpecialite] = useState('')
  const [queryEmail, setQueryEmail] = useState('')

  const [expandedType, setExpandedType] = useState(null)
  const [selectedType, setSelectedType] = useState('')

  const [subjects, setSubjects] = useState([])
  const [teacherSubjectsByTeacher, setTeacherSubjectsByTeacher] = useState({})
  const [subjectToAddByTeacher, setSubjectToAddByTeacher] = useState({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacherId, setEditingTeacherId] = useState(null)
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formSpecialite, setFormSpecialite] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTeacherType, setFormTeacherType] = useState('academique')
  const [formGrade, setFormGrade] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formDateRecrutement, setFormDateRecrutement] = useState('')

  const [formSubjectsSelected, setFormSubjectsSelected] = useState([])

  const [formAvailabilityNotes, setFormAvailabilityNotes] = useState('')

  const [availabilitySets, setAvailabilitySets] = useState([])
  const [selectedAvailabilitySetId, setSelectedAvailabilitySetId] = useState('')
  const [availabilityByDow, setAvailabilityByDow] = useState({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
    6: ''
  })
  const [savingAvailability, setSavingAvailability] = useState(false)

  const [expandedSubjectsTeacherId, setExpandedSubjectsTeacherId] = useState(null)

  const [newSubjectCode, setNewSubjectCode] = useState('')
  const [newSubjectTitle, setNewSubjectTitle] = useState('')
  const [creatingSubject, setCreatingSubject] = useState(false)

  const canWrite = role === 'admin'

  const teacherTypes = useMemo(
    () => [
      { key: 'vacataire', label: 'Vacataire' },
      { key: 'luban', label: 'Luban' },
      { key: 'academique', label: 'Académique' },
      { key: 'professionnel', label: 'Professionnel' }
    ],
    []
  )

  const filtered = useMemo(() => {
    const qFirst = queryFirstName.trim().toLowerCase()
    const qLast = queryLastName.trim().toLowerCase()
    const qSpec = querySpecialite.trim().toLowerCase()
    const qEmail = queryEmail.trim().toLowerCase()
    const type = (selectedType || '').trim().toLowerCase()
    const base = !type ? teachers : teachers.filter((t) => (t.teacher_type || '').toLowerCase() === type)
    if (!qFirst && !qLast && !qSpec && !qEmail) return base
    return base.filter((t) => {
      const first = `${t.first_name || ''}`.toLowerCase()
      const last = `${t.last_name || ''}`.toLowerCase()
      const spec = `${t.specialite || ''}`.toLowerCase()
      const email = `${t.email || ''}`.toLowerCase()
      if (qFirst && !first.includes(qFirst)) return false
      if (qLast && !last.includes(qLast)) return false
      if (qSpec && !spec.includes(qSpec)) return false
      if (qEmail && !email.includes(qEmail)) return false
      return true
    })
  }, [queryFirstName, queryLastName, querySpecialite, queryEmail, teachers, selectedType])

  function openCreateModal() {
    setEditingTeacherId(null)
    setFormFirstName('')
    setFormLastName('')
    setFormSpecialite('')
    setFormEmail('')
    setFormTeacherType(selectedType || 'academique')
    setFormGrade('')
    setFormTelephone('')
    setFormDateRecrutement('')
    setFormSubjectsSelected([])
    setFormAvailabilityNotes('')
    setAvailabilitySets([])
    setSelectedAvailabilitySetId('')
    setAvailabilityByDow({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' })
    setNewSubjectCode('')
    setNewSubjectTitle('')
    setIsModalOpen(true)
  }

  const subjectIndexById = useMemo(() => {
    const map = new Map()
    for (const s of subjects) map.set(Number(s.id), s)
    return map
  }, [subjects])

  function toggleSubject(subjectId) {
    const sid = Number(subjectId)
    if (!sid) return
    setFormSubjectsSelected((prev) => {
      const has = prev.map((x) => Number(x)).includes(sid)
      if (has) return prev.filter((x) => Number(x) !== sid)
      return [...prev, sid]
    })
  }

  function getTeacherSubjectsLabels(teacherId) {
    const ids = (teacherSubjectsByTeacher[teacherId] || []).map((x) => Number(x.subject_id))
    const labels = []
    for (const id of ids) {
      const s = subjectIndexById.get(id)
      if (s) labels.push(`${s.code} — ${s.title}`)
    }
    return labels
  }

  function openEditModal(t) {
    setEditingTeacherId(t.id)
    setFormFirstName(t.first_name || '')
    setFormLastName(t.last_name || '')
    setFormSpecialite(t.specialite || '')
    setFormEmail(t.email || '')
    setFormTeacherType((t.teacher_type || '').toLowerCase() || 'academique')
    setFormGrade(t.grade || '')
    setFormTelephone(t.telephone || '')
    setFormDateRecrutement(t.date_recrutement || '')
    // Initial value will be replaced once we ensure teacher-subjects are loaded
    setFormSubjectsSelected((teacherSubjectsByTeacher[t.id] || []).map((x) => x.subject_id))
    setFormAvailabilityNotes(t.availability_notes || '')
    setAvailabilitySets([])
    setSelectedAvailabilitySetId('')
    setAvailabilityByDow({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' })
    setNewSubjectCode('')
    setNewSubjectTitle('')
    setIsModalOpen(true)

    if (canWrite) {
      void (async () => {
        const items = await refreshTeacherSubjects(t.id)
        setFormSubjectsSelected((items || []).map((x) => x.subject_id))
      })()
      void loadAvailabilityForTeacher(t.id)
    }
  }

  async function loadAvailabilityForTeacher(teacherId) {
    try {
      const sets = await apiGet(`/api/teacher-availability-sets?teacher_id=${teacherId}`)
      const items = sets.items || []
      setAvailabilitySets(items)

      let setId = items[0]?.id || null
      if (!setId) {
        const created = await apiPost('/api/teacher-availability-sets', {
          teacher_id: teacherId,
          valid_from: new Date().toISOString().slice(0, 10)
        })
        setId = created.id
        const nextSets = (await apiGet(`/api/teacher-availability-sets?teacher_id=${teacherId}`)).items || []
        setAvailabilitySets(nextSets)
      }

      if (setId) {
        setSelectedAvailabilitySetId(String(setId))
        await loadAvailabilityDays(setId)
      }
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function loadAvailabilityDays(setId) {
    const data = await apiGet(`/api/teacher-availabilities?availability_set_id=${setId}`)
    const items = data.items || []
    const next = { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' }
    for (const it of items) {
      const d = Number(it.day_of_week)
      if (d >= 1 && d <= 6) next[d] = it.time_ranges || ''
    }
    setAvailabilityByDow(next)
  }

  async function saveAvailability() {
    onError?.(null)
    const sid = Number(selectedAvailabilitySetId || 0)
    if (!sid) return
    setSavingAvailability(true)
    try {
      await apiPut('/api/teacher-availabilities', {
        availability_set_id: sid,
        days: [1, 2, 3, 4, 5, 6].map((dow) => ({ day_of_week: dow, time_ranges: availabilityByDow[dow] || null }))
      })
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setSavingAvailability(false)
    }
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  async function refresh() {
    setLoading(true)
    try {
      const data = await apiGet('/api/teachers')
      setTeachers(data.items || [])

      if (canWrite) {
        const subData = await apiGet('/api/subjects')
        setSubjects(subData.items || [])

        // Load all relations once, to avoid per-teacher fetch and keep the list synchronized.
        const relData = await apiGet('/api/teacher-subjects')
        const relItems = relData.items || []
        const grouped = {}
        for (const it of relItems) {
          const tid = Number(it.teacher_id)
          if (!grouped[tid]) grouped[tid] = []
          grouped[tid].push(it)
        }
        setTeacherSubjectsByTeacher(grouped)
      }
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function refreshTeacherSubjects(teacherId) {
    try {
      const data = await apiGet(`/api/teacher-subjects?teacher_id=${teacherId}`)
      const items = data.items || []
      setTeacherSubjectsByTeacher((prev) => ({ ...prev, [teacherId]: items }))
      return items
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
      return null
    }
  }

  async function onAddSubjectToTeacher(teacherId) {
    onError?.(null)
    const subjectId = Number(subjectToAddByTeacher[teacherId] || 0)
    if (!subjectId) return
    try {
      await apiPost('/api/teacher-subjects', { teacher_id: teacherId, subject_id: subjectId })
      setSubjectToAddByTeacher((prev) => ({ ...prev, [teacherId]: '' }))
      await refreshTeacherSubjects(teacherId)
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onRemoveSubjectFromTeacher(teacherId, teacherSubjectId) {
    onError?.(null)
    try {
      await apiDelete(`/api/teacher-subjects/${teacherSubjectId}`)
      await refreshTeacherSubjects(teacherId)
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  async function onCreateSubjectQuick() {
    onError?.(null)
    const code = newSubjectCode.trim()
    const title = newSubjectTitle.trim()
    if (!code || !title) return

    setCreatingSubject(true)
    try {
      await apiPost('/api/subjects', { code, title })
      const subData = await apiGet('/api/subjects')
      const next = subData.items || []
      setSubjects(next)

      const created = next.find((s) => String(s.code || '').trim() === code)
      if (created?.id) {
        setFormSubjectsSelected((prev) => {
          const sid = Number(created.id)
          if (prev.includes(sid)) return prev
          return [...prev, sid]
        })
      }

      setNewSubjectCode('')
      setNewSubjectTitle('')
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    } finally {
      setCreatingSubject(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  async function onSubmitTeacherForm(e) {
    e.preventDefault()
    onError?.(null)
    const payload = {
      first_name: formFirstName,
      last_name: formLastName,
      specialite: formSpecialite || null,
      email: formEmail || null,
      teacher_type: formTeacherType || null,
      is_vacataire: formTeacherType === 'vacataire',
      grade: formGrade || null,
      telephone: formTelephone || null,
      date_recrutement: formDateRecrutement || null
    }
    try {
      // Snapshot of previous subjects (only reliable if we loaded them)
      const prevSubjectItems = editingTeacherId ? teacherSubjectsByTeacher[editingTeacherId] || [] : []
      const prevSubjectIds = prevSubjectItems.map((x) => Number(x.subject_id))

      let teacherIdForSync = editingTeacherId

      if (editingTeacherId) {
        await apiPut(`/api/teachers/${editingTeacherId}`, payload)
      } else {
        const created = await apiPost('/api/teachers', payload)
        if (created?.id) {
          setEditingTeacherId(created.id)
          teacherIdForSync = created.id
        }
      }

      if (canWrite) {
        // Ensure we have the teacher id for syncing subjects
        const teacherId = teacherIdForSync

        if (teacherId) {
          // Ensure previous subjects loaded
          let currentItems = teacherSubjectsByTeacher[teacherId] || []
          if (!teacherSubjectsByTeacher[teacherId]) {
            const fetched = await refreshTeacherSubjects(teacherId)
            currentItems = fetched || []
          }
          const currentIds = currentItems.map((x) => Number(x.subject_id))

          const nextIds = formSubjectsSelected.map((x) => Number(x))
          const toAdd = nextIds.filter((id) => !currentIds.includes(id))
          const toRemove = currentItems.filter((it) => !nextIds.includes(Number(it.subject_id)))

          for (const subjectId of toAdd) {
            // ignore duplicates errors
            try {
              await apiPost('/api/teacher-subjects', { teacher_id: teacherId, subject_id: subjectId })
            } catch (err) {
              if (err?.status !== 409) throw err
            }
          }

          for (const it of toRemove) {
            await apiDelete(`/api/teacher-subjects/${it.id}`)
          }

          await refreshTeacherSubjects(teacherId)
        }
      }

      closeModal()
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
      <div className="card__header">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800 }}>Enseignants</div>

          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              {teacherTypes.map((t) => {
                const isOpen = expandedType === t.key
                const isSelected = selectedType === t.key
                return (
                  <div
                    key={t.key}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setExpandedType(t.key)}
                    onMouseLeave={() => setExpandedType((cur) => (cur === t.key ? null : cur))}
                    onClick={() => {
                      onError?.(null)
                      setSelectedType((cur) => (cur === t.key ? '' : t.key))
                    }}
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
                        border: isOpen || isSelected ? '2px solid #000' : '1px solid #d9d9d9',
                        borderRadius: 10,
                        background: '#fff',
                        fontWeight: 800,
                        color: '#000'
                      }}
                    >
                      {t.label}
                    </div>
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
            Total: {teachers.length} • Affichés: {filtered.length} {loading ? '• Chargement…' : ''}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Prénom</div>
            <Input value={queryFirstName} onChange={(e) => setQueryFirstName(e.target.value)} placeholder="Ex: Aina" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Nom</div>
            <Input value={queryLastName} onChange={(e) => setQueryLastName(e.target.value)} placeholder="Ex: Rakoto" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Spécialité</div>
            <Input value={querySpecialite} onChange={(e) => setQuerySpecialite(e.target.value)} placeholder="Ex: Réseaux" />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <div className="label">Email</div>
            <Input value={queryEmail} onChange={(e) => setQueryEmail(e.target.value)} placeholder="Ex: prof@..." />
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

        {canWrite ? (
          <div />
        ) : (
          <div className="label">Lecture seule.</div>
        )}

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
              <style>{`
                .teacherModal .input::placeholder { color: #16a34a; opacity: 1; }
                .teacherModal textarea::placeholder { color: #16a34a; opacity: 1; }
              `}</style>
              <div
                className="card__header"
                style={{ background: '#fff', color: '#000', borderBottom: '1px solid rgba(0,0,0,0.12)' }}
              >
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{editingTeacherId ? 'Modifier enseignant' : 'Ajouter enseignant'}</div>
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Fermer
                  </Button>
                </div>
              </div>
              <div className="card__body teacherModal" style={{ color: '#000', background: '#fff' }}>
                <form onSubmit={onSubmitTeacherForm}>
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: '1.35fr 1fr 1fr', gap: 12, alignItems: 'start' }}
                  >
                    <div style={{ border: '1px solid #e6e6e6', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e6e6e6' }}>Fiche professeur</div>
                      <div style={{ padding: 12, maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Type</div>
                            <select
                              className="input"
                              value={formTeacherType}
                              onChange={(e) => setFormTeacherType(e.target.value)}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                              {teacherTypes.map((t) => (
                                <option key={t.key} value={t.key}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Prénom</div>
                            <Input
                              value={formFirstName}
                              onChange={(e) => setFormFirstName(e.target.value)}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Nom</div>
                            <Input
                              value={formLastName}
                              onChange={(e) => setFormLastName(e.target.value)}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Email</div>
                            <Input
                              value={formEmail}
                              onChange={(e) => setFormEmail(e.target.value)}
                              placeholder="prenom.nom@espa.local"
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Spécialité</div>
                            <Input
                              value={formSpecialite}
                              onChange={(e) => setFormSpecialite(e.target.value)}
                              placeholder="Réseaux"
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Grade</div>
                            <Input
                              value={formGrade}
                              onChange={(e) => setFormGrade(e.target.value)}
                              placeholder="MCF"
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Téléphone</div>
                            <Input
                              value={formTelephone}
                              onChange={(e) => setFormTelephone(e.target.value)}
                              placeholder="034..."
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Date recrutement</div>
                            <Input
                              value={formDateRecrutement}
                              onChange={(e) => setFormDateRecrutement(e.target.value)}
                              placeholder="YYYY-MM-DD"
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Adresse</div>
                            <Input placeholder="Adresse" style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }} />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="label" style={{ color: '#000' }}>Observations</div>
                            <textarea
                              className="input"
                              style={{ minHeight: 110, resize: 'vertical', color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                              placeholder="Notes, informations complémentaires…"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e6e6e6', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e6e6e6' }}>Matières</div>
                      <div style={{ padding: 12, maxHeight: '65vh', overflowY: 'auto' }}>
                        {canWrite ? (
                          <div className="grid" style={{ gridTemplateColumns: '1fr 1.6fr auto', marginBottom: 12, alignItems: 'end' }}>
                            <div>
                              <div className="label" style={{ color: '#000' }}>Code</div>
                              <Input
                                value={newSubjectCode}
                                onChange={(e) => setNewSubjectCode(e.target.value)}
                                placeholder="MAT-NEW"
                                style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                              />
                            </div>
                            <div>
                              <div className="label" style={{ color: '#000' }}>Titre</div>
                              <Input
                                value={newSubjectTitle}
                                onChange={(e) => setNewSubjectTitle(e.target.value)}
                                placeholder="Nouvelle matière"
                                style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                              />
                            </div>
                            <div>
                              <Button
                                variant="primary"
                                type="button"
                                onClick={onCreateSubjectQuick}
                                disabled={creatingSubject || !newSubjectCode.trim() || !newSubjectTitle.trim()}
                                style={{ width: 120 }}
                              >
                                Ajouter
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {subjects.length === 0 ? (
                          <div className="label" style={{ color: '#000' }}>Aucune matière.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 8 }}>
                            {subjects.map((s) => {
                              const checked = formSubjectsSelected.includes(Number(s.id))
                              return (
                                <label
                                  key={s.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    color: '#000',
                                    padding: '10px 10px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: 10,
                                    background: checked ? '#ecfdf5' : '#fff'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSubject(s.id)}
                                    style={{ width: 18, height: 18, accentColor: '#16a34a' }}
                                  />
                                  <span style={{ fontWeight: 700 }}>{s.code}</span>
                                  <span style={{ opacity: 0.9 }}>{s.title}</span>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e6e6e6', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e6e6e6' }}>Disponibilités / EDT</div>
                      <div style={{ padding: 12, maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="grid" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
                          <div>
                            <div className="label" style={{ color: '#000' }}>Période (précédent / actuel / futur)</div>
                            <select
                              className="input"
                              value={selectedAvailabilitySetId}
                              onChange={async (e) => {
                                const v = e.target.value
                                setSelectedAvailabilitySetId(v)
                                if (v) await loadAvailabilityDays(Number(v))
                              }}
                              style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                              <option value="">--</option>
                              {availabilitySets.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                  {String(s.valid_from || '').slice(0, 10)} → {s.valid_to ? String(s.valid_to).slice(0, 10) : '…'}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Button
                              type="button"
                              variant="primary"
                              disabled={savingAvailability || !selectedAvailabilitySetId}
                              onClick={saveAvailability}
                              style={{ width: 140 }}
                            >
                              Enregistrer
                            </Button>
                          </div>
                        </div>

                        <div className="tableWrap" style={{ marginTop: 12 }}>
                          <table className="table">
                            <thead>
                              <tr>
                                <th style={{ width: 140 }}>Jour</th>
                                <th>Intervalles</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { dow: 1, label: 'Lundi' },
                                { dow: 2, label: 'Mardi' },
                                { dow: 3, label: 'Mercredi' },
                                { dow: 4, label: 'Jeudi' },
                                { dow: 5, label: 'Vendredi' },
                                { dow: 6, label: 'Samedi' }
                              ].map((d) => (
                                <tr key={d.dow}>
                                  <td style={{ fontWeight: 800, color: '#000' }}>{d.label}</td>
                                  <td>
                                    <input
                                      className="input"
                                      value={availabilityByDow[d.dow] || ''}
                                      onChange={(e) =>
                                        setAvailabilityByDow((prev) => ({
                                          ...prev,
                                          [d.dow]: e.target.value
                                        }))
                                      }
                                      placeholder="08:00-10:00; 14:00-16:00"
                                      style={{ color: '#000', background: '#f8fafc', borderColor: '#cbd5e1' }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Button variant="primary" type="submit" style={{ width: '100%' }}>
                      {editingTeacherId ? 'Enregistrer' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Spécialité</th>
                <th>Email</th>
                <th>Type</th>
                {canWrite ? (
                  <th style={{ minWidth: 320, position: 'relative' }}>
                    Matières
                  </th>
                ) : null}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>
                    {t.first_name} {t.last_name}
                  </td>
                  <td>{t.specialite || '-'}</td>
                  <td>{t.email || '-'}</td>
                  <td>{(t.teacher_type || '').toLowerCase() || (t.is_vacataire ? 'vacataire' : '') || '-'}</td>
                  {canWrite ? (
                    <td style={{ minWidth: 320, position: 'relative' }}>
                      {(() => {
                        const labels = getTeacherSubjectsLabels(t.id)
                        const full = labels.join(' | ')
                        const isLong = full.length > 60
                        const isExpanded = expandedSubjectsTeacherId === t.id
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              title={full}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {labels.length === 0 ? 'Aucune' : full}
                            </div>
                            {isLong ? (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setExpandedSubjectsTeacherId(isExpanded ? null : t.id)}
                                style={{ padding: '6px 10px' }}
                              >
                                {isExpanded ? 'Réduire' : 'Voir'}
                              </Button>
                            ) : null}
                            {isExpanded ? (
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '100%',
                                  marginTop: 6,
                                  width: 520,
                                  maxWidth: '70vw',
                                  background: '#fff',
                                  border: '1px solid #e6e6e6',
                                  borderRadius: 12,
                                  padding: 12,
                                  zIndex: 5,
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                  <div style={{ fontWeight: 800 }}>Matières</div>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setExpandedSubjectsTeacherId(null)}
                                    style={{ padding: '6px 10px' }}
                                  >
                                    Fermer
                                  </Button>
                                </div>
                                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                                  {labels.map((l) => (
                                    <div key={l} style={{ border: '1px solid #e6e6e6', borderRadius: 10, padding: '8px 10px' }}>
                                      {l}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )
                      })()}
                    </td>
                  ) : null}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {role === 'admin' ? (
                      <Button type="button" variant="secondary" onClick={() => openEditModal(t)}>
                        Éditer
                      </Button>
                    ) : null}
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
                  <td colSpan={canWrite ? 7 : 6} className="label" style={{ padding: 16 }}>
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
