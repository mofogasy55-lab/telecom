import React from 'react'
import { getNavItemsForRole } from '../modules.js'

function shortLabel(label) {
  const raw = String(label || '').trim()
  if (!raw) return '?'
  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

export default function Sidebar({ role, currentView, onNavigate, collapsed = false, onToggleCollapsed }) {
  const items = getNavItemsForRole(role)

  return (
    <div className={`nav ${collapsed ? 'nav--collapsed' : ''}`.trim()}>
      <button className="nav__collapseBtn" type="button" onClick={onToggleCollapsed} title={collapsed ? 'Développer' : 'Réduire'}>
        {collapsed ? '»' : '«'}
      </button>

      {items.map((item) => (
        <button
          key={item.view}
          className={`nav__item ${currentView === item.view ? 'nav__item--active' : ''}`}
          onClick={() => onNavigate(item.view)}
          title={item.label}
        >
          {collapsed ? <span className="nav__abbr">{shortLabel(item.label)}</span> : item.label}
        </button>
      ))}
    </div>
  )
}
