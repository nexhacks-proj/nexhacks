import { NextRequest, NextResponse } from 'next/server'
import { saveJob } from '@/lib/jobStore'
import { Job } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const jobData = body as Omit<Job, 'id' | 'createdAt'>

    // Validate required fields
    if (!jobData.title || !jobData.experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields (title, experienceLevel)' },
        { status: 400 }
      )
    }

    // Generate job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create job object
    const job: Job = {
      ...jobData,
      id: jobId,
      createdAt: new Date()
    }

    // Save job to MongoDB
    console.log(`[jobs/create] About to save job "${job.title}" (${job.id})...`)
    try {
      await saveJob(job)
      console.log(`[jobs/create] ✅ Successfully saved job "${job.title}"`)
    } catch (error) {
      console.error('[jobs/create] ❌ Failed to save job:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      job
    })
  } catch (error) {
    console.error('Error creating job:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create job'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
