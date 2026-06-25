import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function IssueDMC({ staffEmail }) {
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [issuing, setIssuing] = useState(null)
  const [toast, setToast] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 25

  useEffect(() => {
    setPage(1)
    fetchStudents()
  }, [search])

  async function fetchStudents() {
    setLoading(true)

    let q = supabase
      .from('students')
      .select('*')
      .order('name')

    if (search.trim()) {
      q = q.or(`name.ilike.%${search}%,roll_number.ilike.%${search}%`)
    }

    const { data } = await q

    setStudents(data || [])
    setLoading(false)
  }

  async function issueDMC(student) {
    if (student.dmc_issued) return

    setIssuing(student.id)

    const { error } = await supabase
      .from('students')
      .update({
        dmc_issued: true,
        issued_at: new Date().toISOString(),
        issued_by: staffEmail
      })
      .eq('id', student.id)

    if (!error) {

      setStudents(prev =>
        prev.map(s =>
          s.id === student.id
            ? {
                ...s,
                dmc_issued: true,
                issued_at: new Date().toISOString(),
                issued_by: staffEmail
              }
            : s
        )
      )

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

  const totalPages = Math.max(1, Math.ceil(students.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const pagedStudents = students.slice(pageStart, pageStart + pageSize)

  function goToPage(p) {
    const clamped = Math.min(Math.max(1, p), totalPages)
    setPage(clamped)
  }

  return (
    <div>

      {toast && (
        <div style={s.toast}>
          {toast} ✓
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <h1 style={s.title}>Issue DMC</h1>

        <p style={s.sub}>
          Search students and issue DMCs
        </p>
      </div>

      {/* SEARCH */}
      <div style={s.filterRow}>

        <input
          style={s.searchInput}
          placeholder="Search by Name or Roll Number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

      </div>

      {/* STATS */}
      <div style={s.statsRow}>

        <div style={s.statChip}>
          <span style={{ color:'#E05A2B', fontWeight:600 }}>
            {issued}
          </span>{' '}
          Issued
        </div>

        <div style={s.statChip}>
          <span style={{ color:'#185FA5', fontWeight:600 }}>
            {pending}
          </span>{' '}
          Pending
        </div>

        <div style={s.statChip}>
          <span style={{ fontWeight:600 }}>
            {students.length}
          </span>{' '}
          Total
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div style={s.loading}>
          Loading students...
        </div>
      )}

      {/* TABLE */}
      {!loading && students.length > 0 && (
        <div style={s.table}>

          <div style={s.thead}>
            <div style={{ ...s.th, flex:2 }}>
              Student Name
            </div>

            <div style={s.th}>
              Roll Number
            </div>

            <div style={s.th}>
              College
            </div>

            <div style={s.th}>
              Course
            </div>

            <div style={s.th}>
              Semester
            </div>

            <div style={{ ...s.th, textAlign:'center' }}>
              DMC Status
            </div>
          </div>

          {pagedStudents.map(student => (

            <div
              key={student.id}
              style={{
                ...s.trow,
                ...(student.dmc_issued ? s.trowIssued : {})
              }}
            >

              <div style={{ ...s.td, flex:2, fontWeight:500 }}>
                {student.name}
              </div>

              <div style={s.td}>
                {student.roll_number}
              </div>

              <div style={s.td}>
                {student.college}
              </div>

              <div style={s.td}>
                {student.course}
              </div>

              <div style={s.td}>
                {student.semester}
              </div>

              <div style={{ ...s.td, textAlign:'center' }}>

                {student.dmc_issued ? (
                  <div>

                    <span style={s.issuedBadge}>
                      ✓ Issued
                    </span>

                    <div style={s.issuedMeta}>
                      {new Date(student.issued_at).toLocaleDateString('en-IN')}
                    </div>

                  </div>
                ) : (

                  <button
                    style={{
                      ...s.issueBtn,
                      opacity: issuing === student.id ? 0.6 : 1
                    }}
                    onClick={() => issueDMC(student)}
                    disabled={issuing === student.id}
                  >
                    {issuing === student.id
                      ? 'Issuing...'
                      : 'Issue DMC'}
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>
      )}

      {/* PAGINATION */}
      {!loading && students.length > pageSize && (
        <div style={s.paginationRow}>

          <div style={s.pageInfo}>
            Showing {pageStart + 1}–{Math.min(pageStart + pageSize, students.length)} of {students.length}
          </div>

          <div style={s.pageControls}>

            <button
              style={{
                ...s.pageBtn,
                opacity: safePage === 1 ? 0.4 : 1,
                cursor: safePage === 1 ? 'default' : 'pointer'
              }}
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
            >
              ← Prev
            </button>

            <span style={s.pageLabel}>
              Page {safePage} of {totalPages}
            </span>

            <button
              style={{
                ...s.pageBtn,
                opacity: safePage === totalPages ? 0.4 : 1,
                cursor: safePage === totalPages ? 'default' : 'pointer'
              }}
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              Next →
            </button>

          </div>

        </div>
      )}

      {/* EMPTY */}
      {!loading && students.length === 0 && (
        <div style={s.empty}>
          No students found.
        </div>
      )}

    </div>
  )
}

const s = {

  toast: {
    position:'fixed',
    top:20,
    right:20,
    background:'#1a1a18',
    color:'#fff',
    padding:'10px 18px',
    borderRadius:10,
    fontSize:13,
    fontWeight:500,
    zIndex:999
  },

  header: {
    marginBottom:24
  },

  title: {
    fontSize:28,
    fontWeight:700,
    color:'#1a1a18',
    marginBottom:6
  },

  sub: {
    fontSize:14,
    color:'#888780'
  },

  filterRow: {
    display:'flex',
    gap:12,
    marginBottom:20,
    flexWrap:'wrap'
  },

  searchInput: {
    padding:'12px 16px',
    borderRadius:12,
    border:'1px solid #E8E6E0',
    fontSize:14,
    background:'#fff',
    color:'#1a1a18',
    flex:1,
    minWidth:250
  },

  statsRow: {
    display:'flex',
    gap:10,
    marginBottom:20
  },

  statChip: {
    background:'#fff',
    border:'1px solid #E8E6E0',
    borderRadius:10,
    padding:'8px 14px',
    fontSize:13,
    color:'#5F5E5A'
  },

  loading: {
    textAlign:'center',
    padding:40,
    color:'#888780',
    fontSize:14
  },

  table: {
    background:'#fff',
    border:'1px solid #E8E6E0',
    borderRadius:14,
    overflow:'hidden'
  },

  thead: {
    display:'flex',
    background:'#F7F6F3',
    borderBottom:'1px solid #E8E6E0',
    padding:'12px 16px'
  },

  th: {
    flex:1,
    fontSize:11,
    fontWeight:600,
    color:'#888780',
    textTransform:'uppercase',
    letterSpacing:'.05em'
  },

  trow: {
    display:'flex',
    alignItems:'center',
    padding:'14px 16px',
    borderBottom:'1px solid #F7F6F3'
  },

  trowIssued: {
    background:'#F9FEF5'
  },

  td: {
    flex:1,
    fontSize:13,
    color:'#1a1a18'
  },

  issuedBadge: {
    background:'#EAF3DE',
    color:'#27500A',
    fontSize:12,
    fontWeight:500,
    padding:'4px 10px',
    borderRadius:20
  },

  issuedMeta: {
    fontSize:10,
    color:'#888780',
    marginTop:4
  },

  issueBtn: {
    background:'#E05A2B',
    color:'#fff',
    border:'none',
    borderRadius:10,
    padding:'8px 16px',
    fontSize:12,
    fontWeight:600,
    cursor:'pointer'
  },

  empty: {
    textAlign:'center',
    padding:60,
    color:'#888780',
    fontSize:14
  },

  paginationRow: {
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    flexWrap:'wrap',
    gap:12,
    marginTop:16
  },

  pageInfo: {
    fontSize:13,
    color:'#888780'
  },

  pageControls: {
    display:'flex',
    alignItems:'center',
    gap:12
  },

  pageBtn: {
    background:'#fff',
    color:'#1a1a18',
    border:'1px solid #E8E6E0',
    borderRadius:9,
    padding:'8px 16px',
    fontSize:13,
    fontWeight:500
  },

  pageLabel: {
    fontSize:13,
    color:'#5F5E5A',
    fontWeight:500
  },
}
