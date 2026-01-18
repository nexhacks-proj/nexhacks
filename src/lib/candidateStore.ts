import { Candidate } from '@/types'
import connectDB from './db'
import CandidateModel from '@/models/Candidate'

/**
 * Save a candidate to MongoDB
 */
export async function saveCandidate(candidate: Candidate): Promise<void> {
  await connectDB()
  await CandidateModel.findOneAndUpdate(
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
    
    const result = await CandidateModel.bulkWrite(operations)
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
  await connectDB()
  const docs = await CandidateModel.find({ jobId }).lean()
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
  await connectDB()
  const docs = await CandidateModel.find({}).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    swipedAt: doc.swipedAt ? new Date(doc.swipedAt) : undefined
  })) as Candidate[]
}
