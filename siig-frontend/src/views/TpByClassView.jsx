import React, { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function TpByClassView({ role, Button, Input, Select, onError, embedded = false }) {
  const [loading, setLoading] = useState(false)
  const [assessments, setAssessments] = useState([])
  const [grades, setGrades] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])

  const [semesterId, setSemesterId] = useState('')
  const [classId, setClassId] = useState('')

  const [viewMode, setViewMode] = useState('classes')

  async function refreshAll() {
    setLoading(true)
    onError?.(null)
    try {
      const [ass, gr, sem, cls, sub, tea] = await Promise.all([
        apiGet('/api/assessments'),
        apiGet('/api/grades'),
        apiGet('/api/semesters'),
        apiGet('/api/classes'),
        apiGet('/api/subjects'),
        apiGet('/api/teachers')
      ])
      setAssessments((ass.items || []).filter((a) => String(a.kind || '').toLowerCase() === 'tp'))
      setGrades(gr.items || [])
      setSemesters(sem.items || [])
      setClasses(cls.items || [])
      setSubjects(sub.items || [])
      setTeachers(tea.items || [])
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
  const teachersById = useMemo(() => new Map(teachers.map((t) => [Number(t.id), t])), [teachers])

  const gradeAggByAssessment = useMemo(() => {
    const map = new Map()
    for (const g of grades) {
      const aid = Number(g.assessment_id)
      if (!aid) continue
      const cur = map.get(aid) || { sum: 0, count: 0 }
      const v = g.score == null ? null : Number(g.score)
      if (v == null || Number.isNaN(v)) continue
      cur.sum += v
      cur.count += 1
      map.set(aid, cur)
    }
    return map
  }, [grades])

  const rows = useMemo(() => {
    return (assessments || [])
      .filter((a) => (semesterId ? String(a.semester_id) === String(semesterId) : true))
      .filter((a) => (classId ? String(a.class_id) === String(classId) : true))
      .map((a) => {
        const sem = semestersById.get(Number(a.semester_id))
        const cls = classesById.get(Number(a.class_id))
        const subj = subjectsById.get(Number(a.subject_id))
        const tea = teachersById.get(Number(a.teacher_id))
        const agg = gradeAggByAssessment.get(Number(a.id)) || { sum: 0, count: 0 }
        const avg = agg.count ? agg.sum / agg.count : null
        return {
          id: a.id,
          date: a.assessment_date || '-',
          semestre: sem ? sem.code : `#${a.semester_id}`,
          classe: cls ? cls.code : `#${a.class_id}`,
          matiere: subj ? subj.code : `#${a.subject_id}`,
          titre: a.title || '',
          enseignant: tea ? `${tea.first_name} ${tea.last_name}` : `#${a.teacher_id}`,
          moyenne: avg == null ? '-' : avg.toFixed(2)
        }
      })
  }, [assessments, semesterId, classId, semestersById, classesById, subjectsById, teachersById, gradeAggByAssessment])

  const aggregateByClass = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      const key = `${r.semestre}__${r.classe}`
      const cur = map.get(key) || { semestre: r.semestre, classe: r.classe, tp_count: 0, sum: 0, count: 0 }
      cur.tp_count += 1
      if (r.moyenne !== '-' && r.moyenne !== '' && r.moyenne != null) {
        cur.sum += Number(r.moyenne)
        cur.count += 1
      }
      map.set(key, cur)
    }
    const res = Array.from(map.values())
      .map((x) => ({ ...x, moyenne_globale: x.count ? (x.sum / x.count).toFixed(2) : '-' }))
      .sort((a, b) => String(a.classe || '').localeCompare(String(b.classe || ''), undefined, { numeric: true, sensitivity: 'base' }))
    return res
  }, [rows])

  const classAggColumns = useMemo(() => {
    return [
      { header: 'Semestre', key: 'semestre', width: 90, sortValue: (r) => r.semestre, exportValue: (r) => r.semestre || '' },
      { header: 'Classe', key: 'classe', width: 120, sortValue: (r) => r.classe, exportValue: (r) => r.classe || '' },
      { header: 'Nb TP', key: 'tp_count', align: 'right', width: 90, exportValue: (r) => r.tp_count ?? '' },
      { header: 'Moyenne', key: 'moyenne_globale', align: 'right', width: 110, exportValue: (r) => (r.moyenne_globale === '-' ? '' : r.moyenne_globale) }
    ]
  }, [])

  const columns = useMemo(() => {
    return [
      { header: 'ID', key: 'id', width: 80 },
      { header: 'Date', key: 'date', width: 120, exportValue: (r) => r.date || '' },
      { header: 'Semestre', key: 'semestre', width: 90, sortValue: (r) => r.semestre, exportValue: (r) => r.semestre || '' },
      { header: 'Classe', key: 'classe', width: 110, sortValue: (r) => r.classe, exportValue: (r) => r.classe || '' },
      { header: 'Matière', key: 'matiere', width: 100, sortValue: (r) => r.matiere, exportValue: (r) => r.matiere || '' },
      { header: 'Titre', key: 'titre', sortValue: (r) => r.titre, exportValue: (r) => r.titre || '' },
      { header: 'Enseignant', key: 'enseignant', sortValue: (r) => r.enseignant, exportValue: (r) => r.enseignant || '' },
      { header: 'Moyenne', key: 'moyenne', align: 'right', width: 100, exportValue: (r) => (r.moyenne === '-' ? '' : r.moyenne) }
    ]
  }, [])

  if (embedded) {
    return (
      <DataTable
        title="Agrégé par classe"
        subtitle={loading ? 'Chargement…' : null}
        rows={aggregateByClass}
        columns={classAggColumns}
        Button={Button}
        Input={Input}
        Select={Select}
        initialSortKey="classe"
        initialSortDir="asc"
        defaultPageSize={10}
        exportFileName="tp_by_class_aggregate.csv"
        searchPlaceholder="Recherche (classe, semestre…)"
        getRowSearchText={(r) => `${r.classe || ''} ${r.semestre || ''} ${r.tp_count ?? ''} ${r.moyenne_globale || ''}`}
      />
    )
  }

  return (
    <div className="card">
      <div className="card__header">TP (par classe)</div>
      <div className="card__body grid">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">{loading ? 'Chargement…' : `TP: ${rows.length}`}</div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, flex: '1 1 auto' }}>
            <div style={{ width: 170 }}>
              <Select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="classes">Agrégé classes</option>
                <option value="details">Détails</option>
              </Select>
            </div>
            <div style={{ width: 210 }}>
              <Select value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
                <option value="">-- semestre --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ width: 220 }}>
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">-- classe --</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="button" onClick={refreshAll} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </div>

        {viewMode === 'classes' ? (
          <DataTable
            title="Agrégé par classe"
            subtitle={loading ? 'Chargement…' : null}
            rows={aggregateByClass}
            columns={classAggColumns}
            Button={Button}
            Input={Input}
            Select={Select}
            initialSortKey="classe"
            initialSortDir="asc"
            defaultPageSize={10}
            exportFileName="tp_by_class_aggregate.csv"
            searchPlaceholder="Recherche (classe, semestre…)"
            getRowSearchText={(r) => `${r.classe || ''} ${r.semestre || ''} ${r.tp_count ?? ''} ${r.moyenne_globale || ''}`}
          />
        ) : (
          <DataTable
            title="Détails"
            subtitle={loading ? 'Chargement…' : null}
            rows={rows}
            columns={columns}
            Button={Button}
            Input={Input}
            Select={Select}
            initialSortKey="id"
            initialSortDir="desc"
            defaultPageSize={10}
            exportFileName="tp_by_class.csv"
            searchPlaceholder="Recherche (classe, matière, titre…)"
            getRowSearchText={(r) => `${r.id} ${r.classe || ''} ${r.matiere || ''} ${r.titre || ''} ${r.enseignant || ''} ${r.semestre || ''}`}
          />
        )}
      </div>
    </div>
  )
}
