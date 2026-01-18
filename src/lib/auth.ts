'use client'

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('isAuthenticated') === 'true'
}

/**
 * Get current user email/username
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('username') || sessionStorage.getItem('userEmail')
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('isAuthenticated')
  sessionStorage.removeItem('userEmail')
}
