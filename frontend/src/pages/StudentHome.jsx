
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  LogOut,
  RefreshCw,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getMyStudentPerformance } from '../services/api'
import { getCurrentUser, logoutUser } from '../services/session'


const cardStyle = {
  background: 'var(--card-bg, #ffffff)',
  border: '1px solid var(--border-color, #e5e7eb)',
  borderRadius: 14,
  padding: 20,
  minWidth: 0,
}

const mutedStyle = { color: 'var(--muted-color, #6b7280)' }

const formatScore = value =>
  value == null ? '—' : `${Number(value).toFixed(1)}%`

const formatDate = value => {
  if (!value) return 'Unknown date'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString()
}

export default function StudentHome() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  const [portal, setPortal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPerformance = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getMyStudentPerformance()
      setPortal(response.data)
    } catch (err) {
      setPortal(null)

      if (err.response?.status === 404) {
        setError(
          'Your login account is not linked to a student record, ' +
          'or your student profile has not been created. Please contact your administrator.'
        )
      } else if (err.response?.status === 403) {
        setError('Your account does not have student portal access.')
      } else {
        setError(
          'Unable to load your performance data. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPerformance()
  }, [loadPerformance])

  const signout = () => {
    logoutUser()
    navigate('/login', { replace: true })
  }

  const records = portal?.records ?? []
  const latest = records.length
    ? records[records.length - 1]
    : null

  const chartData = records.map((record, index) => ({
    assessment: `Assessment ${index + 1}`,
    date: formatDate(record.createdAt),
    overallScore: record.overallScore == null
      ? null : Number(record.overallScore),
    attendance: record.attendance == null
      ? null : Number(record.attendance),
    assignment: record.assignmentScore == null
      ? null : Number(record.assignmentScore),
    test: record.testScore == null
      ? null : Number(record.testScore),
    project: record.projectScore == null
      ? null : Number(record.projectScore),
  }))

  return (
    <main style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '28px 20px 48px',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 28,
      }}>
        <div>
          <p style={{ ...mutedStyle, marginBottom: 6 }}>
            STUDENT PORTAL
          </p>
          <h1 style={{ margin: '0 0 8px' }}>
            Welcome, {portal?.studentName || user?.fullName || 'Student'}!
          </h1>
          <p style={{ ...mutedStyle, margin: 0 }}>
            {portal?.course
              ? `Course: ${portal.course}`
              : 'Your personal academic dashboard'}
          </p>
        </div>

        <button
          type="button"
          onClick={signout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 15px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#111827',
            cursor: 'pointer',
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </header>

      {loading && (
        <div style={cardStyle} role="status">
          Loading your performance data...
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          style={{
            ...cardStyle,
            borderColor: '#fca5a5',
            background: '#fef2f2',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Unable to show your dashboard</h3>
          <p>{error}</p>
          <button type="button" onClick={loadPerformance}>
            <RefreshCw size={15} style={{ verticalAlign: 'middle' }} />
            {' '}Try again
          </button>
        </div>
      )}

      {!loading && !error && portal && (
        <>
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 16,
            marginBottom: 22,
          }}>
            <StatCard
              icon={<Trophy size={22} />}
              label="Latest overall score"
              value={formatScore(latest?.overallScore)}
              detail={latest?.performanceLevel || 'No assessment yet'}
            />

            <StatCard
              icon={<CalendarCheck size={22} />}
              label="Attendance"
              value={formatScore(latest?.attendance)}
              detail="Latest recorded attendance"
            />

            <StatCard
              icon={<TrendingUp size={22} />}
              label="Assessments"
              value={records.length}
              detail="Performance records available"
            />

            <StatCard
              icon={<Activity size={22} />}
              label="Risk status"
              value={latest?.riskStatus || '—'}
              detail="Based on latest assessment"
            />
          </section>

          {records.length === 0 ? (
            <section style={cardStyle}>
              <BookOpen size={30} />
              <h2>No performance records yet</h2>
              <p style={mutedStyle}>
                Your account is linked successfully, but no performance
                assessments have been recorded for you yet.
                Your trainer can add an assessment when it is available.
              </p>
            </section>
          ) : (
            <>
              <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
                marginBottom: 22,
              }}>
                <div style={cardStyle}>
                  <h2 style={{ fontSize: 18, marginTop: 0 }}>
                    Overall score progress
                  </h2>
                  <p style={mutedStyle}>
                    How your recorded overall score changes over time
                  </p>

                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="assessment"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          labelFormatter={(label, payload) =>
                            payload?.[0]?.payload?.date || label
                          }
                          formatter={value => formatScore(value)}
                        />
                        <Line
                          type="monotone"
                          dataKey="overallScore"
                          name="Overall score"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h2 style={{ fontSize: 18, marginTop: 0 }}>
                    Assessment breakdown
                  </h2>
                  <p style={mutedStyle}>
                    Attendance, assignments, tests and projects
                  </p>

                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="assessment"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          labelFormatter={(label, payload) =>
                            payload?.[0]?.payload?.date || label
                          }
                          formatter={value => formatScore(value)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="attendance"
                          name="Attendance"
                          stroke="#0891b2"
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="assignment"
                          name="Assignment"
                          stroke="#7c3aed"
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="test"
                          name="Test"
                          stroke="#ea580c"
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="project"
                          name="Project"
                          stroke="#16a34a"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section style={{ ...cardStyle, marginBottom: 22 }}>
                <h2 style={{ fontSize: 18, marginTop: 0 }}>
                  Latest assessment
                </h2>
                <p style={mutedStyle}>
                  Recorded on {formatDate(latest?.createdAt)}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 16,
                }}>
                  <Score label="Assignment" value={latest?.assignmentScore} />
                  <Score label="Test" value={latest?.testScore} />
                  <Score label="Project" value={latest?.projectScore} />
                  <Score label="Overall" value={latest?.overallScore} />
                </div>

                <p>
                  <strong>Performance level: </strong>
                  {latest?.performanceLevel || 'Not available'}
                </p>
                <p>
                  <strong>Risk status: </strong>
                  {latest?.riskStatus || 'Not available'}
                </p>
              </section>

              <section style={cardStyle}>
                <h2 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 18,
                  marginTop: 0,
                }}>
                  <AlertTriangle size={20} />
                  AI learning recommendation
                </h2>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {latest?.aiRecommendation ||
                    'No recommendation is available for your latest assessment yet.'}
                </p>
              </section>
            </>
          )}
        </>
      )}
    </main>
  )
}

function StatCard({ icon, label, value, detail }) {
  return (
    <article style={cardStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={mutedStyle}>{label}</span>
        {icon}
      </div>
      <h2 style={{ fontSize: 27, margin: '16px 0 8px' }}>
        {value}
      </h2>
      <p style={{ ...mutedStyle, margin: 0, fontSize: 13 }}>
        {detail}
      </p>
    </article>
  )
}

function Score({ label, value }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: 14,
    }}>
      <p style={{ ...mutedStyle, marginTop: 0 }}>{label}</p>
      <strong style={{ fontSize: 22 }}>{formatScore(value)}</strong>
    </div>
  )
}
