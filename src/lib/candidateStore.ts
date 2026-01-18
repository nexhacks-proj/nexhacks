import { Candidate } from '@/types'
import connectDB, { MONGODB_ENABLED } from './db'

// Dynamically import models only if MongoDB is enabled - using lazy import to avoid build-time errors
let CandidateModel: any = null
async function getCandidateModel() {
  if (!MONGODB_ENABLED) return null
  if (CandidateModel) return CandidateModel
  
  try {
    // Use dynamic import at runtime, not build time
    const modelModule = await import('@/models/Candidate')
    CandidateModel = modelModule.default
    return CandidateModel
  } catch (error) {
    console.warn('[candidateStore] Candidate model not available:', error)
    return null
  }
}

/**
 * Save a candidate to MongoDB
 */
export async function saveCandidate(candidate: Candidate): Promise<void> {
  const model = await getCandidateModel()
  if (!MONGODB_ENABLED || !model) {
    console.warn('[candidateStore] MongoDB not available, skipping save. Candidate stored locally only.')
    return
  }
  
  await connectDB()
  await model.findOneAndUpdate(
    { id: candidate.id },
    candidate,
    { upsert: true, new: true }
  )
}

/**
 * Save multiple candidates to MongoDB
 */
export async function saveCandidates(candidates: Candidate[]): Promise<void> {
  if (candidates.length === 0) {
    console.log('[candidateStore] No candidates to save')
    return
  }
  
  const model = await getCandidateModel()
  if (!MONGODB_ENABLED || !model) {
    console.warn('[candidateStore] MongoDB not available, skipping save. Candidates stored locally only.')
    return
  }
  
  try {
    await connectDB()
    console.log(`[candidateStore] Saving ${candidates.length} candidate(s) to MongoDB...`)
    
    // Use bulkWrite for efficiency
    const operations = candidates.map(candidate => ({
      updateOne: {
        filter: { id: candidate.id },
        update: { $set: candidate },
        upsert: true
      }
    }))
    
    const result = await model.bulkWrite(operations)
    console.log(`[candidateStore] ✅ Saved ${result.upsertedCount + result.modifiedCount} candidate(s) (${result.upsertedCount} new, ${result.modifiedCount} updated)`)
  } catch (error) {
    console.error('[candidateStore] ❌ Error saving candidates:', error)
    throw error
  }
}

/**
 * Get candidates by job ID from database
 */
export async function getCandidatesByJobId(jobId: string): Promise<Candidate[]> {
  const model = await getCandidateModel()
  if (!MONGODB_ENABLED || !model) {
    return []
  }
  
  await connectDB()
  const docs = await model.find({ jobId }).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    swipedAt: doc.swipedAt ? new Date(doc.swipedAt) : undefined
  })) as Candidate[]
}

/**
 * Get all candidates from database
 */
export async function getAllCandidates(): Promise<Candidate[]> {
  const model = await getCandidateModel()
  if (!MONGODB_ENABLED || !model) {
    return []
  }
  
  await connectDB()
  const docs = await model.find({}).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    swipedAt: doc.swipedAt ? new Date(doc.swipedAt) : undefined
  })) as Candidate[]
}
