import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI } from '@/lib/gemini'
import { Job } from '@/types'

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

    return NextResponse.json({
      success: true,
      candidate: {
        name,
        email,
        rawResume,
        ...parsed
      }
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
