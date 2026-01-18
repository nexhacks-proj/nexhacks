/**
 * Determine if we should use MongoDB or localStorage
 * - Always use MongoDB for saving resumes/candidates
 * - Zustand still handles client-side state management
 */

export function shouldUseMongoDB(): boolean {
  // Always use MongoDB - resumes should be saved to database
  // Can override with environment variable if needed
  const forceLocalStorage = process.env.USE_MONGODB === 'false'
  
  if (forceLocalStorage) return false
  
  // Default: Always use MongoDB for persistence
  return true
}
