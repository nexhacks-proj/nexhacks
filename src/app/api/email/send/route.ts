import { NextRequest, NextResponse } from 'next/server'
import { generateInterviewEmail, generateHTMLEmail } from '@/lib/email'
import { Candidate, Job } from '@/types'

interface SendEmailRequest {
  candidate: Candidate
  job: Job
  founderInfo?: {
    name?: string
    company?: string
    email?: string
    schedulingLink?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json()
    const { candidate, job, founderInfo } = body

    if (!candidate || !candidate.email || !job) {
      return NextResponse.json(
        { error: 'Missing required fields: candidate, candidate.email, and job' },
        { status: 400 }
      )
    }

    // Generate email template
    const emailTemplate = generateInterviewEmail(candidate, job, founderInfo)
    const htmlBody = generateHTMLEmail(emailTemplate)

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      // In development/demo mode, log the email instead of actually sending
      console.log('\n📧 EMAIL WOULD BE SENT:')
      console.log('To:', candidate.email)
      console.log('Subject:', emailTemplate.subject)
      console.log('Body:', emailTemplate.body)
      console.log('---\n')

      return NextResponse.json({
        success: true,
        sent: false,
        demo: true,
        message: 'Email logged (RESEND_API_KEY not configured)',
        email: {
          to: candidate.email,
          subject: emailTemplate.subject,
          body: emailTemplate.body
        }
      })
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: founderInfo?.email || 'onboarding@resend.dev', // Use your verified domain
        to: candidate.email,
        subject: emailTemplate.subject,
        html: htmlBody,
        text: emailTemplate.body,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('Resend API error:', errorData)
      throw new Error(`Failed to send email: ${resendResponse.statusText}`)
    }

    const result = await resendResponse.json()

    return NextResponse.json({
      success: true,
      sent: true,
      messageId: result.id,
      email: {
        to: candidate.email,
        subject: emailTemplate.subject,
      }
    })
  } catch (error) {
    console.error('Error sending email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
