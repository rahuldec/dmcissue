import { useState } from 'react'
import { supabase } from '../lib/supabase'
import IssueDMC from './IssueDMC'
import Records from './Records'
import ImportStudents from './ImportStudents'

export default function Dashboard({ session }) {
  const [page, setPage] = useState('issue')

  async function logout() {
    await supabase.auth.signOut()
  }

  const nav = [
    { id: 'issue', label: 'Issue DMC' },
    { id: 'records', label: 'Records' },
    { id: 'import', label: 'Import Students' },
  ]

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.topbar}>

        {/* LEFT SIDE */}
        <div style={s.leftSection}>

          {/* LOGO CARD */}
          <div style={s.logoCard}>
            <img
              src="https://okiedokie-erp-images.s3.ap-south-1.amazonaws.com/IECC/2026/02/sourceURL/9b06df36955608e5de50-WhatsApp%20Image%202026-02-24%20at%2010.46.49%20AM.jpeg"
              alt="IEC Logo"
              style={s.logo}
            />
          </div>

          {/* BRAND TEXT */}
          <div>
            <div style={s.brandName}>
              DMC Issue Tracker
            </div>

            <div style={s.brandSub}>
              IEC College of Engineering & Technology
            </div>
          </div>

          {/* NAVIGATION */}
          <div style={s.navRow}>
            {nav.map((n) => (
              <button
                key={n.id}
                style={{
                  ...s.navBtn,
                  ...(page === n.id ? s.navActive : {}),
                }}
                onClick={() => setPage(n.id)}
              >
                {n.label}
              </button>
            ))}
          </div>

        </div>

        {/* USER SECTION */}
        <div style={s.userRow}>

          <div style={s.userInfo}>
            <div style={s.userEmail}>
              {session.user.email}
            </div>

            <div style={s.userRole}>
              Staff Panel
            </div>
          </div>

          <div style={s.userBadge}>
            {session.user.email?.charAt(0).toUpperCase()}
          </div>

          <button
            style={s.logoutBtn}
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* PAGE CONTENT */}
      <div style={s.content}>

        {page === 'issue' && (
          <IssueDMC staffEmail={session.user.email} />
        )}

        {page === 'records' && (
          <Records />
        )}

        {page === 'import' && (
          <ImportStudents />
        )}

      </div>

    </div>
  )
}

const s = {

  page: {
    minHeight: '100vh',
    background: '#F7F8FA',
    fontFamily: 'Inter, sans-serif',
  },

  topbar: {
    background: '#ffffff',
    borderBottom: '1px solid #ECECEC',
    padding: '0 42px',
    height: 88,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
  },

  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },

  logoCard: {
    width: 68,
    height: 68,
    background: '#fff',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    border: '1px solid #EFEFEF',
    overflow: 'hidden',
  },

  logo: {
    width: 58,
    height: 58,
    objectFit: 'contain',
  },

  brandName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#151515',
    lineHeight: 1,
    letterSpacing: '-1px',
  },

  brandSub: {
    fontSize: 13,
    color: '#7B7B7B',
    marginTop: 6,
  },

  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginLeft: 36,
  },

  navBtn: {
    border: 'none',
    background: 'transparent',
    color: '#5B5B5B',
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 18px',
    borderRadius: 14,
    cursor: 'pointer',
    transition: '0.2s ease',
  },

  navActive: {
    background: '#FFF1EA',
    color: '#E05A2B',
  },

  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },

  userInfo: {
    textAlign: 'right',
  },

  userEmail: {
    fontSize: 13,
    fontWeight: 700,
    color: '#222',
  },

  userRole: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },

  userBadge: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E05A2B, #FF8B5C)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
    boxShadow: '0 6px 14px rgba(224,90,43,0.25)',
  },

  logoutBtn: {
    background: '#fff',
    border: '1px solid #FFD7C7',
    color: '#E05A2B',
    padding: '11px 18px',
    borderRadius: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },

  content: {
    padding: 36,
    maxWidth: 1300,
    margin: '0 auto',
  },
}