export function saveSession(data) {
  localStorage.setItem('spa_token', data.token)
  localStorage.setItem('spa_user', JSON.stringify({
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    mustChangePassword: Boolean(data.mustChangePassword),
  }))
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem('spa_token'))
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('spa_user') || 'null')
  } catch {
    return null
  }
}

export function logoutUser() {
  localStorage.removeItem('spa_token')
  localStorage.removeItem('spa_user')
}
