import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginScreen() {
  const { signInWithEmail } = useAuth()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithEmail(email)
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="app-bg login-bg">
      <div className="login-card">
        <h1 className="app-title login-title">DAILY LOG</h1>

        {!sent ? (
          <>
            <p className="login-subtitle">Sign in to sync across all your devices</p>
            <form onSubmit={handleSubmit} className="login-form">
              <input
                className="login-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send sign-in link'}
              </button>
            </form>
            {error && <p className="login-error">{error}</p>}
          </>
        ) : (
          <div className="login-sent">
            <div className="login-sent-icon">✉</div>
            <p className="login-sent-title">Check your email</p>
            <p className="login-sent-body">
              We sent a sign-in link to <strong>{email}</strong>.<br />
              Click it to open the app — you'll only need to do this once per device.
            </p>
            <button
              className="login-back"
              onClick={() => { setSent(false); setError(null) }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
