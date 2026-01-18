// Arize Phoenix Tracing Setup
// OpenTelemetry instrumentation for agent pipeline observability

import { trace, context, SpanStatusCode, Span, SpanKind } from '@opentelemetry/api'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { BatchSpanProcessor, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

// Phoenix OTLP endpoint - default to localhost
const PHOENIX_COLLECTOR_ENDPOINT = process.env.PHOENIX_COLLECTOR_ENDPOINT || 'http://localhost:6006/v1/traces'

// Service identification
const SERVICE_NAME = 'swipehire-agents'
const SERVICE_VERSION = '1.0.0'

let isInitialized = false

/**
 * Initialize OpenTelemetry tracing for Phoenix
 * Call this once at application startup
 */
export function initTracing(): void {
  if (isInitialized) {
    console.log('[Tracing] Already initialized')
    return
  }

  try {
    // Create resource identifying this service
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
    })

    // Configure OTLP exporter for Phoenix
    const exporter = new OTLPTraceExporter({
      url: PHOENIX_COLLECTOR_ENDPOINT,
      headers: {
        // Add Phoenix API key if using cloud Phoenix
        ...(process.env.PHOENIX_API_KEY && {
          'Authorization': `Bearer ${process.env.PHOENIX_API_KEY}`
        })
      }
    })

    // Create span processor
    const spanProcessor = new BatchSpanProcessor(exporter)

    // Create tracer provider with resource and span processor
    const provider = new NodeTracerProvider({
      resource,
      spanProcessors: [spanProcessor],
    })

    // Register the provider globally
    provider.register()

    isInitialized = true
    console.log(`[Tracing] Initialized - sending traces to ${PHOENIX_COLLECTOR_ENDPOINT}`)
  } catch (error) {
    console.error('[Tracing] Failed to initialize:', error)
  }
}

/**
 * Get the tracer for the agent pipeline
 */
export function getTracer() {
  return trace.getTracer(SERVICE_NAME, SERVICE_VERSION)
}

// LLM-specific semantic conventions for Phoenix
export const LLM_ATTRIBUTES = {
  // Input/Output
  LLM_SYSTEM: 'llm.system',
  LLM_REQUEST_MODEL: 'llm.request.model',
  LLM_RESPONSE_MODEL: 'llm.response.model',
  LLM_REQUEST_MAX_TOKENS: 'llm.request.max_tokens',
  LLM_REQUEST_TEMPERATURE: 'llm.request.temperature',
  LLM_USAGE_INPUT_TOKENS: 'llm.usage.input_tokens',
  LLM_USAGE_OUTPUT_TOKENS: 'llm.usage.output_tokens',
  LLM_USAGE_TOTAL_TOKENS: 'llm.usage.total_tokens',

  // Prompts and responses (for Phoenix visualization)
  LLM_PROMPTS: 'llm.prompts',
  LLM_PROMPT_TEMPLATE: 'llm.prompt_template',
  LLM_COMPLETIONS: 'llm.completions',

  // Agent-specific
  AGENT_NAME: 'agent.name',
  AGENT_STEP: 'agent.step',
  AGENT_SUCCESS: 'agent.success',
  AGENT_ERROR: 'agent.error',

  // Document/Input attributes
  INPUT_VALUE: 'input.value',
  OUTPUT_VALUE: 'output.value',
}

export interface LLMSpanOptions {
  agentName: string
  agentStep: 'extract' | 'score' | 'email'
  model: string
  systemPrompt?: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
}

export interface LLMSpanResult {
  success: boolean
  response?: string
  inputTokens?: number
  outputTokens?: number
  error?: string
}

/**
 * Create a traced LLM call span
 * Wraps an async function with OpenTelemetry span tracking
 */
export async function traceLLMCall<T>(
  options: LLMSpanOptions,
  fn: () => Promise<T>
): Promise<T> {
  const tracer = getTracer()

  return tracer.startActiveSpan(
    `${options.agentName}.${options.agentStep}`,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        [LLM_ATTRIBUTES.AGENT_NAME]: options.agentName,
        [LLM_ATTRIBUTES.AGENT_STEP]: options.agentStep,
        [LLM_ATTRIBUTES.LLM_SYSTEM]: options.agentName === 'email-agent' ? 'google' : 'cerebras',
        [LLM_ATTRIBUTES.LLM_REQUEST_MODEL]: options.model,
        [LLM_ATTRIBUTES.LLM_REQUEST_MAX_TOKENS]: options.maxTokens,
        [LLM_ATTRIBUTES.LLM_REQUEST_TEMPERATURE]: options.temperature,
        [LLM_ATTRIBUTES.INPUT_VALUE]: options.userPrompt.substring(0, 1000), // Truncate for storage
      }
    },
    async (span) => {
      try {
        const result = await fn()
        span.setStatus({ code: SpanStatusCode.OK })
        span.setAttribute(LLM_ATTRIBUTES.AGENT_SUCCESS, true)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage })
        span.setAttribute(LLM_ATTRIBUTES.AGENT_SUCCESS, false)
        span.setAttribute(LLM_ATTRIBUTES.AGENT_ERROR, errorMessage)
        throw error
      } finally {
        span.end()
      }
    }
  )
}

/**
 * Add LLM response metrics to the current span
 */
export function recordLLMMetrics(
  span: Span,
  metrics: {
    inputTokens?: number
    outputTokens?: number
    response?: string
  }
): void {
  if (metrics.inputTokens !== undefined) {
    span.setAttribute(LLM_ATTRIBUTES.LLM_USAGE_INPUT_TOKENS, metrics.inputTokens)
  }
  if (metrics.outputTokens !== undefined) {
    span.setAttribute(LLM_ATTRIBUTES.LLM_USAGE_OUTPUT_TOKENS, metrics.outputTokens)
  }
  if (metrics.inputTokens !== undefined && metrics.outputTokens !== undefined) {
    span.setAttribute(LLM_ATTRIBUTES.LLM_USAGE_TOTAL_TOKENS, metrics.inputTokens + metrics.outputTokens)
  }
  if (metrics.response) {
    span.setAttribute(LLM_ATTRIBUTES.OUTPUT_VALUE, metrics.response.substring(0, 1000)) // Truncate for storage
  }
}

/**
 * Create a parent span for the entire agent pipeline
 */
export function createPipelineSpan(
  candidateId: string,
  jobId: string,
  steps: string[]
): Span {
  const tracer = getTracer()
  const span = tracer.startSpan('agent-pipeline', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'pipeline.candidate_id': candidateId,
      'pipeline.job_id': jobId,
      'pipeline.steps': steps.join(','),
    }
  })
  return span
}

/**
 * Get the current active span (useful for adding attributes)
 */
export function getCurrentSpan(): Span | undefined {
  return trace.getActiveSpan()
}

/**
 * Run a function within a span context
 */
export function withSpan<T>(span: Span, fn: () => T): T {
  return context.with(trace.setSpan(context.active(), span), fn)
}
