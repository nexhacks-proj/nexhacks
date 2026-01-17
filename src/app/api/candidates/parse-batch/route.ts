import { NextRequest, NextResponse } from 'next/server'
import { parseMultipleResumesWithAI } from '@/lib/gemini'
import { Job } from '@/types'

interface ResumeInput {
  id: string
  name: string
  email: string
  rawResume: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resumes, job } = body as { resumes: ResumeInput[]; job: Job }

    if (!resumes || !Array.isArray(resumes) || resumes.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty resumes array' },
        { status: 400 }
      )
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Missing job data' },
        { status: 400 }
      )
    }

    // Validate each resume has required fields
    for (const resume of resumes) {
      if (!resume.id || !resume.name || !resume.email || !resume.rawResume) {
        return NextResponse.json(
          { error: 'Each resume must have id, name, email, and rawResume fields' },
          { status: 400 }
        )
      }
    }

    const parsedResults = await parseMultipleResumesWithAI(resumes, job)

    // Map parsed results back to candidates with full data
    const candidates = resumes.map(resume => {
      const parsed = parsedResults.find(p => p.id === resume.id)
      if (parsed) {
        const { id, ...parseResult } = parsed
        return {
          id: resume.id,
          name: resume.name,
          email: resume.email,
          rawResume: resume.rawResume,
          ...parseResult
        }
      }
      // Fallback if parsing failed for this resume
      return {
        id: resume.id,
        name: resume.name,
        email: resume.email,
        rawResume: resume.rawResume,
        skills: [],
        yearsOfExperience: 0,
        projects: [],
        education: [],
        workHistory: [],
        topStrengths: ['Unable to parse resume'],
        standoutProject: 'Resume parsing failed',
        aiSummary: 'AI parsing failed for this candidate. Please review manually.'
      }
    })

    return NextResponse.json({
      success: true,
      candidates
    })
  } catch (error) {
    console.error('Error batch parsing candidates:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to batch parse resumes'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
