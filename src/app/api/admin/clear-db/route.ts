import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CandidateModel from '@/models/Candidate'
import JobModel from '@/models/Job'

/**
 * Clear all data from MongoDB (admin endpoint)
 * Use with caution - this deletes ALL jobs and candidates!
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    await connectDB()

    // Delete all candidates
    const candidatesResult = await CandidateModel.deleteMany({})
    
    // Delete all jobs
    const jobsResult = await JobModel.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      deleted: {
        candidates: candidatesResult.deletedCount,
        jobs: jobsResult.deletedCount
      }
    })
  } catch (error) {
    console.error('Error clearing database:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to clear database'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
