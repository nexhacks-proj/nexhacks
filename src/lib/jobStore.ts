import { Job } from '@/types'
import connectDB from './db'
import JobModel from '@/models/Job'
import { shouldUseMongoDB } from './storageConfig'

/**
 * Save a job to MongoDB (only in production)
 */
export async function saveJob(job: Job): Promise<void> {
  if (!shouldUseMongoDB()) {
    console.log('[jobStore] Skipping MongoDB save (local dev mode - using localStorage)')
    return
  }
  
  try {
    await connectDB()
    console.log(`[jobStore] Saving job "${job.title}" (${job.id}) to MongoDB...`)
    const result = await JobModel.findOneAndUpdate(
      { id: job.id },
      { $set: job },
      { upsert: true, new: true }
    )
    console.log(`[jobStore] ✅ Job saved successfully: ${result ? result.id : 'unknown'}`)
  } catch (error) {
    console.error('[jobStore] ❌ Error saving job:', error)
    throw error
  }
}

/**
 * Get job by ID from database
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  if (!shouldUseMongoDB()) {
    return null
  }
  
  await connectDB()
  const doc = await JobModel.findOne({ id: jobId }).lean()
  if (!doc) return null
  
  return {
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date()
  } as Job
}

/**
 * Get all jobs from database
 */
export async function getAllJobs(): Promise<Job[]> {
  if (!shouldUseMongoDB()) {
    return []
  }
  
  await connectDB()
  const docs = await JobModel.find({}).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date()
  })) as Job[]
}
