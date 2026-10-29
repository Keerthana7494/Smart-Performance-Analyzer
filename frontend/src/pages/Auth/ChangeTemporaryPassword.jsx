import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changeTemporaryPassword } from '../../services/authServices'
import { logoutUser } from '../../services/session'

export default function ChangeTemporaryPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (form.newPassword.length < 12) {
      setError('Choose a password with at least 12 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const result = await changeTemporaryPassword(form)
      setMessage(result.message || 'Password changed. Please log in again.')
      logoutUser()
      window.setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to change password. The temporary password may have expired.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '5rem auto', padding: 24 }}>
      <h1>Set your new password</h1>
      <p>Your administrator created a temporary password. Choose a new password before continuing.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <label>New password
          <input type="password" autoComplete="new-password" minLength={12} required value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })} style={{ display: 'block', width: '100%', padding: 10 }} />
        </label>
        <label>Confirm new password
          <input type="password" autoComplete="new-password" minLength={12} required value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={{ display: 'block', width: '100%', padding: 10 }} />
        </label>
        {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
        {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}
        <button disabled={busy} type="submit">{busy ? 'Updating…' : 'Set password'}</button>
      </form>
    </main>
  )
}
