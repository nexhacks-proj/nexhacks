/**
 * Determine if we should use MongoDB or localStorage
 * - Production (Vercel/deployed): Use MongoDB
 * - Local development: Use localStorage (Zustand)
 */

export function shouldUseMongoDB(): boolean {
  // Use MongoDB in production environments
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = !!process.env.VERCEL
  const isDeployed = isProduction || isVercel
  
  // Can override with environment variable
  const forceMongoDB = process.env.USE_MONGODB === 'true'
  const forceLocalStorage = process.env.USE_MONGODB === 'false'
  
  if (forceMongoDB) return true
  if (forceLocalStorage) return false
  
  // Default: MongoDB in production, localStorage in development
  return isDeployed
}
