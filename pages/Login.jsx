import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoMark}>OD</div>
          <div>
            <div style={s.logoName}>Okie Dokie Solutions</div>
            <div style={s.logoSub}>DMC Issue Tracker</div>
          </div>
        </div>

        <h1 style={s.title}>Staff Login</h1>
        <p style={s.subtitle}>Sign in to issue DMCs to students</p>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F6F3', padding:20 },
  card: { background:'#fff', borderRadius:16, border:'0.5px solid #e8e6e0', padding:'40px 36px', width:'100%', maxWidth:400 },
  logo: { display:'flex', alignItems:'center', gap:12, marginBottom:32 },
  logoMark: { width:40, height:40, background:'#E05A2B', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:600 },
  logoName: { fontSize:15, fontWeight:600, color:'#1a1a18' },
  logoSub: { fontSize:12, color:'#888780' },
  title: { fontSize:22, fontWeight:600, color:'#1a1a18', marginBottom:6 },
  subtitle: { fontSize:13, color:'#888780', marginBottom:28 },
  form: { display:'flex', flexDirection:'column', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:500, color:'#5F5E5A' },
  input: { padding:'10px 14px', borderRadius:9, border:'0.5px solid #e8e6e0', fontSize:14, color:'#1a1a18', outline:'none', background:'#fff' },
  error: { background:'#FCEBEB', color:'#A32D2D', fontSize:12, padding:'8px 12px', borderRadius:8, border:'0.5px solid #F7C1C1' },
  btn: { background:'#E05A2B', color:'#fff', border:'none', borderRadius:9, padding:'11px', fontSize:14, fontWeight:600, marginTop:4 },
}