
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  BarChart3,
  LayoutDashboard,
  PlusCircle,
  Users,
  LogOut,
  Menu,
  X,
  ClipboardList
} from 'lucide-react'

import { useState } from 'react'
import { getCurrentUser } from './services/session'

// Public pages
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import ChangeTemporaryPassword from './pages/Auth/ChangeTemporaryPassword'

// Admin and student pages
import AdminDashboard from './pages/AdminDashboard'
import AdminTrainers from './pages/AdminTrainers'
import StudentHome from './pages/StudentHome'

// Trainer pages
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import AddStudent from './pages/AddStudent'
import AddPerformance from './pages/AddPerformance'
import PerformanceList from './pages/PerformanceList'
import PerformanceDetails from './pages/PerformanceDetails'

// Audit Logs page
import AuditLogs from './pages/AuditLogs'

import BrandLogo from './components/BrandLogo'

import {
  logoutUser,
  isLoggedIn
} from './services/session'


// =====================================================
// PROTECTED ROUTE
// Allows ADMIN and TRAINER into the main application.
// =====================================================

function Protected({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  const user = getCurrentUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.mustChangePassword) {
    return (
      <Navigate
        to="/change-temporary-password"
        replace
      />
    )
  }

  if (user.role === 'STUDENT') {
    return <Navigate to="/student-home" replace />
  }

  if (user.role !== 'ADMIN' && user.role !== 'TRAINER') {
    return <Navigate to="/login" replace />
  }

  return children
}

// =====================================================
// ADMIN-ONLY ROUTE
// =====================================================

function AdminOnly({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  const user = getCurrentUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.mustChangePassword) {
    return (
      <Navigate
        to="/change-temporary-password"
        replace
      />
    )
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// =====================================================
// TRAINER-ONLY ROUTE
// =====================================================

function TrainerOnly({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  const user = getCurrentUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.mustChangePassword) {
    return (
      <Navigate
        to="/change-temporary-password"
        replace
      />
    )
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (user.role !== 'TRAINER') {
    return <Navigate to="/student-home" replace />
  }

  return children
}

// =====================================================
// MAIN APPLICATION LAYOUT
// =====================================================

function Layout() {
  const [mobile, setMobile] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'

  const dashboardPath = isAdmin
    ? '/admin/dashboard'
    : '/dashboard'

  // Role-based sidebar navigation
  const items = isAdmin
    ? [
        [dashboardPath, 'Dashboard', LayoutDashboard],
        ['/students/new', 'Add Student', PlusCircle],
        ['/admin/trainers', 'Create Trainer', Users],
        ['/admin/audit-logs', 'Audit Logs', ClipboardList]
      ]
    : [
        ['/dashboard', 'Dashboard', LayoutDashboard],
        ['/students', 'Students', Users],
        ['/performance', 'Performance', BarChart3],
        ['/students/new', 'Add Student', PlusCircle],
        ['/performance/new', 'Add Performance', BarChart3]
      ]

  // Page heading
  const title =
    items.find(([to]) => location.pathname === to)?.[1] ||
    (
      location.pathname === '/students/new'
        ? 'Add Student'
        : location.pathname === '/students'
          ? 'Students'
          : location.pathname === '/performance/new'
            ? 'Add Performance'
            : location.pathname.startsWith('/performance/')
              ? 'Performance Details'
              : location.pathname === '/admin/audit-logs'
                ? 'Audit Logs'
                : 'Dashboard'
    )

  // Sign out
  const signout = () => {
    logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <div className="brand">
          <BrandLogo
            to={dashboardPath}
            compact
            dark
          />

          <button
            className="mobile-close"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav>
          <p className="nav-label">WORKSPACE</p>

          {items.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={
                to === '/dashboard' ||
                to === '/admin/dashboard'
              }
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={signout}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobile && (
        <div
          className="mobile-overlay"
          onClick={() => setMobile(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>

          <div className="mobile-topbar-brand">
            <BrandLogo to={dashboardPath} compact />
          </div>

          <div className="topbar-title">
            <span className="eyebrow">
              SMART PERFORMANCE ANALYZER
            </span>
            <h1>{title}</h1>
          </div>

          <div className="topbar-user">
            <span className="user-avatar">
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </span>
            <span>{user?.fullName || 'User'}</span>
          </div>
        </header>

        {/* APPLICATION ROUTES */}
        <section className="page-content">
          <Routes>

            {/* ADMIN DASHBOARD */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminOnly>
                  <AdminDashboard />
                </AdminOnly>
              }
            />

            {/* ADMIN: CREATE TRAINER */}
            <Route
              path="/admin/trainers"
              element={
                <AdminOnly>
                  <AdminTrainers />
                </AdminOnly>
              }
            />

            {/* ADMIN: AUDIT LOGS */}
            <Route
              path="/admin/audit-logs"
              element={
                <AdminOnly>
                  <AuditLogs />
                </AdminOnly>
              }
            />

            {/* TRAINER DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                isAdmin
                  ? <Navigate to="/admin/dashboard" replace />
                  : (
                    <TrainerOnly>
                      <Dashboard />
                    </TrainerOnly>
                  )
              }
            />

            {/* TRAINER: STUDENTS LIST */}
            <Route
              path="/students"
              element={
                <TrainerOnly>
                  <Students />
                </TrainerOnly>
              }
            />

            {/* ADD STUDENT: ADMIN AND TRAINER */}
            <Route
              path="/students/new"
              element={
                <Protected>
                  <AddStudent />
                </Protected>
              }
            />

            {/* TRAINER: PERFORMANCE LIST */}
            <Route
              path="/performance"
              element={
                <TrainerOnly>
                  <PerformanceList />
                </TrainerOnly>
              }
            />

            {/* TRAINER: ADD PERFORMANCE */}
            <Route
              path="/performance/new"
              element={
                <TrainerOnly>
                  <AddPerformance />
                </TrainerOnly>
              }
            />

            {/* TRAINER: PERFORMANCE DETAILS */}
            <Route
              path="/performance/:id"
              element={
                <TrainerOnly>
                  <PerformanceDetails />
                </TrainerOnly>
              }
            />

            {/* UNKNOWN ROUTES */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                  replace
                />
              }
            />

          </Routes>
        </section>
      </main>
    </div>
  )
}

// =====================================================
// APPLICATION ENTRY POINT
// =====================================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC PAGES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* STUDENT PORTAL */}
        <Route
          path="/student-home"
          element={
            isLoggedIn()
              ? <StudentHome />
              : <Navigate to="/login" replace />
          }
        />

        {/* TEMPORARY PASSWORD CHANGE */}
        <Route
          path="/change-temporary-password"
          element={
            isLoggedIn()
              ? <ChangeTemporaryPassword />
              : <Navigate to="/login" replace />
          }
        />

        {/* PROTECTED APPLICATION */}
        <Route
          path="/*"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}
