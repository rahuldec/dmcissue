import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

export default function ImportStudents() {

  // CSV STATES
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // MANUAL FORM STATES
  const [form, setForm] = useState({
    name: '',
    roll_number: '',
    course: '',
    semester: '',
    college: ''
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // CSV PARSE
  function parseCSV(text) {
    const lines = text.trim().split('\n')

    const headers = lines[0]
      .split(',')
      .map(h =>
        h
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z_]/g, '')
      )

    return lines
      .slice(1)
      .map(line => {

        const vals = line
          .split(',')
          .map(v => v.trim().replace(/^"|"$/g, ''))

        const obj = {}

        headers.forEach((h, i) => {
          obj[h] = vals[i] || ''
        })

        return obj

      })
      .filter(r => r.name || r.student_name || r.roll_number)
  }

  // normalize any object's keys to lower_snake_case so CSV and
  // Excel rows (which come back with whatever header casing/spacing
  // was in the sheet) can be matched the same way
  function normalizeKeys(row) {

    const obj = {}

    Object.keys(row).forEach(key => {

      const cleanKey = key
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z_]/g, '')

      const val = row[key]

      obj[cleanKey] = val === undefined || val === null
        ? ''
        : String(val).trim()
    })

    return obj
  }

  function normalizeRow(rawRow) {

    const row = normalizeKeys(rawRow)

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

  // HANDLE FILE (CSV OR EXCEL)
  function handleFile(e) {

    const f = e.target.files[0]

    if (!f) return

    setFile(f)
    setResult(null)
    setError('')
    setPreview([])

    const name = f.name.toLowerCase()
    const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls')

    if (isExcel) {

      const reader = new FileReader()

      reader.onload = evt => {

        try {

          const data = new Uint8Array(evt.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]

          // defval keeps missing cells as '' instead of being dropped,
          // so columns line up the same way the CSV parser handles them
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

          const cleaned = rows
            .map(normalizeRow)
            .filter(r => r.name && r.roll_number)

          if (!cleaned.length) {
            setError('No valid rows found. Check that the sheet has name and roll_number columns.')
            return
          }

          setPreview(cleaned)

        } catch {

          setError('Check Excel file format')

        }
      }

      reader.onerror = () => setError('Could not read file')

      reader.readAsArrayBuffer(f)

    } else {

      const reader = new FileReader()

      reader.onload = evt => {

        try {

          const rows = parseCSV(evt.target.result)
            .map(normalizeRow)
            .filter(r => r.name && r.roll_number)

          if (!rows.length) {
            setError('No valid rows found. Check that the CSV has name and roll_number columns.')
            return
          }

          setPreview(rows)

        } catch {

          setError('Check CSV format')

        }
      }

      reader.onerror = () => setError('Could not read file')

      reader.readAsText(f)
    }
  }

  // IMPORT CSV STUDENTS
  async function importStudents() {

    if (!preview.length) return

    setImporting(true)
    setError('')

    const chunkSize = 100

    let imported = 0

    for (let i = 0; i < preview.length; i += chunkSize) {

      const chunk = preview.slice(i, i + chunkSize)

      const { error } = await supabase
        .from('students')
        .upsert(chunk, {
          onConflict: 'roll_number,college'
        })

      if (error) {

        setError(error.message)
        setImporting(false)

        return
      }

      imported += chunk.length
    }

    setResult({ count: imported })

    setPreview([])
    setFile(null)

    setImporting(false)
  }

  // MANUAL FORM INPUT
  function handleChange(e) {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // SAVE MANUAL STUDENT
  async function saveStudent(e) {

    e.preventDefault()

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('students')
      .insert([
        {
          ...form,
          dmc_issued: false
        }
      ])

    if (!error) {

      setMessage('Student added successfully ✓')

      setForm({
        name: '',
        roll_number: '',
        course: '',
        semester: '',
        college: ''
      })

    } else {

      setMessage(error.message)

    }

    setSaving(false)
  }

  return (
    <div>

      {/* PAGE HEADER */}
      <div style={s.header}>
        <h1 style={s.title}>
          Student Management
        </h1>

        <p style={s.sub}>
          Add students manually or import using CSV / Excel
        </p>
      </div>

      {/* MANUAL ADD FORM */}
      <div style={s.card}>

        <h2 style={s.sectionTitle}>
          Add Student Manually
        </h2>

        <form style={s.form} onSubmit={saveStudent}>

          <input
            style={s.input}
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            style={s.input}
            name="roll_number"
            placeholder="Roll Number"
            value={form.roll_number}
            onChange={handleChange}
            required
          />

          <input
            style={s.input}
            name="course"
            placeholder="Course"
            value={form.course}
            onChange={handleChange}
            required
          />

          <input
            style={s.input}
            name="semester"
            placeholder="Semester"
            value={form.semester}
            onChange={handleChange}
            required
          />

          <input
            style={s.input}
            name="college"
            placeholder="College"
            value={form.college}
            onChange={handleChange}
            required
          />

          <button
            style={s.addBtn}
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add Student'}
          </button>

        </form>

        {message && (
          <div style={s.success}>
            {message}
          </div>
        )}

      </div>

      {/* CSV IMPORT */}
      <div style={s.card}>

        <h2 style={s.sectionTitle}>
          Import Students by CSV or Excel
        </h2>

        <div style={s.infoBox}>
          <strong>Required columns:</strong>{' '}
          name, roll_number, course, semester, college
          <br />
          Accepted files: .csv, .xlsx, .xls
        </div>

        <div style={s.uploadBox}>

          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFile}
            style={s.fileInput}
            id="csvfile"
          />

          <label htmlFor="csvfile" style={s.uploadLabel}>

            <div style={s.uploadIcon}>
              📄
            </div>

            <div style={s.uploadText}>
              Select CSV or Excel File
            </div>

            <div style={s.uploadSub}>
              {file ? file.name : 'Click to upload (.csv, .xlsx, .xls)'}
            </div>

          </label>

        </div>

        {error && (
          <div style={s.error}>
            {error}
          </div>
        )}

        {result && (
          <div style={s.success}>
            ✓ {result.count} students imported successfully
          </div>
        )}

        {preview.length > 0 && (

          <div>

            <div style={s.previewHeader}>

              <span style={s.previewCount}>
                {preview.length} students ready
              </span>

              <button
                style={s.importBtn}
                onClick={importStudents}
                disabled={importing}
              >
                {importing
                  ? 'Importing...'
                  : `Import ${preview.length} Students`}
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}

const s = {

  header: {
    marginBottom: 28
  },

  title: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 6,
    color: '#1A1A18'
  },

  sub: {
    fontSize: 14,
    color: '#777'
  },

  card: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid #ECECEC',
    padding: 28,
    marginBottom: 28
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    color: '#1A1A18'
  },

  form: {
    display: 'grid',
    gap: 16,
    maxWidth: 600
  },

  input: {
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid #E6E6E6',
    fontSize: 14,
    outline: 'none'
  },

  addBtn: {
    background: '#E05A2B',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer'
  },

  infoBox: {
    background:'#E6F1FB',
    border:'1px solid #B5D4F4',
    borderRadius:10,
    padding:'12px 16px',
    fontSize:13,
    color:'#0C447C',
    marginBottom:20,
    lineHeight:1.6
  },

  uploadBox: {
    border:'1.5px dashed #e8e6e0',
    borderRadius:12,
    padding:32,
    textAlign:'center',
    background:'#fff',
    marginBottom:20,
    cursor:'pointer'
  },

  fileInput: {
    display:'none'
  },

  uploadLabel: {
    cursor:'pointer',
    display:'block'
  },

  uploadIcon: {
    fontSize:32,
    marginBottom:8
  },

  uploadText: {
    fontSize:15,
    fontWeight:500,
    color:'#1a1a18',
    marginBottom:4
  },

  uploadSub: {
    fontSize:13,
    color:'#888780'
  },

  previewHeader: {
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    marginTop:20
  },

  previewCount: {
    fontSize:13,
    color:'#5F5E5A',
    fontWeight:500
  },

  importBtn: {
    background:'#E05A2B',
    color:'#fff',
    border:'none',
    borderRadius:10,
    padding:'10px 20px',
    fontSize:13,
    fontWeight:600,
    cursor:'pointer'
  },

  error: {
    background:'#FCEBEB',
    color:'#A32D2D',
    fontSize:13,
    padding:'10px 14px',
    borderRadius:8,
    border:'1px solid #F7C1C1',
    marginBottom:16
  },

  success: {
    background:'#EAF3DE',
    color:'#27500A',
    fontSize:13,
    padding:'10px 14px',
    borderRadius:8,
    border:'1px solid #C0DD97',
    marginTop:16,
    fontWeight:500
  },

}
