import React from 'react'

export default function HomeView({ user, roleLabel, actions, onNavigate, Button }) {
  return (
    <div className="card">
      <div className="card__header">Accueil</div>
      <div className="card__body">
        <div className="grid">
          <div className="badge">Connecté en tant que: {roleLabel(user.role)}</div>

          <div className="label">
            Bienvenue sur la plateforme SIIG (Mention Télécommunication) — accès et fonctionnalités selon privilèges.
          </div>

          <div className="row">
            {actions.slice(0, 6).map((a, idx) => (
              <Button key={a.view} variant={idx === 0 ? 'primary' : 'default'} onClick={() => onNavigate(a.view)}>
                {a.label}
              </Button>
            ))}
          </div>

          {actions.length > 6 ? (
            <div className="label">Utilise le menu à gauche pour accéder à tous les modules disponibles.</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
