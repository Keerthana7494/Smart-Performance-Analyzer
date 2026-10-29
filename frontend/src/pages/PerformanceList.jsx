import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Trash2, Download } from 'lucide-react'
import { deletePerformance, getPerformance, downloadPerformanceExcel } from '../services/api'
import Modal from '../components/Modal'
import Loading from '../components/Loading'

export default function PerformanceList() {
  const [items,setItems]=useState([])
  const [query,setQuery]=useState('')
  const [risk,setRisk]=useState('ALL')
  const [loading,setLoading]=useState(true)
  const [deleteId,setDeleteId]=useState(null)
  const [page,setPage]=useState(1)
  const PAGE_SIZE=10

  const load=()=>getPerformance().then(r=>setItems(r.data)).finally(()=>setLoading(false))
  useEffect(()=>{load()},[])

  const filtered=useMemo(()=>items.filter(p=>{
    const q=`${p.studentName} ${p.course}`.toLowerCase().includes(query.toLowerCase())
    return q && (risk==='ALL'||p.riskStatus===risk)
  }),[items,query,risk])

  const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const paginatedItems=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)

  useEffect(()=>{setPage(1)},[query,risk])
  useEffect(()=>{if(page>pageCount)setPage(pageCount)},[page,pageCount])

  const remove=async()=>{await deletePerformance(deleteId);setDeleteId(null);load()}

  if(loading)return <Loading text="Loading performance..." />

  return <div className="card">
    <div className="section-heading"><div><h3>Performance Records</h3><p>Review and manage student performance analyses.</p></div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="btn" onClick={() => downloadPerformanceExcel().catch(() => window.alert('Unable to export performance records. Please try again.'))}><Download size={16}/> Export Excel</button><Link className="btn primary" to="/performance/new">+ Analyze Performance</Link></div></div>
    <div className="filters"><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search student or course..." /></div><select value={risk} onChange={e=>setRisk(e.target.value)}><option value="ALL">All risk levels</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
    <div className="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Overall</th><th>Level</th><th>Risk</th><th>Actions</th></tr></thead><tbody>
      {paginatedItems.map(p=><tr key={p.performanceId}><td><strong>{p.studentName}</strong></td><td>{p.course}</td><td>{p.overallScore}%</td><td><span className="pill neutral">{p.performanceLevel}</span></td><td><span className={`pill ${p.riskStatus.toLowerCase()}`}>{p.riskStatus}</span></td><td className="actions"><Link to={`/performance/${p.performanceId}`} title="View"><Eye size={17}/></Link><button onClick={()=>setDeleteId(p.performanceId)} title="Delete"><Trash2 size={17}/></button></td></tr>)}
    </tbody></table>{filtered.length===0&&<div className="empty">No matching performance records.</div>}</div>
    {filtered.length>0&&<div className="performance-pagination"><span>Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} records</span><div className="pagination-actions"><button type="button" className="btn" onClick={()=>setPage(current=>Math.max(1,current-1))} disabled={page===1}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" className="btn" onClick={()=>setPage(current=>Math.min(pageCount,current+1))} disabled={page===pageCount}>Next</button></div></div>}
    <Modal open={deleteId!==null} title="Delete Performance" onCancel={()=>setDeleteId(null)} onConfirm={remove} confirmText="Delete">This performance record will be permanently deleted.</Modal>
  </div>
}
