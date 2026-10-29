import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Brain, CalendarDays, Download } from 'lucide-react'
import { getPerformanceById, downloadStudentPerformancePdf } from '../services/api'
import Loading from '../components/Loading'

export default function PerformanceDetails(){
  const {id}=useParams()
  const [p,setP]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{getPerformanceById(id).then(r=>setP(r.data)).finally(()=>setLoading(false))},[id])
  if(loading)return <Loading text="Loading performance details..." />
  if(!p)return <div className="empty">Performance record not found.</div>

  return <div>
    <Link className="back-link" to="/performance"><ArrowLeft size={16}/> Back to performance</Link>
    <div className="details-hero">
      <div><span className="eyebrow">PERFORMANCE ANALYSIS</span><h2>{p.studentName}</h2><p>{p.course}</p></div>
      <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <button className="btn" onClick={() => downloadStudentPerformancePdf(p.studentId).catch(() => window.alert('Unable to download the PDF report. Please try again.'))}>
          <Download size={16}/> Download PDF Report
        </button>
        <div className={`big-score ${(p.riskStatus || '').toLowerCase()}`}><strong>{p.overallScore}%</strong><span>{p.performanceLevel}</span></div>
      </div>
    </div>
    <div className="details-grid">
      <div className="card">
        <div className="section-heading"><div><h3>Performance Metrics</h3><p>Individual assessment scores</p></div></div>
        <Metric label="Attendance" value={p.attendance}/>
        <Metric label="Assignment" value={p.assignmentScore}/>
        <Metric label="Test" value={p.testScore}/>
        <Metric label="Project" value={p.projectScore}/>
      </div>
      <div className="card ai-card">
        <div className="ai-heading"><div className="ai-icon"><Brain size={21}/></div><div><h3>Personalized Recommendation</h3><p>Personalized learning guidance</p></div></div>
        <div className="recommendation">{p.aiRecommendation || 'No recommendation available.'}</div>
        <div className="detail-meta"><CalendarDays size={15}/> {p.createdAt?.replace('T',' ')}</div>
      </div>
    </div>
  </div>
}

function Metric({label,value}){
  return <div className="metric"><div><span>{label}</span><strong>{value}%</strong></div><div className="progress"><i style={{width:`${value}%`}}/></div></div>
}
