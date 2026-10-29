import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  LogOut,
  Download
} from 'lucide-react'

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import {
  getDashboard,
  getPerformance,
  downloadDashboardExcel
} from '../services/api'

import Loading from '../components/Loading'

import {
  logoutUser
} from '../services/session'


export default function Dashboard() {

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = useNavigate()


  // =====================================================
  // STATE
  // =====================================================

  const [data, setData] = useState(null)
  const [recent, setRecent] = useState([])
  const [performanceRecords, setPerformanceRecords] = useState([])
  const [performancePage, setPerformancePage] = useState(1)
  const PERFORMANCE_PAGE_SIZE = 8
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    const confirmed = window.confirm(
      'Are you sure you want to logout?'
    )

    if (!confirmed) {
      return
    }

    logoutUser()

    navigate('/', {
      replace: true
    })

  }


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true)
        setError('')

        const [
          dashboardResponse,
          performanceResponse
        ] = await Promise.all([
          getDashboard(),
          getPerformance()
        ])

        setData(dashboardResponse.data)

        const performanceData =
          Array.isArray(performanceResponse.data)
            ? performanceResponse.data
            : []

        setPerformanceRecords(performanceData)

        setRecent(performanceData)
        setPerformancePage(1)

      } catch (err) {

        console.error(
          'Dashboard loading error:',
          err
        )

        /*
         * If the token has expired or the backend
         * returns 401/403, logout automatically.
         */
        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {

          logoutUser()

          navigate('/', {
            replace: true
          })

          return

        }

        setError(
          'Unable to load dashboard data. Please check whether the Spring Boot backend is running.'
        )

      } finally {

        setLoading(false)

      }

    }

    loadDashboard()

  }, [navigate])


  // =====================================================
  // LOADING
  // =====================================================

  const performancePageCount = Math.max(1, Math.ceil(recent.length / PERFORMANCE_PAGE_SIZE))
  const paginatedRecent = recent.slice(
    (performancePage - 1) * PERFORMANCE_PAGE_SIZE,
    performancePage * PERFORMANCE_PAGE_SIZE
  )

  if (loading) {

  return (
      <Loading
        text="Loading performance dashboard..."
      />
    )

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !data) {

    return (

      <div className="dashboard-error">

        <div className="dashboard-error-icon">

          <AlertTriangle size={28} />

        </div>


        <h2>
          Dashboard unavailable
        </h2>


        <p>
          {error || 'No dashboard data is available.'}
        </p>


        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >

          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>


          <button
            className="btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </div>

    )

  }


  // =====================================================
  // BASIC VALUES
  // =====================================================

  const totalStudents =
    Number(data.totalStudents || 0)

  const averageScore =
    Number(data.averageScore || 0)

  const excellentCount =
    Number(data.excellentCount || 0)

  const goodCount =
    Number(data.goodCount || 0)

  const averageCount =
    Number(data.averageCount || 0)

  const poorCount =
    Number(data.poorCount || 0)

  const highRiskCount =
    Number(data.highRiskCount || 0)


  // =====================================================
  // GRAPH 1
  // PERFORMANCE DISTRIBUTION
  // =====================================================

  const performanceDistribution = [

    {
      name: 'Excellent',
      count: excellentCount
    },

    {
      name: 'Good',
      count: goodCount
    },

    {
      name: 'Average',
      count: averageCount
    },

    {
      name: 'Poor',
      count: poorCount
    }

  ]


  // =====================================================
  // GRAPH 2
  // COURSE-BASED PERFORMANCE
  // =====================================================

  // API records may expose course directly or inside the student object.
  // Group all available performance records by course and calculate the
  // average overall score for each course.
  const coursePerformanceMap = performanceRecords.reduce(
    (courses, record) => {
      const rawCourse = record.student?.course ?? record.course
      const courseName =
        typeof rawCourse === 'string' && rawCourse.trim()
          ? rawCourse.trim()
          : 'Unassigned Course'

      const rawScore = record.overallScore
      const score =
        rawScore === null || rawScore === undefined || rawScore === ''
          ? NaN
          : Number(rawScore)

      if (!Number.isFinite(score)) {
        return courses
      }

      if (!courses[courseName]) {
        courses[courseName] = {
          course: courseName,
          totalScore: 0,
          recordCount: 0
        }
      }

      courses[courseName].totalScore += score
      courses[courseName].recordCount += 1

      return courses
    },
    {}
  )

  const coursePerformance = Object.values(coursePerformanceMap)
    .map(course => ({
      course: course.course,
      averageScore: Number(
        (course.totalScore / course.recordCount).toFixed(1)
      ),
      recordCount: course.recordCount
    }))
    .sort((a, b) => b.averageScore - a.averageScore)


  // =====================================================
  // GRAPH 3
  // RISK DISTRIBUTION
  // =====================================================

  const lowRiskCount =
    recent.filter(
      student =>
        String(student.riskStatus || '')
          .toUpperCase() === 'LOW'
    ).length


  const mediumRiskCount =
    recent.filter(
      student =>
        String(student.riskStatus || '')
          .toUpperCase() === 'MEDIUM'
    ).length


  const recentHighRiskCount =
    recent.filter(
      student =>
        String(student.riskStatus || '')
          .toUpperCase() === 'HIGH'
    ).length


  const riskDistribution = [

    {
      name: 'Low Risk',
      value: lowRiskCount
    },

    {
      name: 'Medium Risk',
      value: mediumRiskCount
    },

    {
      name: 'High Risk',
      value: recentHighRiskCount
    }

  ]


  // =====================================================
  // AI INSIGHT
  // =====================================================

  let aiInsight


  if (highRiskCount > 0) {

    aiInsight = {

      title: 'Students need attention',

      description:
        `${highRiskCount} student${highRiskCount > 1 ? 's' : ''} identified as high risk. Review their performance and AI recommendations to provide targeted academic support.`,

      type: 'warning'

    }

  } else if (averageScore >= 80) {

    aiInsight = {

      title: 'Strong overall performance',

      description:
        'Students are showing strong academic performance. Continue monitoring individual progress and maintaining consistent engagement.',

      type: 'success'

    }

  } else if (averageScore >= 60) {

    aiInsight = {

      title: 'Performance is moderate',

      description:
        'Overall performance is stable, but some students may benefit from additional mentoring, practice tasks and academic support.',

      type: 'info'

    }

  } else {

    aiInsight = {

      title: 'Performance requires attention',

      description:
        'The overall score indicates that additional academic support and personalized learning recommendations may be beneficial.',

      type: 'warning'

    }

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="dashboard-page">


      {/* =================================================
          TOP BAR
      ================================================== */}

      <div className="dashboard-top-bar">

        <div className="dashboard-brand">

          <BrainCircuit size={22} />

          <span>
            Smart Performance Analyzer
          </span>

        </div>


        <button
          type="button"
          className="dashboard-logout-button"
          onClick={handleLogout}
          title="Logout"
        >

          <LogOut size={17} />

          <span>
            Logout
          </span>

        </button>

      </div>


      {/* =================================================
          HERO
      ================================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="dashboard-eyebrow">

            <Sparkles size={15} />

            AI-POWERED ACADEMIC ANALYTICS

          </div>


          <h1>

            Student Performance

            <span>
              Intelligence Dashboard
            </span>

          </h1>


          <p>

            Monitor student performance, identify academic
            risks and generate personalized AI-powered
            recommendations.

          </p>


          <div className="dashboard-hero-actions">

            <Link
              to="/performance/new"
              className="dashboard-primary-button"
            >

              <BrainCircuit size={18} />

              Analyze Performance

            </Link>


            <Link
              to="/students/new"
              className="dashboard-secondary-button"
            >

              <UserPlus size={18} />

              Add Student

            </Link>

            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={() => downloadDashboardExcel().catch(() => window.alert('Unable to download the dashboard report. Please try again.'))}
            >
              <Download size={18} />
              Download Dashboard Excel
            </button>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="dashboard-hero-visual">

          <div className="hero-glow hero-glow-one"></div>

          <div className="hero-glow hero-glow-two"></div>


          <div className="ai-dashboard-orb">

            <BrainCircuit size={52} />

            <div className="ai-orb-ring"></div>

          </div>


          <div className="floating-stat floating-stat-one">

            <TrendingUp size={16} />

            <div>

              <strong>
                {averageScore.toFixed(1)}%
              </strong>

              <span>
                Avg. Score
              </span>

            </div>

          </div>


          <div className="floating-stat floating-stat-two">

            <Users size={16} />

            <div>

              <strong>
                {totalStudents}
              </strong>

              <span>
                Students
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          STAT CARDS
      ================================================== */}

      <section className="dashboard-stats">


        {/* TOTAL */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon purple">
            <Users size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Total Students
            </span>

            <strong>
              {totalStudents}
            </strong>

            <small>
              Active students
            </small>

          </div>

          <div className="stat-mini-icon">
            <GraduationCap size={18} />
          </div>

        </div>


        {/* AVERAGE */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon blue">
            <Activity size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Average Score
            </span>

            <strong>
              {averageScore.toFixed(1)}%
            </strong>

            <small>
              Overall performance
            </small>

          </div>

          <div className="stat-mini-icon">
            <TrendingUp size={18} />
          </div>

        </div> 


        {/* EXCELLENT */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon green">
            <Award size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Excellent
            </span>

            <strong>
              {excellentCount}
            </strong>

            <small>
              90% and above
            </small>

          </div>

          <div className="stat-mini-icon">
            <CheckCircle2 size={18} />
          </div>

        </div>


        {/* HIGH RISK */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon red">
            <ShieldAlert size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              High Risk
            </span>

            <strong>
              {highRiskCount}
            </strong>

            <small>
              Needs attention
            </small>

          </div>

          <div className="stat-mini-icon">
            <AlertTriangle size={18} />
          </div>

        </div>

      </section>


      {/* =================================================
          AI INSIGHT
      ================================================== */}

      <section
        className={`ai-insight-card ${aiInsight.type}`}
      >

        <div className="ai-insight-icon">

          <BrainCircuit size={24} />

        </div>


        <div className="ai-insight-content">

          <div className="ai-insight-label">

            <Sparkles size={14} />

            AI INSIGHT

          </div>


          <h3>
            {aiInsight.title}
          </h3>


          <p>
            {aiInsight.description}
          </p>

        </div>


        <Link
          to="/performance"
          className="ai-insight-link"
        >

          View Analysis

          <ChevronRight size={17} />

        </Link>

      </section>


      {/* =================================================
          GRAPH ROW
      ================================================== */}

      <section className="dashboard-chart-grid">


        {/* GRAPH 1 */}

        <div className="dashboard-card chart-main-card">

          <div className="dashboard-card-header">

            <div>

              <div className="card-title-row">

                <div className="card-title-icon">
                  <BarChart3 size={18} />
                </div>

                <h2>
                  Performance Distribution
                </h2>

              </div>


              <p>
                Students grouped by performance level
              </p>

            </div>


            <span className="chart-badge">
              Overview
            </span>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={310}
            >

              <BarChart
                data={performanceDistribution}
                margin={{
                  top: 15,
                  right: 10,
                  left: -15,
                  bottom: 5
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8ecf4"
                />


                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#7b8497',
                    fontSize: 12
                  }}
                />


                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#7b8497',
                    fontSize: 12
                  }}
                />


                <Tooltip
                  cursor={{
                    fill: 'rgba(99, 102, 241, 0.05)'
                  }}
                  contentStyle={{
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow:
                      '0 10px 30px rgba(15, 23, 42, 0.12)'
                  }}
                />


                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[8, 8, 2, 2]}
                  barSize={42}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* GRAPH 2 */}

        <div className="dashboard-card risk-chart-card">

          <div className="dashboard-card-header">

            <div>

              <div className="card-title-row">

                <div className="card-title-icon">
                  <ShieldAlert size={18} />
                </div>

                <h2>
                  Risk Distribution
                </h2>

              </div>


              <p>
                Latest performance risk levels
              </p>

            </div>

          </div>


          <div className="risk-chart-container">

            <ResponsiveContainer
              width="100%"
              height={230}
            >

              <PieChart>

                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="value"
                >

                  <Cell fill="#22c55e" />

                  <Cell fill="#f59e0b" />

                  <Cell fill="#ef4444" />

                </Pie>


                <Tooltip
                  contentStyle={{
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow:
                      '0 10px 30px rgba(15, 23, 42, 0.12)'
                  }}
                />

              </PieChart>

            </ResponsiveContainer>


            <div className="risk-chart-center">

              <strong>
                {recent.length}
              </strong>

              <span>
                Records
              </span>

            </div>

          </div>


          <div className="risk-legend">

            <div>

              <span className="legend-dot low"></span>

              <span>
                Low Risk
              </span>

              <strong>
                {lowRiskCount}
              </strong>

            </div>


            <div>

              <span className="legend-dot medium"></span>

              <span>
                Medium Risk
              </span>

              <strong>
                {mediumRiskCount}
              </strong>

            </div>


            <div>

              <span className="legend-dot high"></span>

              <span>
                High Risk
              </span>

              <strong>
                {recentHighRiskCount}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          COURSE-BASED PERFORMANCE
      ================================================== */}

      <section className="dashboard-card score-chart-card">

        <div className="dashboard-card-header">

          <div>

            <div className="card-title-row">

              <div className="card-title-icon">
                <BarChart3 size={18} />
              </div>

              <h2>
                Course-Based Performance
              </h2>

            </div>

            <p>
              Average overall score across courses
            </p>

          </div>

          <span className="chart-badge">
            By Course
          </span>

        </div>

        {coursePerformance.length === 0 ? (

          <div className="chart-empty">

            <BarChart3 size={38} />

            <h3>
              No course performance data
            </h3>

            <p>
              Add performance records with course and overall score details to view course averages.
            </p>

            <Link
              to="/performance/new"
              className="btn primary"
            >
              Add Performance
            </Link>

          </div>

        ) : (

          <div className="score-line-chart">

            <ResponsiveContainer
              width="100%"
              height={330}
            >

              <BarChart
                data={coursePerformance}
                margin={{
                  top: 15,
                  right: 20,
                  left: -10,
                  bottom: 15
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8ecf4"
                />

                <XAxis
                  dataKey="course"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#7b8497',
                    fontSize: 12
                  }}
                  interval={0}
                  angle={coursePerformance.length > 4 ? -15 : 0}
                  textAnchor={coursePerformance.length > 4 ? 'end' : 'middle'}
                  height={coursePerformance.length > 4 ? 55 : 30}
                />

                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#7b8497',
                    fontSize: 12
                  }}
                  tickFormatter={value => `${value}`}
                />

                <Tooltip
                  formatter={(value, _name, item) => [
                    `${value}/100`,
                    `Average score (${item.payload.recordCount} record${item.payload.recordCount === 1 ? '' : 's'})`
                  ]}
                  labelFormatter={label => `Course: ${label}`}
                  contentStyle={{
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow:
                      '0 10px 30px rgba(15, 23, 42, 0.12)'
                  }}
                />

                <Bar
                  dataKey="averageScore"
                  name="Average score"
                  fill="#6366f1"
                  radius={[8, 8, 2, 2]}
                  barSize={48}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        )}

      </section>


      {/* =================================================
          BOTTOM SECTION
      ================================================== */}

      <section className="dashboard-bottom-grid">


        {/* RECENT ANALYSIS */}

        <div className="dashboard-card recent-analysis-card">

          <div className="dashboard-card-header">

            <div>

              <div className="card-title-row">

                <div className="card-title-icon">
                  <Activity size={18} />
                </div>

                <h2>
                  Recent Analysis
                </h2>

              </div>


              <p>
                Latest student performance records
              </p>

            </div>


            <Link
              to="/performance"
              className="view-all-link"
            >

              View all

              <ChevronRight size={16} />

            </Link>

          </div>


          <div className="recent-analysis-list">

            {recent.length === 0 ? (

              <div className="empty-dashboard">

                <GraduationCap size={35} />

                <p>
                  No performance records yet.
                </p>

              </div>

            ) : (

              paginatedRecent.map((student) => {

                const studentName =
                  student.studentName ||
                  'Unknown Student'

                const firstLetter =
                  studentName
                    .charAt(0)
                    .toUpperCase()

                const risk =
                  String(
                    student.riskStatus || 'LOW'
                  ).toLowerCase()


                return (

                  <Link
                    to={`/performance/${student.performanceId}`}
                    className="recent-analysis-item"
                    key={student.performanceId}
                  >

                    <div className="student-avatar">

                      {firstLetter}

                    </div>


                    <div className="recent-student-info">

                      <strong>
                        {studentName}
                      </strong>

                      <span>
                        {student.course ||
                          'Course not available'}
                      </span>

                    </div>


                    <div className="recent-score-info">

                      <strong>
                        {Number(
                          student.overallScore || 0
                        ).toFixed(1)}%
                      </strong>


                      <span
                        className={`risk-label ${risk}`}
                      >
                        {student.riskStatus || 'LOW'}
                      </span>

                    </div>


                    <ChevronRight
                      size={17}
                      className="recent-arrow"
                    />

                  </Link>

                )

              })

            )}

          </div>

          {recent.length > PERFORMANCE_PAGE_SIZE && (
            <div className="dashboard-pagination" aria-label="Performance records pagination">
              <span>
                Showing {(performancePage - 1) * PERFORMANCE_PAGE_SIZE + 1}–{Math.min(performancePage * PERFORMANCE_PAGE_SIZE, recent.length)} of {recent.length}
              </span>
              <div>
                <button type="button" onClick={() => setPerformancePage(page => Math.max(1, page - 1))} disabled={performancePage <= 1}>Previous</button>
                <span>Page {performancePage} of {performancePageCount}</span>
                <button type="button" onClick={() => setPerformancePage(page => Math.min(performancePageCount, page + 1))} disabled={performancePage >= performancePageCount}>Next</button>
              </div>
            </div>
          )}

        </div>


        {/* QUICK ACTIONS */}

        <div className="dashboard-card quick-actions-card">

          <div className="dashboard-card-header">

            <div>

              <div className="card-title-row">

                <div className="card-title-icon">
                  <Plus size={18} />
                </div>

                <h2>
                  Quick Actions
                </h2>

              </div>


              <p>
                Manage your performance workflow
              </p>

            </div>

          </div>


          <div className="quick-actions">


            <Link
              to="/students/new"
              className="quick-action"
            >

              <div className="quick-action-icon purple">

                <UserPlus size={20} />

              </div>


              <div>

                <strong>
                  Add Student
                </strong>

                <span>
                  Create a new student profile
                </span>

              </div>


              <ChevronRight size={17} />

            </Link>



            <Link
              to="/performance/new"
              className="quick-action"
            >

              <div className="quick-action-icon blue">

                <BrainCircuit size={20} />

              </div>


              <div>

                <strong>
                  Analyze Performance
                </strong>

                <span>
                  Generate AI recommendations
                </span>

              </div>


              <ChevronRight size={17} />

            </Link>



            <Link
              to="/performance"
              className="quick-action"
            >

              <div className="quick-action-icon green">

                <BarChart3 size={20} />

              </div>


              <div>

                <strong>
                  View Performance
                </strong>

                <span>
                  Explore all student records
                </span>

              </div>


              <ChevronRight size={17} />

            </Link>

          </div>

        </div>

      </section>

    </div>

  )

}

