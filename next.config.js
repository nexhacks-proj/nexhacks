/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Ensure server components can use OpenTelemetry
  serverExternalPackages: [
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/exporter-trace-otlp-http',
  ],
}

module.exports = nextConfig
