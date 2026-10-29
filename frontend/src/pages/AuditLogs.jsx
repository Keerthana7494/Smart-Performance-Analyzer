
import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  UserRound,
  X,
} from 'lucide-react'

import { getAuditLogs } from '../services/api'
import { getCurrentUser } from '../services/session'

const PAGE_SIZE = 20

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

function getActionClass(action = '') {
  if (action.includes('DEACTIVATE')) return 'audit-action danger'
  if (action.includes('REACTIVATE')) return 'audit-action success'
  if (action.includes('CREATE')) return 'audit-action create'

  return 'audit-action'
}

export default function AuditLogs() {
  const user = getCurrentUser()

  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAuditLogs(page, PAGE_SIZE)
      const data = response.data

      setLogs(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load audit logs. Please check your connection and permissions.'
      )
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  // The backend returns one page at a time.
  // These filters apply to the currently loaded page.
  const filteredLogs = logs.filter(log => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch =
      !searchText ||
      [
        log.actorName,
        log.actorEmail,
        log.action,
        log.entityType,
        log.entityId,
        log.description,
      ].some(value =>
        String(value ?? '').toLowerCase().includes(searchText)
      )

    const matchesAction =
      actionFilter === 'ALL' ||
      log.action === actionFilter

    return matchesSearch && matchesAction
  })

  const availableActions = [
    ...new Set(logs.map(log => log.action).filter(Boolean)),
  ]

  if (user?.role !== 'ADMIN') {
    return (
      <div className="audit-page">
        <div className="audit-error">
          <ShieldCheck size={24} />
          <h2>Access denied</h2>
          <p>Only administrators can view audit logs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="audit-page">
      <style>{`
        .audit-page {
          color: #0f172a;
          width: 100%;
        }

        .audit-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .audit-heading h2 {
          font-size: 24px;
          margin-bottom: 5px;
        }

        .audit-muted {
          color: #64748b;
          font-size: 13px;
        }

        .audit-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #dbe2ea;
          background: white;
          color: #334155;
          border-radius: 9px;
          padding: 10px 14px;
          font-weight: 600;
        }

        .audit-refresh:hover {
          background: #f8fafc;
        }

        .audit-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .audit-stat {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .audit-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #eef2ff;
          color: #4f46e5;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .audit-stat strong {
          display: block;
          font-size: 23px;
          line-height: 1.4;
        }

        .audit-stat span {
          color: #64748b;
          font-size: 12px;
        }

        .audit-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }

        .audit-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 18px;
          border-bottom: 1px solid #e2e8f0;
        }

        .audit-search {
          flex: 1;
          min-width: 220px;
          position: relative;
        }

        .audit-search svg {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #94a3b8;
        }

        .audit-search input,
        .audit-toolbar select {
          width: 100%;
          border: 1px solid #dbe2ea;
          background: white;
          border-radius: 9px;
          padding: 10px 12px;
          color: #334155;
          outline: none;
        }

        .audit-search input {
          padding-left: 38px;
        }

        .audit-search input:focus,
        .audit-toolbar select:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px #eef2ff;
        }

        .audit-filter {
          width: 220px;
          max-width: 100%;
        }

        .audit-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .audit-table th {
          padding: 13px 16px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .5px;
          white-space: nowrap;
        }

        .audit-table td {
          padding: 15px 16px;
          border-top: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .audit-table tbody tr:hover {
          background: #fafbff;
        }

        .audit-actor {
          font-weight: 600;
          margin-bottom: 3px;
        }

        .audit-email {
          color: #64748b;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .audit-action {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .audit-action.create {
          background: #eef2ff;
          color: #4338ca;
        }

        .audit-action.danger {
          background: #fef2f2;
          color: #b91c1c;
        }

        .audit-action.success {
          background: #ecfdf5;
          color: #047857;
        }

        .audit-record {
          font-weight: 600;
        }

        .audit-description {
          max-width: 280px;
          overflow-wrap: anywhere;
          color: #475569;
        }

        .audit-details-btn {
          border: 0;
          background: transparent;
          color: #4f46e5;
          font-weight: 600;
          padding: 4px 0;
          white-space: nowrap;
        }

        .audit-details-btn:hover {
          text-decoration: underline;
        }

        .audit-empty {
          text-align: center;
          padding: 42px 16px;
          color: #64748b;
        }

        .audit-error {
          background: white;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 24px;
          border-radius: 12px;
        }

        .audit-error p {
          margin-top: 6px;
        }

        .audit-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 16px 18px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
        }

        .audit-pagination button {
          border: 1px solid #dbe2ea;
          border-radius: 8px;
          background: white;
          padding: 8px 11px;
          color: #334155;
          margin-left: 6px;
        }

        .audit-pagination button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .audit-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, .45);
          display: grid;
          place-items: center;
          padding: 18px;
          z-index: 2000;
        }

        .audit-modal {
          width: min(650px, 100%);
          max-height: 85vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, .2);
        }

        .audit-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .audit-close {
          border: 0;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 7px;
          display: grid;
          place-items: center;
        }

        .audit-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 16px;
        }

        .audit-detail {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
          min-width: 0;
        }

        .audit-detail small {
          display: block;
          color: #64748b;
          margin-bottom: 5px;
        }

        .audit-detail p {
          overflow-wrap: anywhere;
          white-space: pre-wrap;
          font-size: 13px;
        }

        @media (max-width: 600px) {
          .audit-heading h2 {
            font-size: 21px;
          }

          .audit-toolbar {
            padding: 14px;
          }

          .audit-filter {
            width: 100%;
          }

          .audit-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="audit-heading">
        <div>
          <h2>Audit Logs</h2>
          <p className="audit-muted">
            Track important activities performed in the application.
          </p>
        </div>

        <button
          type="button"
          className="audit-refresh"
          onClick={loadLogs}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="audit-stats">
        <div className="audit-stat">
          <div className="audit-stat-icon">
            <Activity size={21} />
          </div>
          <div>
            <strong>{totalElements}</strong>
            <span>Total audit records</span>
          </div>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">
            <UserRound size={21} />
          </div>
          <div>
            <strong>
              {new Set(logs.map(log => log.actorEmail || log.actorName).filter(Boolean)).size}
            </strong>
            <span>Actors on this page</span>
          </div>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">
            <Clock size={21} />
          </div>
          <div>
            <strong>{logs.length}</strong>
            <span>Records on this page</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="audit-error" style={{ marginBottom: 18 }}>
          <strong>Could not load audit logs</strong>
          <p>{error}</p>
          <button
            type="button"
            className="audit-refresh"
            style={{ marginTop: 12 }}
            onClick={loadLogs}
          >
            Try again
          </button>
        </div>
      )}

      <div className="audit-panel">
        <div className="audit-toolbar">
          <div className="audit-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search actor, action, record..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search audit logs on this page"
            />
          </div>

          <div className="audit-filter">
            <select
              value={actionFilter}
              onChange={event => setActionFilter(event.target.value)}
              aria-label="Filter by action"
            >
              <option value="ALL">All actions</option>
              {availableActions.map(action => (
                <option key={action} value={action}>
                  {action.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Record</th>
                <th>Description</th>
                <th>Date &amp; Time</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="audit-empty">
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="audit-empty">
                    {logs.length === 0
                      ? 'No audit records found.'
                      : 'No records match your search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.logId}>
                    <td>
                      <div className="audit-actor">
                        {log.actorName || 'Unknown'}
                      </div>
                      <div className="audit-email">
                        {log.actorEmail || log.actorRole || '—'}
                      </div>
                    </td>

                    <td>
                      <span className={getActionClass(log.action)}>
                        {(log.action || 'UNKNOWN').replaceAll('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <div className="audit-record">
                        {log.entityType || '—'}
                      </div>
                      <span className="audit-muted">
                        ID: {log.entityId ?? '—'}
                      </span>
                    </td>

                    <td>
                      <div className="audit-description">
                        {log.description || '—'}
                      </div>
                    </td>

                    <td>{formatDate(log.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="audit-details-btn"
                        onClick={() => setSelectedLog(log)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-pagination">
          <span>
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            {' · '}
            {totalElements} total records
          </span>

          <div>
            <button
              type="button"
              disabled={loading || page === 0}
              onClick={() => setPage(current => current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              disabled={loading || page + 1 >= totalPages}
              onClick={() => setPage(current => current + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div
          className="audit-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setSelectedLog(null)
            }
          }}
        >
          <section
            className="audit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
          >
            <div className="audit-modal-header">
              <div>
                <h2 id="audit-detail-title">Audit Record Details</h2>
                <p className="audit-muted">
                  Record #{selectedLog.logId}
                </p>
              </div>

              <button
                type="button"
                className="audit-close"
                onClick={() => setSelectedLog(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="audit-detail-grid">
              {[
                ['Actor', selectedLog.actorName],
                ['Email', selectedLog.actorEmail],
                ['Role', selectedLog.actorRole],
                ['Action', selectedLog.action],
                ['Entity type', selectedLog.entityType],
                ['Entity ID', selectedLog.entityId],
                ['Date & time', formatDate(selectedLog.createdAt)],
                ['Request method', selectedLog.requestMethod],
                ['Request path', selectedLog.requestPath],
                ['IP address', selectedLog.ipAddress],
                ['Description', selectedLog.description],
                ['Old value', selectedLog.oldValue],
                ['New value', selectedLog.newValue],
              ].map(([label, value]) => (
                <div className="audit-detail" key={label}>
                  <small>{label}</small>
                  <p>{value == null || value === '' ? '—' : String(value)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
