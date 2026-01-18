import { Candidate } from '@/types'
import connectDB from './db'
import CandidateModel from '@/models/Candidate'

export async function addWebhookCandidate(jobId: string, candidate: Candidate): Promise<void> {
  await connectDB()
  await CandidateModel.findOneAndUpdate(
    { id: candidate.id },
    candidate,
    { upsert: true, new: true }
  )
}

export async function getWebhookCandidates(jobId: string): Promise<Candidate[]> {
  await connectDB()
  const docs = await CandidateModel.find({ jobId }).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    swipedAt: doc.swipedAt ? new Date(doc.swipedAt) : undefined
  })) as Candidate[]
}

export async function getAllWebhookCandidates(): Promise<Candidate[]> {
  await connectDB()
  const docs = await CandidateModel.find({}).lean()
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    swipedAt: doc.swipedAt ? new Date(doc.swipedAt) : undefined
  })) as Candidate[]
}

export async function clearWebhookCandidates(jobId?: string): Promise<void> {
  await connectDB()
  if (jobId) {
    await CandidateModel.deleteMany({ jobId })
  } else {
    await CandidateModel.deleteMany({})
  }
}

export async function removeWebhookCandidate(candidateId: string): Promise<boolean> {
  await connectDB()
  const result = await CandidateModel.deleteOne({ id: candidateId })
  return result.deletedCount > 0
}
