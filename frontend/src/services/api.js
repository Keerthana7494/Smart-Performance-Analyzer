import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// =====================================================
// JWT AUTHENTICATION
// =====================================================

// Attach JWT token to every API request.
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('spa_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

// Handle expired or invalid authentication.
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spa_token')
      localStorage.removeItem('spa_user')

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// =====================================================
// STUDENT APIs
// =====================================================

// Fetch students based on the selected status.
export const getStudents = (status = 'ACTIVE') =>
  api.get('/students', {
    params: { status },
  })

// Create a student.
export const createStudent = data =>
  api.post('/students', data)

// Activate or deactivate a student.
// Backend expects active=1 or active=0.
export const changeStudentStatus = (id, active) =>
  api.patch(`/students/${id}/status`, null, {
    params: {
      active: active ? 1 : 0,
    },
  })

// Fetch the logged-in student's profile and performance history.
export const getMyStudentPerformance = () =>
  api.get('/student/me/performance')

// =====================================================
// ADMIN / TRAINER APIs
// =====================================================

// Fetch all trainers.
export const getTrainers = () =>
  api.get('/admin/trainers')

// Create a trainer.
export const createTrainer = data =>
  api.post('/admin/trainers', data)

// Activate or deactivate a trainer.
// Backend endpoint:
// PATCH /api/admin/trainers/{id}/status?active=1|0
//
// Pass a Boolean:
// true  -> active=1
// false -> active=0
export const changeTrainerStatus = (id, active) => {
  const activeValue = active ? 1 : 0

  return api.patch(
    `/admin/trainers/${id}/status`,
    null,
    {
      params: {
        active: activeValue,
      },
    }
  )
}

// =====================================================
// PERFORMANCE APIs
// =====================================================

// Fetch dashboard data.
export const getDashboard = () =>
  api.get('/performance/dashboard')

// Fetch all performance records.
export const getPerformance = () =>
  api.get('/performance')

// Fetch a performance record by ID.
export const getPerformanceById = id =>
  api.get(`/performance/${id}`)

// Create a performance record.
export const createPerformance = data =>
  api.post('/performance', data)

// Update an existing performance record.
export const updatePerformance = (id, data) =>
  api.put(`/performance/${id}`, data)

// Delete a performance record.
export const deletePerformance = id =>
  api.delete(`/performance/${id}`)

// =====================================================
// COMMON REPORT DOWNLOAD HELPER
// =====================================================

const downloadFile = async (
  path,
  fallbackFilename,
  params = {}
) => {
  const response = await api.get(path, {
    responseType: 'blob',
    params,
  })

  // Read the filename sent by the backend, if available.
  const disposition =
    response.headers['content-disposition'] || ''

  const match = disposition.match(
    /filename="?([^";]+)"?/i
  )

  const filename =
    match?.[1] || fallbackFilename

  // Trigger the browser download.
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  // Release the temporary URL after download starts.
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)

  return response
}

// =====================================================
// REPORT DOWNLOAD APIs
// =====================================================

// Individual student's performance PDF.
export const downloadStudentPerformancePdf = studentId =>
  downloadFile(
    `/reports/students/${studentId}/performance.pdf`,
    `student-${studentId}-performance-report.pdf`
  )

// Dashboard summary Excel.
export const downloadDashboardExcel = () =>
  downloadFile(
    '/reports/dashboard.xlsx',
    'dashboard-report.xlsx'
  )

// Performance records Excel.
export const downloadPerformanceExcel = () =>
  downloadFile(
    '/reports/performance.xlsx',
    'performance-report.xlsx'
  )

// =====================================================
// STUDENT EXCEL EXPORT — ACTIVE / INACTIVE / ALL
// =====================================================

export const downloadStudentsExcel = (
  status = 'ACTIVE'
) => {
  const normalizedStatus = String(status).toUpperCase()

  const filenames = {
    ACTIVE: 'active-students.xlsx',
    INACTIVE: 'deactivated-students.xlsx',
    ALL: 'all-students.xlsx',
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      filenames,
      normalizedStatus
    )
  ) {
    return Promise.reject(
      new Error(
        'Invalid status. Use ACTIVE, INACTIVE, or ALL.'
      )
    )
  }

  return downloadFile(
    '/reports/students.xlsx',
    filenames[normalizedStatus],
    {
      status: normalizedStatus,
    }
  )
}

// =====================================================
// AUDIT LOG APIs — ADMIN ONLY
// =====================================================

// Fetch audit logs with pagination.
export const getAuditLogs = (page = 0, size = 20) =>
  api.get('/audit-logs', {
    params: {
      page,
      size,
    },
  })

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default api
