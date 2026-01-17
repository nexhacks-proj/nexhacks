import { Candidate } from '@/types'

// In-memory store for webhook-received candidates
// NOTE: In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
const webhookCandidates: Map<string, Candidate[]> = new Map()

export function addWebhookCandidate(jobId: string, candidate: Candidate): void {
  const existing = webhookCandidates.get(jobId) || []
  existing.push(candidate)
  webhookCandidates.set(jobId, existing)
}

export function getWebhookCandidates(jobId: string): Candidate[] {
  return webhookCandidates.get(jobId) || []
}

export function getAllWebhookCandidates(): Candidate[] {
  const all: Candidate[] = []
  webhookCandidates.forEach(candidates => all.push(...candidates))
  return all
}

export function clearWebhookCandidates(jobId?: string): void {
  if (jobId) {
    webhookCandidates.delete(jobId)
  } else {
    webhookCandidates.clear()
  }
}

export function removeWebhookCandidate(candidateId: string): boolean {
  let found = false
  webhookCandidates.forEach((candidates) => {
    const index = candidates.findIndex((c: Candidate) => c.id === candidateId)
    if (index !== -1) {
      candidates.splice(index, 1)
      found = true
    }
  })
  return found
}
