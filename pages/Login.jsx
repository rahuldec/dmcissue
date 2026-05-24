import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login(e) {

    e.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div style={s.page}>

      {/* BACKGROUND BLUR */}
      <div style={s.blur1}></div>
      <div style={s.blur2}></div>

      {/* LOGIN CARD */}
      <div style={s.card}>

        {/* LOGO */}
        <div style={s.logoWrap}>

          <div style={s.logoCircle}>
            <img
              src="https://okiedokie-erp-images.s3.ap-south-1.amazonaws.com/Okie%20Dokie/2025/12/sourceURL/26aebcbe10f4ac5a3e8b-611ed1b9032568edd4f3-Okie_Dokie_App_icon__2___2_-removebg-preview.png"
              alt="Logo"
              style={s.logo}
            />
          </div>

        </div>

        {/* BRAND */}
        <div style={s.brand}>
          <h1 style={s.title}>
            DMC Issue Tracker
          </h1>

          <p style={s.subtitle}>
            Secure student DMC management system
          </p>
        </div>

        {/* FORM */}
        <form style={s.form} onSubmit={login}>

          <div style={s.inputGroup}>

            <label style={s.label}>
              Email Address
            </label>

            <input
              style={s.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

          </div>

          <div style={s.inputGroup}>

            <label style={s.label}>
              Password
            </label>

            <input
              style={s.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

          </div>

          {error && (
            <div style={s.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={s.button}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* FOOTER */}
        <div style={s.footer}>
          Powered by Okie Dokie Solutions
        </div>

      </div>

    </div>
  )
}

const s = {

  page: {
    minHeight: '100vh',
    background: '#F5F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
    padding: 20
  },

  blur1: {
    position: 'absolute',
    width: 400,
    height: 400,
    background: '#FF7A45',
    opacity: 0.08,
    filter: 'blur(120px)',
    borderRadius: '50%',
    top: -100,
    left: -100
  },

  blur2: {
    position: 'absolute',
    width: 350,
    height: 350,
    background: '#0A84FF',
    opacity: 0.06,
    filter: 'blur(120px)',
    borderRadius: '50%',
    bottom: -100,
    right: -100
  },

  card: {
    width: '100%',
    maxWidth: 440,
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: 34,
    padding: '42px 36px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    position: 'relative',
    zIndex: 10
  },

  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 24
  },

  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 28,
    background: 'linear-gradient(135deg,#ffffff,#f3f3f3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
  },

  logo: {
    width: 64,
    height: 64,
    objectFit: 'contain'
  },

  brand: {
    textAlign: 'center',
    marginBottom: 34
  },

  title: {
    fontSize: 36,
    fontWeight: 700,
    color: '#111111',
    marginBottom: 10,
    letterSpacing: '-1.2px'
  },

  subtitle: {
    fontSize: 15,
    color: '#6E6E73',
    lineHeight: 1.5
  },

  form: {
    display: 'grid',
    gap: 22
  },

  inputGroup: {
    display: 'grid',
    gap: 8
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#3C3C43'
  },

  input: {
    height: 56,
    borderRadius: 18,
    border: '1px solid #E5E5EA',
    background: 'rgba(255,255,255,0.85)',
    padding: '0 18px',
    fontSize: 15,
    color: '#111',
    outline: 'none',
    transition: '0.2s ease',
    boxSizing: 'border-box'
  },

  button: {
    height: 58,
    borderRadius: 18,
    border: 'none',
    background: 'linear-gradient(135deg,#FF7A45,#E05A2B)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    boxShadow: '0 10px 30px rgba(224,90,43,0.28)'
  },

  error: {
    background: '#FFECEC',
    color: '#C62828',
    padding: '14px 16px',
    borderRadius: 14,
    fontSize: 13,
    border: '1px solid #FFD5D5'
  },

  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93'
  }

}