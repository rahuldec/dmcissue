import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Records() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [college, setCollege] = useState('')
  const [date, setDate] = useState('')
  const [colleges, setColleges] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    supabase.from('dmc_records').select('college').then(({ data }) => {
      if (data) setColleges([...new Set(data.map(d => d.college))].filter(Boolean).sort())
    })
    fetchRecords()
  }, [])

  async function fetchRecords(col = college, dt = date) {
    setLoading(true)
    let q = supabase.from('dmc_records').select('*').order('issued_at', { ascending: false })
    if (col) q = q.eq('college', col)
    if (dt) q = q.gte('issued_at', dt).lt('issued_at', dt + 'T23:59:59')
    const { data } = await q
    setRecords(data || [])
    setLoading(false)
  }

  function applyFilter() { fetchRecords(college, date) }

  async function deleteRecord(record) {
    const confirmed = window.confirm(
      `Delete the DMC record for ${record.student_name} (${record.roll_number})? This cannot be undone.`
    )
    if (!confirmed) return

    setDeletingId(record.id)

    const { error } = await supabase
      .from('dmc_records')
      .delete()
      .eq('id', record.id)

    if (error) {
      alert(`Could not delete record: ${error.message}`)
    } else {
      setRecords(prev => prev.filter(r => r.id !== record.id))
    }

    setDeletingId(null)
  }

  function exportCSV() {
    const headers = ['Name', 'Roll Number', 'Course', 'Semester', 'College', 'Issued By', 'Issued At']
    const rows = records.map(r => [r.student_name, r.roll_number, r.course, r.semester, r.college, r.issued_by, new Date(r.issued_at).toLocaleString('en-IN')])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dmc_records_${Date.now()}.csv`
    a.click()
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>DMC Records</h1>
          <p style={s.sub}>All Records</p>
        </div>
        <button style={s.exportBtn} onClick={exportCSV}>⬇ Export CSV</button>
      </div>

      <div style={s.filterRow}>
        <select style={s.select} value={college} onChange={e => setCollege(e.target.value)}>
          <option value="">All Colleges</option>
          {colleges.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input style={s.dateInput} type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button style={s.filterBtn} onClick={applyFilter}>Filter</button>
        <button style={s.clearBtn} onClick={() => { setCollege(''); setDate(''); fetchRecords('', '') }}>Clear</button>
      </div>

      <div style={s.countRow}>{records.length} records found</div>

      {loading ? <div style={s.loading}>Loading…</div> : (
        <div style={s.table}>
          <div style={s.thead}>
            <div style={{ ...s.th, flex:2 }}>Student Name</div>
            <div style={s.th}>Roll Number</div>
            <div style={s.th}>Course</div>
            <div style={s.th}>Semester</div>
            <div style={{ ...s.th, flex:2 }}>College</div>
            <div style={s.th}>Issued By</div>
            <div style={s.th}>Date & Time</div>
            <div style={{ ...s.th, flex: 0.6, textAlign: 'right' }}>Actions</div>
          </div>
          {records.length === 0 && <div style={s.empty}>Koi record nahi mila.</div>}
          {records.map(r => (
            <div key={r.id} style={s.trow}>
              <div style={{ ...s.td, flex:2, fontWeight:500 }}>{r.student_name}</div>
              <div style={s.td}>{r.roll_number}</div>
              <div style={s.td}>{r.course}</div>
              <div style={s.td}>{r.semester}</div>
              <div style={{ ...s.td, flex:2 }}>{r.college}</div>
              <div style={s.td}>{r.issued_by}</div>
              <div style={s.td}>{new Date(r.issued_at).toLocaleString('en-IN')}</div>
              <div style={{ ...s.td, flex: 0.6, textAlign: 'right' }}>
                <button
                  style={s.deleteBtn}
                  onClick={() => deleteRecord(r)}
                  disabled={deletingId === r.id}
                  title="Delete record"
                >
                  {deletingId === r.id ? '…' : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 },
  title: { fontSize:22, fontWeight:600, color:'#1a1a18', marginBottom:4 },
  sub: { fontSize:13, color:'#888780' },
  exportBtn: { background:'#1a1a18', color:'#fff', border:'none', borderRadius:9, padding:'8px 16px', fontSize:13, fontWeight:500 },
  filterRow: { display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' },
  select: { padding:'8px 12px', borderRadius:8, border:'0.5px solid #e8e6e0', fontSize:13, background:'#fff', minWidth:200 },
  dateInput: { padding:'8px 12px', borderRadius:8, border:'0.5px solid #e8e6e0', fontSize:13, background:'#fff' },
  filterBtn: { background:'#E05A2B', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:500 },
  clearBtn: { background:'#fff', color:'#5F5E5A', border:'0.5px solid #e8e6e0', borderRadius:8, padding:'8px 14px', fontSize:13 },
  countRow: { fontSize:12, color:'#888780', marginBottom:12 },
  loading: { textAlign:'center', padding:40, color:'#888780' },
  table: { background:'#fff', border:'0.5px solid #e8e6e0', borderRadius:12, overflow:'auto' },
  thead: { display:'flex', background:'#F7F6F3', borderBottom:'0.5px solid #e8e6e0', padding:'10px 16px', minWidth:900 },
  th: { flex:1, fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'.05em' },
  trow: { display:'flex', padding:'11px 16px', borderBottom:'0.5px solid #F7F6F3', minWidth:900 },
  td: { flex:1, fontSize:13, color:'#1a1a18' },
  empty: { textAlign:'center', padding:40, color:'#888780', fontSize:14 },
  deleteBtn: {
    background: '#FCEBEB',
    color: '#A32D2D',
    border: '0.5px solid #F7C1C1',
    borderRadius: 7,
    padding: '5px 10px',
    fontSize: 13,
    cursor: 'pointer',
    lineHeight: 1
  },
}
