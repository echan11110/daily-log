import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginScreen() {
  const { signInWithPassphrase } = useAuth()
  const [passphrase, setPassphrase] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!passphrase.trim()) return
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithPassphrase(passphrase.trim())
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="app-bg login-bg">
      <div className="login-card">
        <h1 className="app-title login-title">DAILY LOG</h1>
        <p className="login-subtitle">Enter a passphrase to sync across all your devices</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            type="password"
            placeholder="your passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoComplete="current-password"
            autoFocus
          />
          <button className="login-btn" type="submit" disabled={loading || !passphrase.trim()}>
            {loading ? 'Connecting…' : 'Sync & Continue'}
          </button>
        </form>

        <p className="login-hint-text">
          Use the same passphrase on every device. Not tied to any email — just don't forget it.
        </p>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}
