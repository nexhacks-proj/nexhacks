import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI } from '@/lib/gemini'
import { Job } from '@/types'

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
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    )
  }
}
