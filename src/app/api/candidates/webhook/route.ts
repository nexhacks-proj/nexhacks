import { NextRequest, NextResponse } from 'next/server'
import { getWebhookCandidates, getAllWebhookCandidates, clearWebhookCandidates } from '@/lib/webhookStore'

// GET - Fetch candidates received via webhook
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId')

  if (jobId) {
    const candidates = getWebhookCandidates(jobId)
    return NextResponse.json({ candidates })
  }

  // Return all webhook candidates if no jobId specified
  const candidates = getAllWebhookCandidates()
  return NextResponse.json({ candidates })
}

// DELETE - Clear webhook candidates (useful for testing)
export async function DELETE(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId')
  clearWebhookCandidates(jobId || undefined)

  return NextResponse.json({
    success: true,
    message: jobId ? `Cleared webhook candidates for job ${jobId}` : 'Cleared all webhook candidates'
  })
}
