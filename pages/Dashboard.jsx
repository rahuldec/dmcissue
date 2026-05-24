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
    { id:'issue', label:'Issue DMC' },
    { id:'records', label:'Records' },
    { id:'import', label:'Import Students' },
  ]

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={s.brand}>
          <div style={s.logoMark}>OD</div>
          <div>
            <div style={s.brandName}>DMC Issue Tracker</div>
            <div style={s.brandSub}>Okie Dokie Solutions</div>
          </div>
        </div>
        <div style={s.navRow}>
          {nav.map(n => (
            <button
              key={n.id}
              style={{ ...s.navBtn, ...(page === n.id ? s.navActive : {}) }}
              onClick={() => setPage(n.id)}
            >
              {n.label}
            </button>
          ))}
        </div>
        <div style={s.userRow}>
          <span style={s.userEmail}>{session.user.email}</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.content}>
        {page === 'issue' && <IssueDMC staffEmail={session.user.email} />}
        {page === 'records' && <Records />}
        {page === 'import' && <ImportStudents />}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#F7F6F3' },
  topbar: { background:'#fff', borderBottom:'0.5px solid #e8e6e0', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20 },
  brand: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  logoMark: { width:34, height:34, background:'#E05A2B', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:600 },
  brandName: { fontSize:14, fontWeight:600, color:'#1a1a18' },
  brandSub: { fontSize:11, color:'#888780' },
  navRow: { display:'flex', gap:4 },
  navBtn: { fontSize:13, color:'#5F5E5A', background:'none', border:'none', padding:'6px 14px', borderRadius:8 },
  navActive: { background:'#FEF0E9', color:'#993C1D', fontWeight:500 },
  userRow: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  userEmail: { fontSize:12, color:'#888780' },
  logoutBtn: { fontSize:12, color:'#E05A2B', background:'none', border:'0.5px solid #F5C4B3', borderRadius:7, padding:'5px 12px', fontWeight:500 },
  content: { padding:32, maxWidth:1100, margin:'0 auto' },
}