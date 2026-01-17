import { NextRequest, NextResponse } from 'next/server'
import { runPipeline } from '@/lib/claude'
import { jobToJobContext, getDefaultFounderPreferences } from '@/lib/pipeline-helpers'
import type { Job } from '@/types'
import type { FounderPreferences } from '@/types/agent'

/**
 * New 3-step pipeline endpoint
 * POST /api/candidates/pipeline
 * 
 * Body:
 * {
 *   rawResume: string
 *   job: Job
 *   founderPrefs?: FounderPreferences (optional, uses defaults if not provided)
 *   promptVariant?: 'A' | 'B' (for A/B testing)
 *   enableTracing?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rawResume, job, founderPrefs, promptVariant, enableTracing } = body

    if (!rawResume || !job) {
      return NextResponse.json(
        { error: 'Missing required fields: rawResume and job are required' },
        { status: 400 }
      )
    }

    // Convert job to job context
    const jobContext = jobToJobContext(job as Job)

    // Use provided founder prefs or defaults
    const prefs: FounderPreferences = founderPrefs || getDefaultFounderPreferences()

    // Run the 3-step pipeline
    const result = await runPipeline(
      rawResume,
      jobContext,
      prefs,
      {
        promptVariant: (promptVariant as 'A' | 'B') || 'A',
        enableTracing: enableTracing !== false, // Default to true
      }
    )

    return NextResponse.json({
      success: true,
      profile: result.profile,
      card: result.card,
      email: result.email,
      traceId: result.traceId,
      promptVariant: promptVariant || 'A',
    })
  } catch (error) {
    console.error('Error running pipeline:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to run pipeline'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
