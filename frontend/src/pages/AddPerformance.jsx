import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, createPerformance } from '../services/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Loading from '../components/Loading'

export default function AddPerformance() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({studentId:'', attendance:'', assignmentScore:'', testScore:'', projectScore:''})
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ getStudents().then(r=>setStudents(r.data)).finally(()=>setLoading(false)) }, [])

  const change = e => setForm({...form, [e.target.name]: e.target.value})

  const validate = () => {
    const e = {}
    if (!form.studentId) e.studentId='Select a student'
    ;['attendance','assignmentScore','testScore','projectScore'].forEach(k=>{
      const v=Number(form[k])
      if (form[k]==='' || Number.isNaN(v)) e[k]='Enter a score'
      else if (v<0 || v>100) e[k]='Must be between 0 and 100'
    })
    setErrors(e)
    return Object.keys(e).length===0
  }

  const submit = e => {
    e.preventDefault()
    if (validate()) setConfirm(true)
  }

  const confirmSave = async () => {
    setConfirm(false); setSaving(true)
    try {
      const response = await createPerformance({
        studentId:Number(form.studentId),
        attendance:Number(form.attendance),
        assignmentScore:Number(form.assignmentScore),
        testScore:Number(form.testScore),
        projectScore:Number(form.projectScore)
      })
      setToast({message:'Performance analyzed successfully',type:'success'})
      setTimeout(()=>navigate(`/performance/${response.data.performanceId}`), 700)
    } catch(err) {
      setToast({message:err.response?.data?.message || 'Unable to analyze performance',type:'error'})
    } finally { setSaving(false) }
  }

  if (loading) return <Loading text="Loading students..." />

  return (
    <>
      <div className="form-layout">
        <div className="card form-card">
          <div className="section-heading"><div><h3>Performance Details</h3><p>Enter academic metrics. Scores are validated and calculated using PL/SQL.</p></div></div>
          <form onSubmit={submit}>
            <div className="form-grid">
              <label className="field full"><span>Student</span><select name="studentId" value={form.studentId} onChange={change}><option value="">Select student</option>{students.map(s=><option value={s.studentId} key={s.studentId}>{s.studentName} — {s.course}</option>)}</select>{errors.studentId&&<small className="error">{errors.studentId}</small>}</label>
              <ScoreField label="Attendance (%)" name="attendance" value={form.attendance} onChange={change} error={errors.attendance}/>
              <ScoreField label="Assignment Score" name="assignmentScore" value={form.assignmentScore} onChange={change} error={errors.assignmentScore}/>
              <ScoreField label="Test Score" name="testScore" value={form.testScore} onChange={change} error={errors.testScore}/>
              <ScoreField label="Project Score" name="projectScore" value={form.projectScore} onChange={change} error={errors.projectScore}/>
            </div>
            <div className="formula-note"><strong>Calculation:</strong> Attendance 10% + Assignment 20% + Test 30% + Project 40%</div>
            <div className="form-actions"><button type="button" className="btn secondary" onClick={()=>navigate('/')}>Cancel</button><button className="btn primary" disabled={saving}>{saving?'Analyzing...':'Analyze Performance'}</button></div>
          </form>
        </div>
        <div className="info-card">
          <span className="eyebrow">AI ANALYSIS</span>
          <h3>Personalized recommendation</h3>
          <p>After the score is calculated, the backend can send the performance context to Hugging Face and store the recommendation with the record.</p>
        </div>
      </div>
      <Modal open={confirm} title="Confirm Analysis" onCancel={()=>setConfirm(false)} onConfirm={confirmSave}>
        Are you sure you want to analyze this student's performance?
      </Modal>
      <Toast {...toast} onClose={()=>setToast(null)} />
    </>
  )
}

function ScoreField({label,name,value,onChange,error}) {
  return <label className="field"><span>{label}</span><input name={name} type="number" min="0" max="100" step="0.01" value={value} onChange={onChange} placeholder="0 – 100"/>{error&&<small className="error">{error}</small>}</label>
}
