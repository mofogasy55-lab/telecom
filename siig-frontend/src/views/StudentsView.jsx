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

  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceItems, setAttendanceItems] = useState([])
  const [attendanceSession, setAttendanceSession] = useState('')

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

  async function onDeleteStudent(id) {
    onError?.(null)
    try {
      await apiDelete(`/api/students/${id}`)
      await refresh()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

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
    const session = String(attendanceSession || '').trim()
    const base = Array.isArray(attendanceItems) && attendanceItems.length
      ? attendanceItems
      : students.map((s) => ({
          student_id: s.id,
          student_name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          session_code: String(s.semester || ''),
          present_count: null,
          absent_count: null
        }))

    return base
      .filter((x) => (session ? String(x.session_code || '') === session : true))
      .map((x, idx) => ({
        id: x.id ?? `${x.student_id}:${idx}`,
        student_id: x.student_id,
        name: x.student_name || `#${x.student_id}`,
        session: x.session_code || '-',
        present: x.present_count == null ? '-' : x.present_count,
        absent: x.absent_count == null ? '-' : x.absent_count
      }))
  }, [students, attendanceItems, attendanceSession])

  const presenceColumns = useMemo(() => {
    return [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Nom', key: 'name', sortValue: (r) => r.name, exportValue: (r) => r.name || '' },
      { header: 'Session', key: 'session', width: 90, sortValue: (r) => r.session, exportValue: (r) => r.session || '' },
      { header: 'Présent', key: 'present', align: 'right', width: 120, exportValue: (r) => r.present ?? '' },
      { header: 'Absent', key: 'absent', align: 'right', width: 120, exportValue: (r) => r.absent ?? '' }
    ]
  }, [])

  async function refreshAttendance() {
    setAttendanceLoading(true)
    try {
      const qs = attendanceSession ? `?session=${encodeURIComponent(attendanceSession)}` : ''
      const data = await apiGet(`/api/attendance${qs}`)
      setAttendanceItems(data.items || [])
    } catch {
      // keep fallback placeholder
      setAttendanceItems([])
    } finally {
      setAttendanceLoading(false)
    }
  }

  useEffect(() => {
    if (role === 'etudiant') {
      refreshAttendance()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, attendanceSession])

  return (
    <div className="card">
      <div className="card__header">Étudiants</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
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
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, flex: '1 1 auto' }}>
            <Button type="button" onClick={() => refresh()} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </div>

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
            exportFileName="notes.csv"
            searchPlaceholder="Recherche (id, nom…)"
            getRowSearchText={(r) => `${r.id} ${r.name || ''}`}
          />
        ) : activeTab === 'presence' ? (
          <DataTable
            title="Tableau"
            subtitle={attendanceLoading ? 'Chargement…' : null}
            rows={presenceRows}
            columns={presenceColumns}
            Button={Button}
            Input={Input}
            initialSortKey="name"
            initialSortDir="asc"
            defaultPageSize={10}
            actions={
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <select
                  className="input"
                  value={attendanceSession}
                  onChange={(e) => setAttendanceSession(e.target.value)}
                  style={{ width: 140 }}
                >
                  <option value="">Tout</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
                <Button type="button" onClick={refreshAttendance} disabled={attendanceLoading}>
                  Rafraîchir
                </Button>
              </div>
            }
            exportFileName="presence.csv"
            searchPlaceholder="Recherche (id, nom…)"
            getRowSearchText={(r) => `${r.id} ${r.name || ''} ${r.session || ''}`}
          />
        ) : activeTab === 'general' ? (
          <DataTable
            title="Tableau"
            subtitle={loading ? 'Chargement…' : null}
            rows={filteredStudents}
            columns={generalColumns}
            Button={Button}
            Input={Input}
            initialSortKey="id"
            initialSortDir="desc"
            defaultPageSize={10}
            exportFileName="students_general.csv"
            searchPlaceholder="Recherche (matricule, nom, semestre…)"
            getRowSearchText={(r) => `${r.matricule || ''} ${r.first_name || ''} ${r.last_name || ''} ${r.semester || ''}`}
          />
        ) : (
          <DataTable
            title="Tableau"
            subtitle={loading ? 'Chargement…' : null}
            rows={filteredStudents}
            columns={columns}
            Button={Button}
            Input={Input}
            initialSortKey="id"
            initialSortDir="desc"
            defaultPageSize={10}
            exportFileName="students.csv"
            searchPlaceholder="Recherche (matricule, nom, semestre…)"
            getRowSearchText={(r) => `${r.matricule || ''} ${r.first_name || ''} ${r.last_name || ''} ${r.semester || ''}`}
          />
        )}
      </div>
    </div>
  )
}
