import React, { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost, apiPut } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function CourseProgressView({ role, Button, Input, Select, onError, embedded = false }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])

  const [filterSemesterId, setFilterSemesterId] = useState('')
  const [filterClassId, setFilterClassId] = useState('')

  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [matiereAFinir, setMatiereAFinir] = useState('')
  const [enCours, setEnCours] = useState('')

  const canWrite = role === 'admin' || role === 'prof'

  async function refreshAll() {
    setLoading(true)
    onError?.(null)
    try {
      const params = new URLSearchParams()
      if (filterSemesterId) params.set('semester_id', filterSemesterId)
      if (filterClassId) params.set('class_id', filterClassId)
      const qs = params.toString() ? `?${params.toString()}` : ''

      const [cp, sem, cls, sub] = await Promise.all([
        apiGet(`/api/course-progress${qs}`),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects')
      ])
      setItems(cp.items || [])
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
  }, [role, filterSemesterId, filterClassId])

  const semestersById = useMemo(() => new Map(semesters.map((s) => [Number(s.id), s])), [semesters])
  const classesById = useMemo(() => new Map(classes.map((c) => [Number(c.id), c])), [classes])
  const subjectsById = useMemo(() => new Map(subjects.map((s) => [Number(s.id), s])), [subjects])

  const enriched = useMemo(() => {
    return (items || []).map((r) => {
      const sem = semestersById.get(Number(r.semester_id))
      const cls = classesById.get(Number(r.class_id))
      const subj = subjectsById.get(Number(r.subject_id))
      const a = r.matiere_a_finir == null ? null : Number(r.matiere_a_finir)
      const b = r.en_cours == null ? null : Number(r.en_cours)
      const done = a != null && b != null ? Math.max(a - b, 0) : null
      return {
        ...r,
        _semesterLabel: sem ? `${sem.code} — ${sem.title}` : `#${r.semester_id}`,
        _classLabel: cls ? `${cls.code} — ${cls.title}` : `#${r.class_id}`,
        _subjectLabel: subj ? `${subj.code} — ${subj.title}` : `#${r.subject_id}`,
        nbr_matiere_acheve: done
      }
    })
  }, [items, semestersById, classesById, subjectsById])

  const columns = useMemo(() => {
    return [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Semestre', key: '_semesterLabel', sortValue: (r) => r._semesterLabel, exportValue: (r) => r._semesterLabel || '' },
      { header: 'Classe', key: '_classLabel', sortValue: (r) => r._classLabel, exportValue: (r) => r._classLabel || '' },
      { header: 'Matière', key: '_subjectLabel', sortValue: (r) => r._subjectLabel, exportValue: (r) => r._subjectLabel || '' },
      {
        header: 'Matières à finir',
        key: 'matiere_a_finir',
        align: 'right',
        width: 140,
        render: (r) => {
          if (role !== 'admin') return r.matiere_a_finir ?? '-'
          return <Input type="number" value={r.matiere_a_finir ?? ''} onChange={() => {}} disabled />
        },
        exportValue: (r) => r.matiere_a_finir ?? ''
      },
      {
        header: 'En cours',
        key: 'en_cours',
        align: 'right',
        width: 110,
        exportValue: (r) => r.en_cours ?? ''
      },
      {
        header: 'Achevées',
        key: 'nbr_matiere_acheve',
        align: 'right',
        width: 110,
        exportValue: (r) => r.nbr_matiere_acheve ?? ''
      }
    ]
  }, [Input, role])

  async function onUpsert(e) {
    e.preventDefault()
    onError?.(null)
    try {
      await apiPost('/api/course-progress', {
        semester_id: Number(semesterId),
        class_id: Number(classId),
        subject_id: Number(subjectId),
        matiere_a_finir: role === 'admin' && matiereAFinir !== '' ? Number(matiereAFinir) : undefined,
        en_cours: enCours !== '' ? Number(enCours) : undefined
      })
      setSemesterId('')
      setClassId('')
      setSubjectId('')
      setMatiereAFinir('')
      setEnCours('')
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  const canSubmit = canWrite && semesterId && classId && subjectId && (role === 'admin' ? matiereAFinir !== '' || enCours !== '' : enCours !== '')

  async function onInitFromClassSubjects() {
    onError?.(null)
    try {
      await apiPost('/api/course-progress/init', {
        semester_id: Number(semesterId || filterSemesterId),
        class_id: Number(classId || filterClassId)
      })
      await refreshAll()
    } catch (err) {
      onError?.(err?.data?.error || 'Erreur')
    }
  }

  if (embedded) {
    return (
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
        actions={
          <Button type="button" onClick={refreshAll} disabled={loading}>
            Rafraîchir
          </Button>
        }
        exportFileName="course_progress.csv"
        searchPlaceholder="Recherche (classe, matière, semestre…)"
        getRowSearchText={(r) => `${r._semesterLabel || ''} ${r._classLabel || ''} ${r._subjectLabel || ''} ${r.matiere_a_finir ?? ''} ${r.en_cours ?? ''}`}
      />
    )
  }

  return (
    <div className="card">
      <div className="card__header">Gestion cours</div>
      <div className="card__body grid">
        <div className="badge">Semestre = bloc (4 mois) • {loading ? 'Chargement…' : `Lignes: ${enriched.length}`}</div>

        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <div style={{ width: 220 }}>
              <Select value={filterSemesterId} onChange={(e) => setFilterSemesterId(e.target.value)}>
                <option value="">-- filtre semestre --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ width: 260 }}>
              <Select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)}>
                <option value="">-- filtre classe --</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, flex: '1 1 auto' }}>
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </div>

        {canWrite ? (
          <form onSubmit={onUpsert} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
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
                <option value="">-- choisir --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </Select>
            </div>

            {role === 'admin' ? (
              <div style={{ gridColumn: 'span 3' }}>
                <div className="label">Matières à finir (admin)</div>
                <Input type="number" value={matiereAFinir} onChange={(e) => setMatiereAFinir(e.target.value)} placeholder="ex: 20" />
              </div>
            ) : null}

            <div style={{ gridColumn: role === 'admin' ? 'span 3' : 'span 6' }}>
              <div className="label">En cours (prof)</div>
              <Input type="number" value={enCours} onChange={(e) => setEnCours(e.target.value)} placeholder="ex: 5" />
            </div>

            <div style={{ gridColumn: 'span 6' }}>
              <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <Button
                  type="button"
                  onClick={onInitFromClassSubjects}
                  disabled={!(semesterId || filterSemesterId) || !(classId || filterClassId)}
                >
                  Initialiser depuis matières de la classe
                </Button>
                <Button variant="primary" type="submit" style={{ flex: '1 1 auto' }} disabled={!canSubmit}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="label">Lecture seule.</div>
        )}

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
          actions={
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          }
          exportFileName="course_progress.csv"
          searchPlaceholder="Recherche (classe, matière, semestre…)"
          getRowSearchText={(r) => `${r._semesterLabel || ''} ${r._classLabel || ''} ${r._subjectLabel || ''} ${r.matiere_a_finir ?? ''} ${r.en_cours ?? ''}`}
        />
      </div>
    </div>
  )
}
