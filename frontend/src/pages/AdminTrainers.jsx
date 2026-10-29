import { useState } from 'react'
import { createTrainer } from '../services/authServices'
import { getCurrentUser } from '../services/session'

export default function AdminTrainers() {
  const user = getCurrentUser()
  const [form, setForm] = useState({ fullName: '', email: '' })
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user?.role !== 'ADMIN') {
    return <section style={{ padding: 24 }}><h2>Access denied</h2><p>Only an administrator can create trainer accounts.</p></section>
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setCreated(null)
    setBusy(true)
    try {
      setCreated(await createTrainer(form))
      setForm({ fullName: '', email: '' })
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create trainer.')
    } finally {
      setBusy(false)
    }
  }

  const copyPassword = async () => {
    if (created?.temporaryPassword) await navigator.clipboard.writeText(created.temporaryPassword)
  }

  return (
    <section style={{ maxWidth: 720, padding: 24 }}>
      <h2>Create trainer account</h2>
      <p>The backend generates a temporary password that expires in 24 hours. It is shown only in this response.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
        <label>Full name
          <input required minLength={3} maxLength={100} value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })} style={{ display: 'block', width: '100%', padding: 10 }} />
        </label>
        <label>Email / login ID
          <input required type="email" maxLength={150} value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} style={{ display: 'block', width: '100%', padding: 10 }} />
        </label>
        <button disabled={busy} type="submit">{busy ? 'Creating…' : 'Create trainer'}</button>
      </form>
      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
      {created && <div role="status" style={{ marginTop: 24, padding: 16, border: '1px solid #15803d', borderRadius: 8 }}>
        <h3>Trainer created</h3>
        <p>{created.fullName} ({created.email})</p>
        <p><strong>Temporary password (shown once):</strong></p>
        <code style={{ overflowWrap: 'anywhere' }}>{created.temporaryPassword}</code>
        <p>Expires at: {created.expiresAt}</p>
        <button type="button" onClick={copyPassword}>Copy temporary password</button>
        <p>Share it privately. Do not save it in screenshots, logs, or group chats.</p>
      </div>}
    </section>
  )
}

