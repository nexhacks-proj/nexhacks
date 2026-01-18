import { NextRequest, NextResponse } from 'next/server'
import { getWebhookCandidates, getAllWebhookCandidates, clearWebhookCandidates } from '@/lib/webhookStore'

// GET - Fetch candidates received via webhook
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (jobId) {
      const candidates = await getWebhookCandidates(jobId)
      return NextResponse.json({ candidates })
    }

    // Return all webhook candidates if no jobId specified
    const candidates = await getAllWebhookCandidates()
    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Error fetching webhook candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}

// DELETE - Clear webhook candidates (useful for testing)
export async function DELETE(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')
    await clearWebhookCandidates(jobId || undefined)

    return NextResponse.json({
      success: true,
      message: jobId ? `Cleared webhook candidates for job ${jobId}` : 'Cleared all webhook candidates'
    })
  } catch (error) {
    console.error('Error clearing webhook candidates:', error)
    return NextResponse.json(
      { error: 'Failed to clear candidates' },
      { status: 500 }
    )
  }
}
