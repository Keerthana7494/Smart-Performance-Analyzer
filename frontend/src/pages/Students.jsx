import './Students.css'

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  UserRoundCheck,
  UserRoundX,
  Download,
} from 'lucide-react'

import {
  changeStudentStatus,
  getStudents,
  downloadStudentsExcel,
} from '../services/api'

import Loading from '../components/Loading'

export default function Students() {
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [loading, setLoading] = useState(true)
  const [changingId, setChangingId] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getStudents(statusFilter)
      setStudents(response.data)
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Unable to load students. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [statusFilter])

  const filtered = useMemo(
    () =>
      students.filter(s =>
        `${s.studentName ?? ''} ${s.email ?? ''} ${s.course ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [students, query]
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const toggleStatus = async student => {
    const nextActive = student.active === 1 ? 0 : 1
    const action = nextActive === 0 ? 'deactivate' : 'reactivate'

    const message =
      nextActive === 0
        ? `Deactivate ${student.studentName}? They will no longer appear in active-student lists or new performance selection.`
        : `Reactivate ${student.studentName}? They will appear in active-student lists again.`

    if (!window.confirm(message)) return

    setChangingId(student.studentId)
    setError('')
    setNotice('')

    try {
      await changeStudentStatus(student.studentId, nextActive)

      setNotice(
        `${student.studentName} was ${
          nextActive === 0 ? 'deactivated' : 'reactivated'
        } successfully.`
      )

      await load()
    } catch (e) {
      setError(
        e.response?.data?.message ||
          `Unable to ${action} this student.`
      )
    } finally {
      setChangingId(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError('')
    setNotice('')

    try {
      // The API helper downloads the file itself. Pass the selected dropdown
      // value so the backend exports the matching student status.
      await downloadStudentsExcel(statusFilter)
      setNotice('Student details Excel report downloaded successfully.')
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Unable to export student details. Please try again.'
      )
    } finally {
      setExporting(false)
    }
  }

  if (loading && students.length === 0) {
    return <Loading text="Loading students..." />
  }

  return (
    <div className="card">
      <div className="section-heading">
        <div>
          <h3>Students</h3>
          <p>Manage student profiles and active status.</p>
        </div>

        <div className="student-actions">
          <button
            className="btn secondary"
            type="button"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={17} />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>

          <Link className="btn primary" to="/students/new">
            <Plus size={17} />
            Add Student
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="alert success" role="status">
          {notice}
        </div>
      )}

      <div className="filters">
        <div className="search-box">
          <Search size={18} />

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email or course..."
          />
        </div>

        <select
          aria-label="Filter students by status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ACTIVE">Active students</option>
          <option value="INACTIVE">Deactivated students</option>
          <option value="ALL">All students</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Course</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedStudents.map(s => {
              const isActive = s.active === 1
              const isUpdating = changingId === s.studentId

              return (
                <tr key={s.studentId}>
                  <td>
                    <strong>{s.studentName}</strong>
                  </td>

                  <td>{s.email}</td>
                  <td>{s.course}</td>

                  <td>
                    <span
                      className={`pill ${
                        isActive ? 'low' : 'neutral'
                      }`}
                    >
                      {isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>

                  <td>
                    <button
                      className={`btn secondary ${
                        isActive
                          ? 'btn-deactivate'
                          : 'btn-reactivate'
                      }`}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => toggleStatus(s)}
                      title={
                        isActive
                          ? 'Deactivate student'
                          : 'Reactivate student'
                      }
                    >
                      {isActive ? (
                        <UserRoundX size={16} />
                      ) : (
                        <UserRoundCheck size={16} />
                      )}

                      {isUpdating
                        ? 'Updating...'
                        : isActive
                          ? 'Deactivate'
                          : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty">
            No students found for this status and search.
          </div>
        )}
      </div>

      <div className="student-pagination" aria-label="Student pagination">
        <span>
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
        </span>
        <div>
          <button type="button" className="btn secondary" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1}>Previous</button>
          <span>Page {page} of {pageCount}</span>
          <button type="button" className="btn secondary" onClick={() => setPage(current => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>Next</button>
        </div>
      </div>

      <style>{`
        .student-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-deactivate {
          color: #dc2626;
        }

        .btn-deactivate:hover:not(:disabled) {
          color: #b91c1c;
        }

        .btn-reactivate {
          color: #eeab7b;
        }

        .btn-reactivate:hover:not(:disabled) {
          color: #eeab7b;
        }

        @media (max-width: 600px) {
          .student-actions {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
