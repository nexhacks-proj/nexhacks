// TheTokenCompany bear-1 compression API client
// https://thetokencompany.com/docs

export interface CompressionSettings {
  aggressiveness?: number  // 0.0-1.0, default 0.5
  max_output_tokens?: number | null
  min_output_tokens?: number | null
}

export interface CompressionResult {
  output: string
  output_tokens: number
  original_input_tokens: number
  compression_time: number
  compression_ratio: number  // calculated: output_tokens / original_input_tokens
  tokens_saved: number       // calculated: original - output
}

export interface CompressionStats {
  total_input_tokens: number
  total_output_tokens: number
  total_tokens_saved: number
  total_compression_time: number
  average_compression_ratio: number
  compressions_count: number
}

// Track compression stats for the session
let sessionStats: CompressionStats = {
  total_input_tokens: 0,
  total_output_tokens: 0,
  total_tokens_saved: 0,
  total_compression_time: 0,
  average_compression_ratio: 1,
  compressions_count: 0
}

const getBearApiKey = () => {
  const apiKey = process.env.BEAR_API_KEY || process.env.THE_TOKEN_COMPANY_API_KEY
  if (!apiKey) {
    console.warn('BEAR_API_KEY not set - compression disabled')
    return null
  }
  return apiKey
}

/**
 * Compress text using TheTokenCompany's bear-1 model
 * Returns original text if API key not configured or on error
 */
export async function compressText(
  input: string,
  settings: CompressionSettings = {}
): Promise<CompressionResult> {
  const apiKey = getBearApiKey()

  // If no API key, return original text with mock stats
  if (!apiKey) {
    const estimatedTokens = Math.ceil(input.length / 4) // rough estimate
    return {
      output: input,
      output_tokens: estimatedTokens,
      original_input_tokens: estimatedTokens,
      compression_time: 0,
      compression_ratio: 1,
      tokens_saved: 0
    }
  }

  try {
    const response = await fetch('https://api.thetokencompany.com/v1/compress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'bear-1',
        input,
        compression_settings: {
          aggressiveness: settings.aggressiveness ?? 0.5,
          max_output_tokens: settings.max_output_tokens ?? null,
          min_output_tokens: settings.min_output_tokens ?? null
        }
      })
    })

    if (!response.ok) {
      // On auth error or any API error, fall back to original text
      console.warn(`Bear API returned ${response.status}, using original text`)
      const estimatedTokens = Math.ceil(input.length / 4)
      return {
        output: input,
        output_tokens: estimatedTokens,
        original_input_tokens: estimatedTokens,
        compression_time: 0,
        compression_ratio: 1,
        tokens_saved: 0
      }
    }

    const data = await response.json()

    const result: CompressionResult = {
      output: data.output,
      output_tokens: data.output_tokens,
      original_input_tokens: data.original_input_tokens,
      compression_time: data.compression_time,
      compression_ratio: data.output_tokens / data.original_input_tokens,
      tokens_saved: data.original_input_tokens - data.output_tokens
    }

    // Update session stats
    sessionStats.total_input_tokens += result.original_input_tokens
    sessionStats.total_output_tokens += result.output_tokens
    sessionStats.total_tokens_saved += result.tokens_saved
    sessionStats.total_compression_time += result.compression_time
    sessionStats.compressions_count += 1
    sessionStats.average_compression_ratio =
      sessionStats.total_output_tokens / sessionStats.total_input_tokens

    return result
  } catch (error) {
    console.error('Bear compression error:', error)
    // Return original on error
    const estimatedTokens = Math.ceil(input.length / 4)
    return {
      output: input,
      output_tokens: estimatedTokens,
      original_input_tokens: estimatedTokens,
      compression_time: 0,
      compression_ratio: 1,
      tokens_saved: 0
    }
  }
}

/**
 * Compress a resume for AI parsing - uses moderate compression
 * Preserves key information while reducing token count
 */
export async function compressResume(resumeText: string): Promise<CompressionResult> {
  return compressText(resumeText, {
    aggressiveness: 0.4,  // Moderate - preserve important details
    min_output_tokens: 100  // Don't over-compress short resumes
  })
}

/**
 * Create a TL;DR summary - aggressive compression for quick scanning
 */
export async function createTLDR(text: string, maxTokens: number = 50): Promise<CompressionResult> {
  return compressText(text, {
    aggressiveness: 0.8,  // Aggressive for ultra-short summaries
    max_output_tokens: maxTokens
  })
}

/**
 * Compress AI summary for card display
 */
export async function compressSummary(summary: string): Promise<CompressionResult> {
  return compressText(summary, {
    aggressiveness: 0.6,
    max_output_tokens: 100
  })
}

/**
 * Get session compression statistics
 */
export function getCompressionStats(): CompressionStats {
  return { ...sessionStats }
}

/**
 * Reset session statistics
 */
export function resetCompressionStats(): void {
  sessionStats = {
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_tokens_saved: 0,
    total_compression_time: 0,
    average_compression_ratio: 1,
    compressions_count: 0
  }
}

/**
 * Calculate estimated cost savings (assuming $0.01 per 1K tokens)
 */
export function calculateCostSavings(tokensSaved: number, costPer1kTokens: number = 0.01): number {
  return (tokensSaved / 1000) * costPer1kTokens
}

/**
 * Batch compress multiple texts
 */
export async function batchCompress(
  texts: string[],
  settings: CompressionSettings = {}
): Promise<CompressionResult[]> {
  // Process in parallel for speed
  return Promise.all(texts.map(text => compressText(text, settings)))
}
