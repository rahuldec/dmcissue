import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ImportStudents() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function parseCSV(text) {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''))
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj = {}
      headers.forEach((h, i) => obj[h] = vals[i] || '')
      return obj
    }).filter(r => r.name || r.student_name || r.roll_number)
  }

  function normalizeRow(row) {
    return {
      name: row.name || row.student_name || row.student || '',
      roll_number: row.roll_number || row.rollno || row.roll_no || row.roll || '',
      course: row.course || row.program || row.programme || '',
      semester: row.semester || row.sem || '',
      college: row.college || row.college_name || row.institution || '',
      dmc_issued: false,
      issued_at: null,
      issued_by: null,
    }
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const rows = parseCSV(evt.target.result).map(normalizeRow).filter(r => r.name && r.roll_number)
        setPreview(rows)
      } catch { setError('Check CSV format') }
    }
    reader.readAsText(f)
  }

  async function importStudents() {
    if (!preview.length) return
    setImporting(true)
    setError('')
    const chunkSize = 100
    let imported = 0
    for (let i = 0; i < preview.length; i += chunkSize) {
      const chunk = preview.slice(i, i + chunkSize)
      const { error } = await supabase.from('students').upsert(chunk, { onConflict: 'roll_number,college' })
      if (error) { setError(error.message); setImporting(false); return }
      imported += chunk.length
    }
    setResult({ count: imported })
    setPreview([])
    setFile(null)
    setImporting(false)
  }

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Import Students</h1>
        <p style={s.sub}>Import by Excel</p>
      </div>

      <div style={s.infoBox}>
        <strong>File Format : CSV format</strong> name, roll_number, course, semester, college
        <br />
        <span style={{ color:'#888780' }}> </span>
      </div>

      <div style={s.uploadBox}>
        <input type="file" accept=".csv" onChange={handleFile} style={s.fileInput} id="csvfile" />
        <label htmlFor="csvfile" style={s.uploadLabel}>
          <div style={s.uploadIcon}>📄</div>
          <div style={s.uploadText}>Select File</div>
          <div style={s.uploadSub}>{file ? file.name : 'drop here'}</div>
        </label>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {result && (
        <div style={s.success}>
          ✓ {result.count} Students successfully imported.
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <div style={s.previewHeader}>
            <span style={s.previewCount}>{preview.length} students ready to import</span>
            <button style={s.importBtn} onClick={importStudents} disabled={importing}>
              {importing ? 'Importing…' : `Import ${preview.length} Students`}
            </button>
          </div>
          <div style={s.table}>
            <div style={s.thead}>
              <div style={{ ...s.th, flex:2 }}>Name</div>
              <div style={s.th}>Roll Number</div>
              <div style={s.th}>Course</div>
              <div style={s.th}>Semester</div>
              <div style={{ ...s.th, flex:2 }}>College</div>
            </div>
            {preview.slice(0, 20).map((r, i) => (
              <div key={i} style={s.trow}>
                <div style={{ ...s.td, flex:2 }}>{r.name}</div>
                <div style={s.td}>{r.roll_number}</div>
                <div style={s.td}>{r.course}</div>
                <div style={s.td}>{r.semester}</div>
                <div style={{ ...s.td, flex:2 }}>{r.college}</div>
              </div>
            ))}
            {preview.length > 20 && (
              <div style={{ textAlign:'center', padding:12, fontSize:12, color:'#888780' }}>
                + {preview.length - 20} more students…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  header: { marginBottom:20 },
  title: { fontSize:22, fontWeight:600, color:'#1a1a18', marginBottom:4 },
  sub: { fontSize:13, color:'#888780' },
  infoBox: { background:'#E6F1FB', border:'0.5px solid #B5D4F4', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#0C447C', marginBottom:20, lineHeight:1.6 },
  uploadBox: { border:'1.5px dashed #e8e6e0', borderRadius:12, padding:32, textAlign:'center', background:'#fff', marginBottom:20, cursor:'pointer' },
  fileInput: { display:'none' },
  uploadLabel: { cursor:'pointer', display:'block' },
  uploadIcon: { fontSize:32, marginBottom:8 },
  uploadText: { fontSize:15, fontWeight:500, color:'#1a1a18', marginBottom:4 },
  uploadSub: { fontSize:13, color:'#888780' },
  error: { background:'#FCEBEB', color:'#A32D2D', fontSize:13, padding:'10px 14px', borderRadius:8, border:'0.5px solid #F7C1C1', marginBottom:16 },
  success: { background:'#EAF3DE', color:'#27500A', fontSize:13, padding:'10px 14px', borderRadius:8, border:'0.5px solid #C0DD97', marginBottom:16, fontWeight:500 },
  previewHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  previewCount: { fontSize:13, color:'#5F5E5A', fontWeight:500 },
  importBtn: { background:'#E05A2B', color:'#fff', border:'none', borderRadius:9, padding:'8px 20px', fontSize:13, fontWeight:600 },
  table: { background:'#fff', border:'0.5px solid #e8e6e0', borderRadius:12, overflow:'hidden' },
  thead: { display:'flex', background:'#F7F6F3', borderBottom:'0.5px solid #e8e6e0', padding:'10px 16px' },
  th: { flex:1, fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'.05em' },
  trow: { display:'flex', padding:'10px 16px', borderBottom:'0.5px solid #F7F6F3' },
  td: { flex:1, fontSize:13, color:'#1a1a18' },
}