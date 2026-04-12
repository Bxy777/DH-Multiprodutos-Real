import { ADMIN_PASSWORD } from '../config/brand'

const KEY = 'dh_admin_session'

export function isAdminSession(): boolean {
  return sessionStorage.getItem(KEY) === '1'
}

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(KEY, '1')
    return true
  }
  return false
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(KEY)
}
