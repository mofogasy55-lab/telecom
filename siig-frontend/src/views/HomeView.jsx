 import React, { useMemo, useState } from 'react'

export default function HomeView({ user, roleLabel, actions, onNavigate, Button }) {
  const [openKey, setOpenKey] = useState(null)

  const sections = useMemo(() => {
    return [
      {
        key: 'espa',
        title: "ESPA Vontovorona (Université d’Antananarivo)",
        summary:
          "L’École Supérieure Polytechnique d’Antananarivo (ESPA) est rattachée à l’Université d’Antananarivo et située au campus de Vontovorona.",
        details: [
          "L’ESPA délivre des diplômes de niveau Licence (Bacc+3) et Master/Ingénieur (jusqu’à Bacc+5).",
          "Le pôle ‘Sciences et Technologies Industrielles’ inclut notamment la mention Télécommunication (TCO)."
        ],
        links: [
          { label: "Wikipédia (ESPA)", href: "https://fr.wikipedia.org/wiki/%C3%89cole_sup%C3%A9rieure_polytechnique_d'Antananarivo" }
        ]
      },
      {
        key: 'telecom',
        title: 'Mention Télécommunications (TCO) : domaines',
        summary:
          "La mention Télécommunication est orientée vers les systèmes de communication et réseaux (numérique, radio, transmission, etc.).",
        details: [
          'Bases scientifiques : mathématiques et systèmes physiques.',
          'Communications numériques et radio mobiles.',
          'Électronique analogique et numérique appliquée aux télécoms.',
          'Signal, codage, informatique appliquée (selon les modules).'
        ],
        links: [
          {
            label: "Article (Digigasy)",
            href: 'https://digigasy.com/2019/01/10/espa-lecole-pour-les-futurs-ingenieurs-en-sciences-et-technologie-industrielles/'
          }
        ]
      },
      {
        key: 'levels',
        title: 'Parcours & niveaux (guide pratique)',
        summary:
          "Selon ton niveau, tu vas progressivement passer des bases (math/physique, électronique) vers les réseaux, la radio, la transmission et les projets.",
        details: [
          "Cycle Licence : renforcement des fondamentaux + premières matières techniques (signal/électronique/numérique).",
          "Cycle Master/Ingénieur : spécialisation (réseaux, radio, transmission) + projets/TP/études de cas.",
          "Le détail exact dépend des UE/EC planifiés par semestre dans SIIG."
        ],
        links: []
      },
      {
        key: 'jobs',
        title: 'Débouchés (orientations possibles)',
        summary:
          "Après la mention Télécom, tu peux viser des métiers techniques (réseaux, radio, transmission) ou des rôles d’exploitation/ingénierie chez des opérateurs et intégrateurs.",
        details: [
          'Ingénieur/technicien réseaux & systèmes (LAN/WAN, routing, switching).',
          'Ingénierie radio (cellulaire, faisceaux hertziens, optimisation).',
          'Transmission & fibre optique (déploiement, tests, maintenance).',
          'Support/exploitation NOC, supervision, qualité de service (QoS).',
          'Administration systèmes, sécurité réseau (selon spécialisation).'
        ],
        links: []
      }
    ]
  }, [])

  const active = sections.find((s) => s.key === openKey) || null

  function closeModal() {
    setOpenKey(null)
  }

  return (
    <div className="card">
      <div className="card__header">Accueil</div>
      <div className="card__body">
        <div className="grid">
          <div className="badge">Connecté en tant que: {roleLabel(user.role)}</div>

          <div className="label">
            Guide ESPA Vontovorona — Mention Télécommunication (TCO). Clique sur les sections pour lire des explications plus détaillées.
          </div>

          <div className="homeGuide__grid">
            {sections.map((s) => (
              <div key={s.key} className="homeGuide__card">
                <div className="homeGuide__title">{s.title}</div>
                <div className="homeGuide__summary">{s.summary}</div>
                <div className="homeGuide__actions">
                  <Button variant="primary" onClick={() => setOpenKey(s.key)}>
                    En savoir plus
                  </Button>
                  {s.links?.length
                    ? s.links.map((l) => (
                        <a key={l.href} className="homeGuide__link" href={l.href} target="_blank" rel="noreferrer">
                          {l.label}
                        </a>
                      ))
                    : null}
                </div>
              </div>
            ))}
          </div>

          <div className="homeGuide__footer">
            <div className="label">Accès rapide: utilise le menu à gauche pour ouvrir les modules SIIG (UE/EC, emplois du temps, cours, notes, etc.).</div>
            {actions?.length ? (
              <div className="row">
                <Button variant="default" onClick={() => onNavigate(actions[0].view)}>
                  Ouvrir un module
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {active ? (
        <div className="homeModal" role="dialog" aria-modal="true" aria-label={active.title}>
          <div className="homeModal__overlay" onClick={closeModal} />
          <div className="homeModal__panel">
            <div className="homeModal__header">
              <div className="homeModal__title">{active.title}</div>
              <button type="button" className="homeModal__close" onClick={closeModal} aria-label="Fermer">
                ✕
              </button>
            </div>
            <div className="homeModal__body">
              <div className="homeModal__text">{active.summary}</div>
              <div className="homeModal__list">
                {active.details.map((t, i) => (
                  <div key={String(i)} className="homeModal__item">
                    {t}
                  </div>
                ))}
              </div>

              {active.links?.length ? (
                <div className="homeModal__links">
                  {active.links.map((l) => (
                    <a key={l.href} className="homeGuide__link" href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="homeModal__footer">
              <Button variant="primary" onClick={closeModal}>
                Compris
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
