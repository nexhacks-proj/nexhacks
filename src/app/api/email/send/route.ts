import { NextRequest, NextResponse } from 'next/server'
import { generateInterviewEmail, generateHTMLEmail } from '@/lib/email'
import { Candidate, Job } from '@/types'
import nodemailer from 'nodemailer'

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

    // Get SMTP credentials from environment
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'Email configuration missing. Please set SMTP_USER and SMTP_PASS in .env.local.' },
        { status: 500 }
      )
    }

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${founderInfo?.name || 'Hiring Team'}" <${smtpUser}>`, // sender address
      to: candidate.email, // list of receivers
      subject: emailTemplate.subject, // Subject line
      text: emailTemplate.body, // plain text body
      html: htmlBody, // html body
    })

    console.log('Message sent: %s', info.messageId)

    return NextResponse.json({
      success: true,
      sent: true,
      messageId: info.messageId,
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
