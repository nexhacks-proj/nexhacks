import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI } from '@/lib/cerebras'
import { addWebhookCandidate } from '@/lib/webhookStore'
import { Job, Candidate } from '@/types'

// Webhook payload types for different ATS systems
interface ATSWebhookPayload {
  // Candidate info
  candidate: {
    name: string
    email: string
    phone?: string
  }
  // Resume - supports multiple formats
  resume: {
    // Raw text content
    text?: string
    // Base64 encoded file (PDF, DOCX)
    base64?: string
    fileType?: 'pdf' | 'docx' | 'doc' | 'txt'
    // URL to fetch resume from
    url?: string
  }
  // Job reference - either full job object or ID to look up
  job: Job | { id: string }
  // Optional metadata from ATS
  metadata?: {
    source?: string // e.g., "workday", "greenhouse", "lever"
    applicationId?: string
    appliedAt?: string
    [key: string]: unknown
  }
}

// Validate webhook API key
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  const expectedKey = process.env.WEBHOOK_API_KEY

  // If no webhook key is configured, allow all requests (development mode)
  if (!expectedKey) {
    console.warn('WEBHOOK_API_KEY not configured - webhook endpoint is unprotected')
    return true
  }

  return apiKey === expectedKey
}

// Extract text from base64 encoded file
async function extractTextFromBase64(base64: string, fileType: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')

  if (fileType === 'txt') {
    return buffer.toString('utf-8')
  }

  if (fileType === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
  }

  if (fileType === 'docx' || fileType === 'doc') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}

// Fetch resume from URL
async function fetchResumeFromUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch resume from URL: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''

  // Plain text
  if (contentType.includes('text/plain')) {
    return response.text()
  }

  // PDF or Word doc - need to extract text
  const buffer = Buffer.from(await response.arrayBuffer())

  if (contentType.includes('pdf')) {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
  }

  if (contentType.includes('word') || contentType.includes('document')) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  // Try as plain text if content type is unknown
  return buffer.toString('utf-8')
}

export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - invalid or missing API key' },
      { status: 401 }
    )
  }

  try {
    const payload = await request.json() as ATSWebhookPayload

    // Validate required fields
    if (!payload.candidate?.name || !payload.candidate?.email) {
      return NextResponse.json(
        { error: 'Missing required candidate fields (name, email)' },
        { status: 400 }
      )
    }

    if (!payload.resume) {
      return NextResponse.json(
        { error: 'Missing resume data' },
        { status: 400 }
      )
    }

    if (!payload.job) {
      return NextResponse.json(
        { error: 'Missing job data' },
        { status: 400 }
      )
    }

    // Extract resume text from the provided format
    let resumeText: string

    if (payload.resume.text) {
      // Direct text provided
      resumeText = payload.resume.text
    } else if (payload.resume.base64 && payload.resume.fileType) {
      // Base64 encoded file
      resumeText = await extractTextFromBase64(payload.resume.base64, payload.resume.fileType)
    } else if (payload.resume.url) {
      // Fetch from URL
      resumeText = await fetchResumeFromUrl(payload.resume.url)
    } else {
      return NextResponse.json(
        { error: 'Resume must include text, base64 (with fileType), or url' },
        { status: 400 }
      )
    }

    // Get or construct job object
    let job: Job
    if ('title' in payload.job) {
      // Full job object provided
      job = payload.job as Job
    } else {
      // Only job ID provided - would need to look up from store/database
      // For now, return error since we need full job info for AI parsing
      return NextResponse.json(
        { error: 'Full job object required (with title, techStack, etc.) - job ID lookup not yet implemented' },
        { status: 400 }
      )
    }

    // Parse resume with AI
    const parsed = await parseResumeWithAI(resumeText, job)

    // Generate candidate ID
    const candidateId = `ats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Build parsed candidate
    const candidate: Candidate = {
      id: candidateId,
      jobId: job.id,
      name: payload.candidate.name,
      email: payload.candidate.email,
      rawResume: resumeText,
      ...parsed,
      status: 'pending' as const
    }

    // Store candidate server-side for UI access
    await addWebhookCandidate(job.id, candidate)

    return NextResponse.json({
      success: true,
      candidate,
      message: 'Resume processed and stored successfully'
    })
  } catch (error) {
    console.error('Webhook error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process webhook'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Also support GET for webhook verification (some ATS systems require this)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge')

  if (challenge) {
    // Echo back challenge for webhook verification
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'ATS webhook endpoint is active',
    endpoints: {
      POST: 'Submit a new application for processing'
    }
  })
}
