```jsx
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

        <div style={s.leftSection}>

          {/* BRAND */}
          <div style={s.brand}>
            <img
              src="https://okiedokie-erp-images.s3.ap-south-1.amazonaws.com/IECC/2026/02/sourceURL/9b06df36955608e5de50-WhatsApp%20Image%202026-02-24%20at%2010.46.49%20AM.jpeg"
              alt="IEC Logo"
              style={s.logo}
            />

            <div>
              <div style={s.brandName}>
                DMC Issue Tracker
              </div>

              <div style={s.brandSub}>
                IEC College • Okie Dokie Solutions
              </div>
            </div>
          </div>

          <div style={s.divider}></div>

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

          <div style={s.userBadge}>
            {session.user.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={s.userEmail}>
              {session.user.email}
            </div>

            <div style={s.userRole}>
              Staff
            </div>
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
    background: '#F7F6F3',
    fontFamily: 'Inter, sans-serif',
  },

  topbar: {
    background: '#ffffff',
    borderBottom: '1px solid #ECE8E1',
    padding: '0 36px',
    height: 78,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  },

  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },

  logo: {
    width: 52,
    height: 52,
    objectFit: 'cover',
    borderRadius: 12,
    background: '#fff',
    border: '1px solid #ECE8E1',
  },

  brandName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#181818',
    letterSpacing: '-0.5px',
  },

  brandSub: {
    fontSize: 13,
    color: '#7D7B76',
    marginTop: 2,
  },

  divider: {
    width: 1,
    height: 38,
    background: '#E7E2DA',
  },

  navRow: {
    display: 'flex',
    gap: 10,
  },

  navBtn: {
    fontSize: 14,
    color: '#5E5B55',
    background: 'transparent',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 500,
    transition: '0.2s',
  },

  navActive: {
    background: '#FFF1EA',
    color: '#D85B2B',
    fontWeight: 600,
  },

  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },

  userBadge: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: '#E05A2B',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
  },

  userEmail: {
    fontSize: 13,
    fontWeight: 600,
    color: '#222',
  },

  userRole: {
    fontSize: 11,
    color: '#8A8882',
  },

  logoutBtn: {
    background: '#fff',
    border: '1px solid #F2C7B8',
    color: '#E05A2B',
    padding: '10px 16px',
    borderRadius: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.2s',
  },

  content: {
    padding: 32,
    maxWidth: 1200,
    margin: '0 auto',
  },
}
```
