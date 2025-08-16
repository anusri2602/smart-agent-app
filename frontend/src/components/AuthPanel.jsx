
import { useState } from 'react'
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'

export default function AuthPanel() {
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signInEmailPassword, isLoading: inLoading, error: inErr } = useSignInEmailPassword()
  const { signUpEmailPassword, isLoading: upLoading, error: upErr } = useSignUpEmailPassword()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'in') {
      await signInEmailPassword(email, password)
    } else {
      await signUpEmailPassword(email, password)
    }
  }

  return (
    <div style={{maxWidth: 420, margin: '64px auto', padding: 24, border:'1px solid #eee', borderRadius: 12}}>
      <h2 style={{marginTop:0}}>{mode === 'in' ? 'Sign In' : 'Sign Up'}</h2>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={inLoading || upLoading}>
          {mode === 'in' ? 'Sign In' : 'Create Account'}
        </button>
        {(inErr || upErr) ? <div style={{color:'crimson'}}>{inErr?.message || upErr?.message}</div> : null}
      </form>
      <div style={{marginTop:12}}>
        {mode === 'in' ? (
          <span>New here? <button onClick={() => setMode('up')}>Sign Up</button></span>
        ) : (
          <span>Already have an account? <button onClick={() => setMode('in')}>Sign In</button></span>
        )}
      </div>
    </div>
  )
}
