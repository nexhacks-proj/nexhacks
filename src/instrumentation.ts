// Next.js Instrumentation - Initializes Phoenix tracing at startup
// This file is automatically loaded by Next.js when instrumentation is enabled

export async function register() {
  // Only initialize on the server side
  if (typeof window === 'undefined') {
    try {
      const { initTracing } = await import('./lib/tracing')
      initTracing()
    } catch (error) {
      // Silently fail if tracing can't be initialized (e.g., Phoenix not running)
      console.warn('[Instrumentation] Failed to initialize tracing:', error)
    }
  }
}
