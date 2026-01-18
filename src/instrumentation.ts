// Next.js Instrumentation - Initializes Phoenix tracing at startup
// This file is automatically loaded by Next.js when instrumentation is enabled

export async function register() {
  // Only initialize on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initTracing } = await import('./lib/tracing')
    initTracing()
  }
}
