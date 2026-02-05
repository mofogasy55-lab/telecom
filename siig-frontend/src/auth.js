import { apiGet, apiPost } from './api.js'

export async function register(email, password, role) {
  const payload = { email, password }
  if (role) payload.role = role

  const data = await apiPost('/api/auth/register', payload)
  localStorage.setItem('token', data.token)
  return data.user
}

export async function login(email, password) {
  const data = await apiPost('/api/auth/login', { email, password })
  localStorage.setItem('token', data.token)
  return data.user
}

export function logout() {
  localStorage.removeItem('token')
}

export async function me() {
  return apiGet('/api/me')
}
