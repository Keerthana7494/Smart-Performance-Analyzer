import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Activity, AlertTriangle, ArrowDownToLine, Check, CheckCircle2,
  GraduationCap, LogOut, Plus, RefreshCw, Search, ShieldCheck,
  UserCheck, UserPlus, UserRound, UserRoundCog, UserX, X, Users
} from 'lucide-react'
import './AdminDashboard.css'
import {
  changeStudentStatus,
  changeTrainerStatus,
  createStudent,
  downloadDashboardExcel,
  getStudents,
  getTrainers,
} from '../services/api'
import { createTrainer } from '../services/authServices'
import { logoutUser } from '../services/session'
import Loading from '../components/Loading'

const EMPTY_TRAINER = { fullName: '', email: '' }
const EMPTY_STUDENT = { studentName: '', email: '', course: '' }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [directoryPage, setDirectoryPage] = useState(1)
  const DIRECTORY_PAGE_SIZE = 10
  const [activeTab, setActiveTab] = useState('trainers')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updating, setUpdating] = useState('')
  const [modal, setModal] = useState('')
  const [trainerForm, setTrainerForm] = useState(EMPTY_TRAINER)
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [createdTrainer, setCreatedTrainer] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const loadData = useCallback(async (quiet = false) => {
    try {
      if (quiet) setRefreshing(true)
      else setLoading(true)
      setError('')
      const [trainerResponse, studentResponse] = await Promise.all([
        getTrainers(),
        getStudents('ALL'),
      ])
      setTrainers(Array.isArray(trainerResponse.data) ? trainerResponse.data : [])
      setStudents(Array.isArray(studentResponse.data) ? studentResponse.data : [])
    } catch (err) {
      console.error('Admin dashboard error:', err.response?.data || err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        logoutUser()
        navigate('/', { replace: true })
        return
      }
      setError('Unable to load management data. Check the backend server and admin permissions.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate])

  useEffect(() => { loadData() }, [loadData])

  const isActive = record =>
    record?.isActive === true || record?.isActive === 1 || record?.isActive === '1' ||
    record?.active === true || record?.active === 1 || record?.active === '1'

  const activeTrainers = trainers.filter(isActive).length
  const inactiveTrainers = trainers.length - activeTrainers
  const activeStudents = students.filter(isActive).length
  const inactiveStudents = students.length - activeStudents
  const activeAccounts = activeTrainers + activeStudents
  const inactiveAccounts = inactiveTrainers + inactiveStudents

  // Chart data is derived from the same student list already loaded by the dashboard.
  const studentsByCourse = useMemo(() => {
    const counts = new Map()
    students.forEach(student => {
      const course = (student.course || '').trim() || 'Not specified'
      counts.set(course, (counts.get(course) || 0) + 1)
    })
    return Array.from(counts, ([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count || a.course.localeCompare(b.course))
  }, [students])

  const monthlyJoiningTrend = useMemo(() => {
    const now = new Date()
    const months = []
    const counts = new Map()
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en', { month: 'short', year: '2-digit' })
      months.push({ key, month: label })
      counts.set(key, 0)
    }
    students.forEach(student => {
      if (!student.createdAt) return
      const joined = new Date(student.createdAt)
      if (Number.isNaN(joined.getTime())) return
      const key = `${joined.getFullYear()}-${String(joined.getMonth() + 1).padStart(2, '0')}`
      if (counts.has(key)) counts.set(key, counts.get(key) + 1)
    })
    return months.map(({ key, month }) => ({ month, students: counts.get(key) }))
  }, [students])
  const hasJoiningDates = students.some(student => student.createdAt && !Number.isNaN(new Date(student.createdAt).getTime()))

  const filteredRecords = useMemo(() => {
    const source = activeTab === 'trainers' ? trainers : students
    const query = search.trim().toLowerCase()
    return source.filter(record => {
      const active = isActive(record)
      const name = activeTab === 'trainers'
        ? (record.fullName || record.name || record.trainerName || '')
        : (record.studentName || record.name || '')
      const matchesSearch = `${name} ${record.email || ''} ${record.course || ''}`.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? active : !active)
      return matchesSearch && matchesStatus
    })
  }, [activeTab, trainers, students, search, statusFilter])

  const directoryPageCount = Math.max(1, Math.ceil(filteredRecords.length / DIRECTORY_PAGE_SIZE))
  const paginatedRecords = filteredRecords.slice(
    (directoryPage - 1) * DIRECTORY_PAGE_SIZE,
    directoryPage * DIRECTORY_PAGE_SIZE
  )

  useEffect(() => {
    setDirectoryPage(1)
  }, [activeTab, search, statusFilter])

  useEffect(() => {
    if (directoryPage > directoryPageCount) setDirectoryPage(directoryPageCount)
  }, [directoryPage, directoryPageCount])

  const handleStatusChange = async record => {
    const trainer = activeTab === 'trainers'
    const id = trainer ? (record.userId ?? record.trainerId) : record.studentId
    const active = isActive(record)
    const name = trainer
      ? (record.fullName || record.name || record.trainerName || 'this trainer')
      : (record.studentName || record.name || 'this student')
    const action = active ? 'deactivate' : 'reactivate'
    if (id == null) {
      setActionError(`${trainer ? 'Trainer' : 'Student'} ID is missing from the API response.`)
      return
    }
    if (!window.confirm(`Are you sure you want to ${action} ${name}?`)) return
    const key = `${trainer ? 'trainer' : 'student'}-${id}`
    try {
      setUpdating(key)
      setActionError('')
      setNotice('')
      if (trainer) await changeTrainerStatus(id, !active)
      else await changeStudentStatus(id, !active)
      setNotice(`${name} was ${active ? 'deactivated' : 'reactivated'} successfully.`)
      await loadData(true)
    } catch (err) {
      console.error('Account status update failed:', err.response?.data || err)
      setActionError(err.response?.data?.message || `Unable to ${action} this ${trainer ? 'trainer' : 'student'}. Check that the backend status endpoint is available.`)
    } finally {
      setUpdating('')
    }
  }

  const openModal = type => {
    setModal(type)
    setFormError('')
    setCreatedTrainer(null)
    setTrainerForm(EMPTY_TRAINER)
    setStudentForm(EMPTY_STUDENT)
  }

  const closeModal = () => {
    if (creating) return
    setModal('')
    setFormError('')
  }

  const submitTrainer = async event => {
    event.preventDefault()
    setFormError('')
    setCreatedTrainer(null)
    setCreating(true)
    try {
      const response = await createTrainer({
        fullName: trainerForm.fullName.trim(),
        email: trainerForm.email.trim(),
      })
      setCreatedTrainer(response)
      setNotice('Trainer account created successfully.')
      await loadData(true)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create trainer. Check the email and backend response.')
    } finally {
      setCreating(false)
    }
  }

  const submitStudent = async event => {
    event.preventDefault()
    setFormError('')
    setCreating(true)
    try {
      await createStudent({
        studentName: studentForm.studentName.trim(),
        email: studentForm.email.trim(),
        course: studentForm.course.trim(),
      })
      setNotice('Student account created successfully.')
      setModal('')
      setStudentForm(EMPTY_STUDENT)
      await loadData(true)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create student. Check the entered details and backend response.')
    } finally {
      setCreating(false)
    }
  }

  const handleDownloadReport = async () => {
    setDownloading(true)
    setActionError('')
    setNotice('')
    try {
      await downloadDashboardExcel()
      setNotice('Dashboard report download started.')
    } catch (err) {
      console.error('Dashboard report download failed:', err.response?.data || err)
      setActionError(err.response?.data?.message || 'Unable to download the dashboard report. Check the dashboard report endpoint.')
    } finally {
      setDownloading(false)
    }
  }

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return
    logoutUser()
    navigate('/', { replace: true })
  }

  if (loading) return <Loading text="Loading admin dashboard..." />
  if (error) {
    return <div className="admin-message">
      <AlertTriangle size={28} />
      <h2>Admin dashboard unavailable</h2>
      <p>{error}</p>
      <button onClick={() => loadData()}>Try Again</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand-mark"><ShieldCheck size={24} /></div>
        <div className="admin-brand-copy">
          <h1>Smart Performance Analyzer</h1>
          <span>Administration workspace</span>
        </div>
        <div className="admin-header-spacer" />
        <span className="admin-role-pill"><UserRoundCog size={15} /> Administrator</span>
        <button className="admin-logout" onClick={handleLogout}><LogOut size={16} /> Logout</button>
      </header>

      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">ADMIN OVERVIEW</span>
          <h2>Welcome back, Admin</h2>
          <p>Manage people, monitor account activity, and keep your learning platform running smoothly.</p>
        </div>
        <div className="admin-welcome-actions">
          {/* <button className="admin-button admin-button-secondary" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'admin-spin' : ''} /> {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button> */}
          <button className="admin-button admin-button-primary" onClick={handleDownloadReport} disabled={downloading}>
            <ArrowDownToLine size={16} /> {downloading ? 'Preparing…' : 'Download report'}
          </button>
        </div>
      </section>

      {actionError && <div className="admin-alert admin-alert-error" role="alert"><AlertTriangle size={18} /><span>{actionError}</span><button aria-label="Dismiss error" onClick={() => setActionError('')}><X size={16} /></button></div>}
      {notice && <div className="admin-alert admin-alert-success" role="status"><CheckCircle2 size={18} /><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button></div>}

      <section className="admin-stats" aria-label="Account statistics">
        <StatCard icon={<Users />} title="Total trainers" total={trainers.length} active={activeTrainers} inactive={inactiveTrainers} tone="violet" />
        <StatCard icon={<GraduationCap />} title="Total students" total={students.length} active={activeStudents} inactive={inactiveStudents} tone="blue" />
        <StatCard icon={<UserCheck />} title="Active accounts" total={activeAccounts} detail="Accounts with access" tone="green" />
        <StatCard icon={<UserX />} title="Inactive accounts" total={inactiveAccounts} detail="Deactivated accounts" tone="amber" />
      </section>

      <section className="admin-charts" aria-label="Student analytics charts">
        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div><span className="admin-eyebrow">COURSE DISTRIBUTION</span><h2>Students by course</h2><p>Number of student records in each course.</p></div>
            <span className="admin-chart-total">{students.length} students</span>
          </div>
          {studentsByCourse.length > 0 ? <div className="admin-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsByCourse} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf5" />
                <XAxis dataKey="course" tick={{ fill: '#69758b', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={58} />
                <YAxis allowDecimals={false} tick={{ fill: '#69758b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f4f5ff' }} formatter={(value) => [value, 'Students']} />
                <Bar dataKey="count" name="Students" fill="#7167e8" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <div className="admin-chart-empty">No student records available yet.</div>}
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div><span className="admin-eyebrow">ENROLLMENT ACTIVITY</span><h2>Student joining trend</h2><p>Students created each month over the last 12 months.</p></div>
            <span className="admin-chart-total">Last 12 months</span>
          </div>
          {hasJoiningDates ? <div className="admin-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyJoiningTrend} margin={{ top: 8, right: 14, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf5" />
                <XAxis dataKey="month" tick={{ fill: '#69758b', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={12} />
                <YAxis allowDecimals={false} tick={{ fill: '#69758b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Students joined']} />
                <Line type="monotone" dataKey="students" name="Students joined" stroke="#159b78" strokeWidth={3} dot={{ r: 3, fill: '#159b78', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div> : <div className="admin-chart-empty">Joining dates are not available in the student API response.</div>}
        </article>
      </section>

      {/* <section className="admin-quick-actions">
        <div className="admin-section-intro"><div><span className="admin-eyebrow">QUICK ACTIONS</span><h2>Manage accounts</h2></div><p>Create accounts or update access without leaving this dashboard.</p></div>
        <div className="admin-action-cards">
          <button className="admin-create-card trainer-create" onClick={() => openModal('trainer')}>
            <span className="admin-create-icon"><UserPlus size={21} /></span><span className="admin-create-copy"><strong>Create trainer</strong><small>Add a trainer account to the platform</small></span><Plus className="admin-create-plus" size={19} />
          </button>
          <button className="admin-create-card student-create" onClick={() => openModal('student')}>
            <span className="admin-create-icon"><GraduationCap size={22} /></span><span className="admin-create-copy"><strong>Create student</strong><small>Add a student profile and course</small></span><Plus className="admin-create-plus" size={19} />
          </button> 
        </div>
      </section> */}

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><span className="admin-eyebrow">DIRECTORY</span><h2>Trainers and students</h2><p>Review account details and activate, deactivate, or reactivate access.</p></div>
          <label className="admin-search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${activeTab}…`} aria-label={`Search ${activeTab}`} /><kbd>⌕</kbd></label>
        </div>

        <div className="admin-table-controls">
          <div className="admin-tabs" role="tablist" aria-label="Account type">
            <button role="tab" aria-selected={activeTab === 'trainers'} className={activeTab === 'trainers' ? 'selected' : ''} onClick={() => { setActiveTab('trainers'); setSearch(''); setStatusFilter('ALL') }}><Users size={16} /> Trainers <span>{trainers.length}</span></button>
            <button role="tab" aria-selected={activeTab === 'students'} className={activeTab === 'students' ? 'selected' : ''} onClick={() => { setActiveTab('students'); setSearch(''); setStatusFilter('ALL') }}><GraduationCap size={16} /> Students <span>{students.length}</span></button>
          </div>
          <label className="admin-filter-label">Status
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="ALL">All accounts</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>{activeTab === 'trainers' ? 'Trainer' : 'Student'}</th><th>Email / Login ID</th>{activeTab === 'students' && <th>Course</th>}<th>Status</th><th className="admin-table-action-heading">Account access</th></tr></thead>
            <tbody>
              {paginatedRecords.map(record => {
                const trainer = activeTab === 'trainers'
                const id = trainer ? (record.userId ?? record.trainerId) : record.studentId
                const active = isActive(record)
                const name = trainer ? (record.fullName || record.name || record.trainerName || 'Unnamed trainer') : (record.studentName || record.name || 'Unnamed student')
                const busy = updating === `${trainer ? 'trainer' : 'student'}-${id}`
                return <tr key={`${activeTab}-${id ?? record.email}`}>
                  <td><div className="admin-person-cell"><span className={`admin-avatar ${trainer ? 'trainer-avatar' : 'student-avatar'}`}>{trainer ? <UserRoundCog size={17} /> : <UserRound size={17} />}</span><span><strong>{name}</strong><small>{trainer ? `Trainer ID: ${id ?? '—'}` : `Student ID: ${id ?? '—'}`}</small></span></div></td>
                  <td>{record.email || '—'}</td>
                  {activeTab === 'students' && <td>{record.course || '—'}</td>}
                  <td><span className={`admin-status ${active ? 'active' : 'inactive'}`}><span />{active ? 'Active' : 'Inactive'}</span></td>
                  <td><button className={`admin-action ${active ? 'deactivate' : 'activate'}`} disabled={busy || id == null} onClick={() => handleStatusChange(record)}>{busy ? <><RefreshCw size={14} className="admin-spin" /> Updating…</> : active ? <><UserX size={14} /> Deactivate</> : <><Check size={14} /> Reactivate</>}</button></td>
                </tr>
              })}
              {filteredRecords.length === 0 && <tr><td colSpan={activeTab === 'students' ? 5 : 4} className="admin-empty"><span className="admin-empty-icon"><Search size={20} /></span><strong>No {activeTab} found</strong><small>Try another search or status filter.</small></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer">
          <span>
            Showing <strong>{filteredRecords.length === 0 ? 0 : (directoryPage - 1) * DIRECTORY_PAGE_SIZE + 1}–{Math.min(directoryPage * DIRECTORY_PAGE_SIZE, filteredRecords.length)}</strong>
            {' '}of <strong>{filteredRecords.length}</strong> filtered {activeTab}
          </span>
          <div className="admin-pagination" aria-label="Directory pagination">
            <button type="button" onClick={() => setDirectoryPage(page => Math.max(1, page - 1))} disabled={directoryPage <= 1}>Previous</button>
            <span>Page <strong>{directoryPage}</strong> of <strong>{directoryPageCount}</strong></span>
            <button type="button" onClick={() => setDirectoryPage(page => Math.min(directoryPageCount, page + 1))} disabled={directoryPage >= directoryPageCount}>Next</button>
          </div>
          <span><Activity size={14} /> Data loaded from your account service</span>
        </div>
      </section>

      <footer className="admin-footer"><CheckCircle2 size={15} /> Smart Performance Analyzer <span>•</span> Admin control panel</footer>

      {modal && 
      <div className="admin-modal-backdrop" role="presentation" 
      onMouseDown={event => { if (event.target === event.currentTarget) closeModal() }}>
        <section className="admin-modal" role="dialog" aria-modal="true" 
        aria-labelledby="admin-modal-title">
          <header className="admin-modal-header">
            <span className={`admin-modal-icon ${modal === 'trainer' ? 'trainer-modal-icon' : 'student-modal-icon'}`}>{modal === 'trainer' ? <UserPlus size={21} /> : <GraduationCap size={22} />}</span><div><h2 id="admin-modal-title">Create {modal} account</h2><p>{modal === 'trainer' ? 'Add a trainer who can support student performance.' : 'Add a student profile to your learning platform.'}</p></div><button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close dialog"><X size={19} /></button></header>
          {modal === 'trainer' ? <form className="admin-form" onSubmit={submitTrainer}>
            <label>Full name<input required minLength={3} maxLength={100} autoComplete="name" value={trainerForm.fullName} onChange={event => setTrainerForm({ ...trainerForm, fullName: event.target.value })} placeholder="e.g. Priya Sharma" /></label>
            <label>Email / login ID<input required type="email" maxLength={150} autoComplete="email" value={trainerForm.email} onChange={event => setTrainerForm({ ...trainerForm, email: event.target.value })} placeholder="name@example.com" /></label>
            <div className="admin-form-note"><ShieldCheck size={16} /><span>The system creates a temporary password. Share it privately with the trainer.</span></div>
            {formError && <p className="admin-form-error" role="alert">{formError}</p>}
            {createdTrainer && <div className="admin-created-credentials" role="status"><strong><CheckCircle2 size={17} /> Trainer created</strong><span>{createdTrainer.fullName} · {createdTrainer.email}</span><label>Temporary password (shown once)</label><code>{createdTrainer.temporaryPassword}</code><span className="admin-expiry">Expires: {createdTrainer.expiresAt || 'within 24 hours'}</span><button type="button" className="admin-button admin-button-secondary" onClick={() => navigator.clipboard?.writeText(createdTrainer.temporaryPassword || '')} disabled={!createdTrainer.temporaryPassword}>Copy temporary password</button></div>}
            <div className="admin-modal-actions"><button type="button" className="admin-button admin-button-secondary" onClick={closeModal} disabled={creating}>{createdTrainer ? 'Close' : 'Cancel'}</button>{!createdTrainer && <button type="submit" className="admin-button admin-button-primary" disabled={creating}>{creating ? 'Creating…' : <><UserPlus size={16} /> Create trainer</>}</button>}</div>
          </form> : <form className="admin-form" onSubmit={submitStudent}>
            <label>Student name<input required maxLength={100} autoComplete="name" value={studentForm.studentName} onChange={event => setStudentForm({ ...studentForm, studentName: event.target.value })} placeholder="e.g. Arun Kumar" /></label>
            <label>Email<input required type="email" maxLength={150} autoComplete="email" value={studentForm.email} onChange={event => setStudentForm({ ...studentForm, email: event.target.value })} placeholder="student@example.com" /></label>
            <label>Course<input required maxLength={100} value={studentForm.course} onChange={event => setStudentForm({ ...studentForm, course: event.target.value })} placeholder="e.g. Java Full Stack" /></label>
            {formError && <p className="admin-form-error" role="alert">{formError}</p>}
            <div className="admin-modal-actions"><button type="button" className="admin-button admin-button-secondary" onClick={closeModal} disabled={creating}>Cancel</button><button type="submit" className="admin-button admin-button-primary" disabled={creating}>{creating ? 'Creating…' : <><UserPlus size={16} /> Create student</>}</button></div>
          </form>}
        </section>
      </div>}
    </main>
  )
}

function StatCard({ icon, title, total, active, inactive, detail, tone }) {
  return <article className="admin-stat-card">
    <div className={`admin-stat-icon ${tone}`}>{icon}</div>
    <div className="admin-stat-label">{title}</div>
    <strong className="admin-stat-total">{total}</strong>
    {detail ? 
    <div className="admin-stat-detail">{detail}</div> : <div className="admin-stat-breakdown">
      <span><i className="active-dot" /> {active} active</span>
      <span><i className="inactive-dot" /> {inactive} inactive</span></div>}</article>
}
