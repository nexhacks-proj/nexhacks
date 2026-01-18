import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI } from '@/lib/gemini'
import { saveCandidate } from '@/lib/candidateStore'
import { Job, Candidate } from '@/types'

// This endpoint uses Gemini AI for resume parsing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rawResume, name, email, job } = body

    if (!rawResume || !name || !email || !job) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Debug: Check environment variable
    console.log('[DEBUG] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV)
    
    // Use Gemini AI to parse the resume
    const parsed = await parseResumeWithAI(rawResume, job as Job)

    // Generate candidate ID
    const candidateId = `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Build full candidate object
    const candidate: Candidate = {
      id: candidateId,
      jobId: job.id,
      name,
      email,
      rawResume,
      ...parsed,
      status: 'pending' as const
    }

    // Save candidate to MongoDB
    await saveCandidate(candidate)

    return NextResponse.json({
      success: true,
      candidate
    })
  } catch (error) {
    console.error('Error parsing candidate:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse resume'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
