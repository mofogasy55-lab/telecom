import React, { useEffect, useMemo, useState } from 'react'

function defaultRowKey(row, idx) {
  return row?.id ?? idx
}

function toText(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

function compareValues(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1

  if (typeof a === 'number' && typeof b === 'number') return a - b

  const as = String(a)
  const bs = String(b)
  return as.localeCompare(bs, undefined, { numeric: true, sensitivity: 'base' })
}

function toCsvCell(v) {
  const s = toText(v)
  if (/[\n",]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadCsv(filename, headerRow, rows) {
  const csv = [headerRow.map(toCsvCell).join(','), ...rows.map((r) => r.map(toCsvCell).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function DataTable({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  Button,
  Input,
  Select,
  searchPlaceholder = 'Recherche…',
  initialSortKey = null,
  initialSortDir = 'asc',
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  quickFilters = [],
  defaultQuickFilterKey = 'all',
  getRowSearchText,
  actions,
  toolbarContent,
  exportFileName = 'export.csv'
}) {
  const Btn = Button || ((props) => <button {...props} />)
  const Inp = Input || ((props) => <input {...props} />)
  const Sel =
    Select ||
    ((props) => (
      <select {...props} className={`input ${props.className || ''}`.trim()}>
        {props.children}
      </select>
    ))

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(initialSortKey)
  const [sortDir, setSortDir] = useState(initialSortDir)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [activeFilterKey, setActiveFilterKey] = useState(defaultQuickFilterKey)

  useEffect(() => {
    setPage(1)
  }, [query, pageSize, activeFilterKey, sortKey, sortDir])

  const normalizedFilters = useMemo(() => {
    const hasAll = quickFilters.some((f) => f.key === 'all')
    const base = hasAll ? quickFilters : [{ key: 'all', label: 'Tout', predicate: () => true }, ...quickFilters]
    return base
  }, [quickFilters])

  const activePredicate = useMemo(() => {
    const f = normalizedFilters.find((x) => x.key === activeFilterKey)
    return f?.predicate || (() => true)
  }, [normalizedFilters, activeFilterKey])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows || []).filter((r) => {
      if (!activePredicate(r)) return false
      if (!q) return true
      const hay = getRowSearchText
        ? String(getRowSearchText(r) || '')
        : columns
            .map((c) => {
              if (typeof c.exportValue === 'function') return c.exportValue(r)
              if (typeof c.value === 'function') return c.value(r)
              if (c.key) return r?.[c.key]
              return ''
            })
            .join(' ')
      return String(hay).toLowerCase().includes(q)
    })
  }, [rows, query, columns, getRowSearchText, activePredicate])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    const getV = (r) => {
      if (!col) return r?.[sortKey]
      if (typeof col.sortValue === 'function') return col.sortValue(r)
      if (typeof col.value === 'function') return col.value(r)
      if (col.key) return r?.[col.key]
      return ''
    }
    const dir = sortDir === 'desc' ? -1 : 1
    const withIndex = filtered.map((r, i) => ({ r, i }))
    withIndex.sort((a, b) => {
      const cmp = compareValues(getV(a.r), getV(b.r))
      if (cmp !== 0) return cmp * dir
      return a.i - b.i
    })
    return withIndex.map((x) => x.r)
  }, [filtered, sortKey, sortDir, columns])

  const total = rows?.length || 0
  const shown = sorted.length

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(shown / pageSize))
  }, [shown, pageSize])

  const safePage = Math.min(Math.max(1, page), pageCount)

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, safePage, pageSize])

  function toggleSort(nextKey) {
    if (!nextKey) return
    if (sortKey !== nextKey) {
      setSortKey(nextKey)
      setSortDir('asc')
      return
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  function exportCsv() {
    const header = columns.map((c) => c.header || c.key || '')
    const data = sorted.map((r) =>
      columns.map((c) => {
        if (typeof c.exportValue === 'function') return c.exportValue(r)
        if (typeof c.render === 'function') {
          if (typeof c.value === 'function') return c.value(r)
          if (c.key) return r?.[c.key]
          return ''
        }
        if (typeof c.value === 'function') return c.value(r)
        if (c.key) return r?.[c.key]
        return ''
      })
    )
    downloadCsv(exportFileName, header, data)
  }

  const rk = rowKey || defaultRowKey

  return (
    <div className="grid">
      {(title || subtitle) && (
        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'grid', gap: 4 }}>
            {title ? <div style={{ fontWeight: 800 }}>{title}</div> : null}
            {subtitle ? <div className="label" style={{ margin: 0 }}>
              {subtitle}
            </div> : null}
          </div>
          {actions ? <div className="row" style={{ justifyContent: 'flex-end' }}>{actions}</div> : null}
        </div>
      )}

      <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <div className="badge">
          Total: {total} • Affichés: {shown} • Page: {safePage}/{pageCount}
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
          {normalizedFilters.length > 1 ? (
            <div className="row" style={{ gap: 8 }}>
              {normalizedFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`pill ${activeFilterKey === f.key ? 'pill--active' : ''}`}
                  onClick={() => setActiveFilterKey(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : null}

          {toolbarContent ? <div className="row" style={{ gap: 8 }}>{toolbarContent}</div> : null}

          <div style={{ minWidth: 260, flex: '0 0 auto' }}>
            <Inp value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} />
          </div>

          <Btn type="button" onClick={exportCsv} disabled={shown === 0}>
            Export CSV
          </Btn>
        </div>
      </div>

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => {
                const sortable = !!c.key
                const isActive = sortable && sortKey === c.key
                const icon = isActive ? (sortDir === 'asc' ? '▲' : '▼') : '↕'
                return (
                  <th
                    key={c.key || c.header}
                    style={{ width: c.width, textAlign: c.align || 'left', cursor: sortable ? 'pointer' : 'default' }}
                    className={sortable ? 'th--sortable' : ''}
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span>{c.header}</span>
                      {sortable ? <span className="th__sort">{icon}</span> : null}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paged.map((r, idx) => (
              <tr key={rk(r, idx)}>
                {columns.map((c) => (
                  <td key={c.key || c.header} style={{ textAlign: c.align || 'left' }}>
                    {typeof c.render === 'function' ? c.render(r) : c.key ? toText(r?.[c.key]) : ''}
                  </td>
                ))}
              </tr>
            ))}

            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="label" style={{ padding: 16 }}>
                  Aucun élément.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="label" style={{ margin: 0 }}>
            Lignes/page
          </span>
          <div style={{ width: 110 }}>
            <Sel value={String(pageSize)} onChange={(e) => setPageSize(Number(e.target.value))}>
              {pageSizeOptions.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </Sel>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Btn type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
            Précédent
          </Btn>
          <span className="badge">{safePage}/{pageCount}</span>
          <Btn type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage >= pageCount}>
            Suivant
          </Btn>
        </div>
      </div>
    </div>
  )
}
