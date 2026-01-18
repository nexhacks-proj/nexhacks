import { Job } from '@/types'
import connectDB, { MONGODB_ENABLED } from './db'

// Dynamically import models only if MongoDB is enabled - using lazy require to avoid build-time errors
let JobModel: any = null
async function getJobModel() {
  if (!MONGODB_ENABLED) return null
  if (JobModel) return JobModel
  
  try {
    // Use dynamic import at runtime, not build time
    const modelModule = await import('@/models/Job')
    JobModel = modelModule.default
    return JobModel
  } catch (error) {
    console.warn('[jobStore] Job model not available:', error)
    return null
  }
}

/**
 * Save a job to MongoDB
 */
export async function saveJob(job: Job): Promise<void> {
  const model = await getJobModel()
  if (!MONGODB_ENABLED || !model) {
    console.warn('[jobStore] MongoDB not available, skipping save. Job stored locally only.')
    return
  }
  
  try {
    await connectDB()
    console.log(`[jobStore] Saving job "${job.title}" (${job.id}) to MongoDB...`)
    const result = await model.findOneAndUpdate(
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
  const model = await getJobModel()
  if (!MONGODB_ENABLED || !model) {
    return null
  }
  
  await connectDB()
  const doc = await model.findOne({ id: jobId }).lean()
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
  const model = await getJobModel()
  if (!MONGODB_ENABLED || !model) {
    return []
  }
  
  await connectDB()
  const docs = await model.find({}).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date()
  })) as Job[]
}
