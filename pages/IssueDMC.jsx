import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function IssueDMC({ staffEmail }) {
  const [colleges, setColleges] = useState([])
  const [selectedCollege, setSelectedCollege] = useState('')
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [issuing, setIssuing] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase.from('students').select('college').then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map(d => d.college))].filter(Boolean).sort()
        setColleges(unique)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedCollege) { setStudents([]); return }
    setLoading(true)
    let q = supabase.from('students').select('*').eq('college', selectedCollege).order('name')
    if (search.trim()) q = q.or(`name.ilike.%${search}%,roll_number.ilike.%${search}%`)
    q.then(({ data }) => { setStudents(data || []); setLoading(false) })
  }, [selectedCollege, search])

  async function issueDMC(student) {
    if (student.dmc_issued) return
    setIssuing(student.id)
    const { error } = await supabase.from('students').update({
      dmc_issued: true,
      issued_at: new Date().toISOString(),
      issued_by: staffEmail
    }).eq('id', student.id)

    if (!error) {
      setStudents(prev => prev.map(s => s.id === student.id
        ? { ...s, dmc_issued: true, issued_at: new Date().toISOString(), issued_by: staffEmail }
        : s))
      await supabase.from('dmc_records').insert({
        student_id: student.id,
        student_name: student.name,
        roll_number: student.roll_number,
        college: student.college,
        course: student.course,
        semester: student.semester,
        issued_by: staffEmail,
        issued_at: new Date().toISOString()
      })
      showToast(`DMC issued to ${student.name}`)
    }
    setIssuing(null)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const issued = students.filter(s => s.dmc_issued).length
  const pending = students.filter(s => !s.dmc_issued).length

  return (
    <div>
      {toast && <div style={s.toast}>{toast} ✓</div>}

      <div style={s.header}>
        <h1 style={s.title}>Issue DMC</h1>
        <p style={s.sub}>College select karo, student search karo, DMC issue karo</p>
      </div>

      <div style={s.filterRow}>
        <select style={s.select} value={selectedCollege} onChange={e => { setSelectedCollege(e.target.value); setSearch('') }}>
          <option value="">-- College select karo --</option>
          {colleges.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          style={s.searchInput}
          placeholder="Naam ya Roll Number se search karo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={!selectedCollege}
        />
      </div>

      {selectedCollege && (
        <div style={s.statsRow}>
          <div style={s.statChip}><span style={{ color:'#E05A2B', fontWeight:600 }}>{issued}</span> Issued</div>
          <div style={s.statChip}><span style={{ color:'#185FA5', fontWeight:600 }}>{pending}</span> Pending</div>
          <div style={s.statChip}><span style={{ fontWeight:600 }}>{students.length}</span> Total</div>
        </div>
      )}

      {loading && <div style={s.loading}>Loading students…</div>}

      {!loading && students.length > 0 && (
        <div style={s.table}>
          <div style={s.thead}>
            <div style={{ ...s.th, flex:2 }}>Student Name</div>
            <div style={s.th}>Roll Number</div>
            <div style={s.th}>Course</div>
            <div style={s.th}>Semester</div>
            <div style={{ ...s.th, textAlign:'center' }}>DMC Status</div>
          </div>
          {students.map(student => (
            <div key={student.id} style={{ ...s.trow, ...(student.dmc_issued ? s.trowIssued : {}) }}>
              <div style={{ ...s.td, flex:2, fontWeight:500 }}>{student.name}</div>
              <div style={s.td}>{student.roll_number}</div>
              <div style={s.td}>{student.course}</div>
              <div style={s.td}>{student.semester}</div>
              <div style={{ ...s.td, textAlign:'center' }}>
                {student.dmc_issued ? (
                  <div>
                    <span style={s.issuedBadge}>✓ Issued</span>
                    <div style={s.issuedMeta}>
                      {new Date(student.issued_at).toLocaleDateString('en-IN')} · {student.issued_by}
                    </div>
                  </div>
                ) : (
                  <button
                    style={{ ...s.issueBtn, opacity: issuing === student.id ? 0.6 : 1 }}
                    onClick={() => issueDMC(student)}
                    disabled={issuing === student.id}
                  >
                    {issuing === student.id ? 'Issuing…' : 'Issue DMC'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selectedCollege && students.length === 0 && (
        <div style={s.empty}>Koi student nahi mila. Search change karo.</div>
      )}

      {!selectedCollege && (
        <div style={s.empty}>Pehle ek college select karo.</div>
      )}
    </div>
  )
}

const s = {
  toast: { position:'fixed', top:20, right:20, background:'#1a1a18', color:'#fff', padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:500, zIndex:999 },
  header: { marginBottom:24 },
  title: { fontSize:22, fontWeight:600, color:'#1a1a18', marginBottom:4 },
  sub: { fontSize:13, color:'#888780' },
  filterRow: { display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' },
  select: { padding:'9px 14px', borderRadius:9, border:'0.5px solid #e8e6e0', fontSize:14, background:'#fff', color:'#1a1a18', minWidth:260 },
  searchInput: { padding:'9px 14px', borderRadius:9, border:'0.5px solid #e8e6e0', fontSize:14, background:'#fff', color:'#1a1a18', flex:1, minWidth:200 },
  statsRow: { display:'flex', gap:10, marginBottom:16 },
  statChip: { background:'#fff', border:'0.5px solid #e8e6e0', borderRadius:8, padding:'6px 14px', fontSize:13, color:'#5F5E5A' },
  loading: { textAlign:'center', padding:40, color:'#888780', fontSize:14 },
  table: { background:'#fff', border:'0.5px solid #e8e6e0', borderRadius:12, overflow:'hidden' },
  thead: { display:'flex', background:'#F7F6F3', borderBottom:'0.5px solid #e8e6e0', padding:'10px 16px' },
  th: { flex:1, fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'.05em' },
  trow: { display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'0.5px solid #F7F6F3', transition:'background .1s' },
  trowIssued: { background:'#F9FEF5' },
  td: { flex:1, fontSize:13, color:'#1a1a18' },
  issuedBadge: { background:'#EAF3DE', color:'#27500A', fontSize:12, fontWeight:500, padding:'3px 10px', borderRadius:20 },
  issuedMeta: { fontSize:10, color:'#888780', marginTop:3 },
  issueBtn: { background:'#E05A2B', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:600 },
  empty: { textAlign:'center', padding:60, color:'#888780', fontSize:14 },
}