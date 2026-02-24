import React, { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../api.js'

export default function InboxView({ user, role, Button, Input, Select, onError }) {
  const [tab, setTab] = useState('inbox')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  const [sendType, setSendType] = useState('direct')
  const [teacherId, setTeacherId] = useState('')
  const [teachers, setTeachers] = useState([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const canAdmin = role === 'admin'

  const visibleItems = useMemo(() => {
    const base = Array.isArray(items) ? items : []
    if (tab === 'pending') return base.filter((m) => m && m.status === 'pending')
    if (tab === 'public') return base.filter((m) => m && m.type === 'public' && m.status === 'approved')
    return base
  }, [items, tab])

  async function loadTeachersIfNeeded() {
    try {
      const res = await apiGet('/api/teachers')
      setTeachers(Array.isArray(res?.items) ? res.items : [])
    } catch {
      setTeachers([])
    }
  }

  async function refresh() {
    setLoading(true)
    try {
      const res = await apiGet('/api/messages/inbox')
      setItems(Array.isArray(res?.items) ? res.items : [])
    } catch (err) {
      // Backend pas encore prêt: on ne casse pas l'UI
      setItems([])
      onError?.(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    if (sendType === 'direct') void loadTeachersIfNeeded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (sendType === 'direct') void loadTeachersIfNeeded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendType])

  async function onSend(e) {
    e.preventDefault()
    onError?.(null)

    const payload = {
      type: sendType === 'public' ? 'public' : 'direct',
      to_teacher_id: sendType === 'direct' ? Number(teacherId || 0) || null : null,
      subject: subject.trim() || null,
      body: body.trim() || null
    }

    if (!payload.body) return
    if (payload.type === 'direct' && !payload.to_teacher_id) return

    setSending(true)
    try {
      await apiPost('/api/messages', payload)
      setSubject('')
      setBody('')
      setTeacherId('')
      await refresh()
    } catch (err) {
      const raw = err?.data?.error || err?.message || 'Erreur'
      onError?.(raw)
    } finally {
      setSending(false)
    }
  }

  async function onApprove(id) {
    onError?.(null)
    try {
      await apiPost(`/api/messages/${id}/approve`, {})
      await refresh()
    } catch (err) {
      const raw = err?.data?.error || err?.message || 'Erreur'
      onError?.(raw)
    }
  }

  async function onMarkRead(id) {
    onError?.(null)
    try {
      await apiPost(`/api/messages/${id}/read`, {})
      await refresh()
    } catch {
      // ignore
    }
  }

  return (
    <div className="card">
      <div className="card__header">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800 }}>Boîte à lettres</div>
          <div className="row">
            <Button type="button" variant={tab === 'inbox' ? 'primary' : 'default'} onClick={() => setTab('inbox')}>
              Messages
            </Button>
            {canAdmin ? (
              <Button type="button" variant={tab === 'pending' ? 'primary' : 'default'} onClick={() => setTab('pending')}>
                À valider
              </Button>
            ) : null}
            <Button type="button" variant={tab === 'public' ? 'primary' : 'default'} onClick={() => setTab('public')}>
              Public
            </Button>
          </div>
        </div>
      </div>

      <div className="card__body grid" style={{ gridTemplateColumns: '1.05fr 0.95fr', gap: 12 }}>
        <div className="panel" style={{ padding: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="badge">
              {loading ? 'Chargement…' : `${visibleItems.length} message(s)`}
            </div>
            <Button type="button" onClick={refresh}>
              Rafraîchir
            </Button>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {visibleItems.length === 0 ? (
              <div className="label">Aucun message.</div>
            ) : (
              visibleItems.map((m) => (
                <div key={m.id} className="card" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="card__body" style={{ display: 'grid', gap: 6 }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800 }}>{m.subject || '(Sans objet)'}</div>
                      <div className="badge">{m.status || '-'}</div>
                    </div>
                    <div className="label" style={{ opacity: 0.92, whiteSpace: 'pre-wrap' }}>{m.body || ''}</div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <div className="label">
                        {m.type === 'public' ? 'Anonyme (public)' : 'Direct'} • {String(m.created_at || '').slice(0, 19).replace('T', ' ')}
                      </div>
                      <div className="row">
                        {canAdmin && m.type === 'public' && m.status === 'pending' ? (
                          <Button type="button" variant="primary" onClick={() => onApprove(m.id)}>
                            Admettre
                          </Button>
                        ) : null}
                        {m.is_read ? null : (
                          <Button type="button" onClick={() => onMarkRead(m.id)}>
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Envoyer un message</div>
          <form className="grid" onSubmit={onSend}>
            <div>
              <div className="label">Type</div>
              <Select value={sendType} onChange={(e) => setSendType(e.target.value)}>
                <option value="direct">Message à un prof</option>
                <option value="public">Boîte anonyme (public après admission admin)</option>
              </Select>
            </div>

            {sendType === 'direct' ? (
              <div>
                <div className="label">Professeur</div>
                <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {(t.first_name || '') + ' ' + (t.last_name || '')}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <div>
              <div className="label">Objet</div>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet (optionnel)" />
            </div>

            <div>
              <div className="label">Message</div>
              <textarea
                className="input"
                style={{ minHeight: 140, resize: 'vertical' }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Écris ton message ici…"
              />
            </div>

            <Button type="submit" variant="primary" disabled={sending || !body.trim() || (sendType === 'direct' && !teacherId)}>
              {sending ? 'Envoi…' : 'Envoyer'}
            </Button>

            <div className="label">Connecté: {user?.email || '-'} • Rôle: {role || '-'}</div>
          </form>
        </div>
      </div>
    </div>
  )
}
