import React from 'react'

export default function ModuleView({ title, view }) {
  return (
    <div className="card">
      <div className="card__header">{title}</div>
      <div className="card__body">
        <div className="label">{view} — squelette prêt. Prochaine étape: ajouter les tables + endpoints API + écrans CRUD.</div>
      </div>
    </div>
  )
}
