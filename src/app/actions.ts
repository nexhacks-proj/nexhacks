'use server'

import { batchParseResumes } from '@/lib/gemini'
import { Job } from '@/types'

export async function reprocessResumesAction(
  candidates: Array<{ id: string; name: string; email: string; rawResume: string }>,
  job: Job
) {
  // This runs on the server, so process.env.GEMINI_API_KEY will be available
  // provided it's in .env or .env.local
  return await batchParseResumes(candidates, job)
}
