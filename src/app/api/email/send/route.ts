import { NextRequest, NextResponse } from 'next/server'
import { generateInterviewEmail, generateHTMLEmail } from '@/lib/email'
import { generateEmailWithAgent, extractEmailTemplate, FounderPrefs } from '@/lib/emailAgent'
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
    title?: string
    tone?: 'friendly' | 'professional' | 'casual'
    interviewType?: string
    timeWindow?: string
    compensationNote?: string
  }
  useAgent?: boolean // Set to true to use AI agent, false for template
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json()
    const { candidate, job, founderInfo, useAgent = true } = body

    if (!candidate || !candidate.email || !job) {
      return NextResponse.json(
        { error: 'Missing required fields: candidate, candidate.email, and job' },
        { status: 400 }
      )
    }

    let emailTemplate: { subject: string; body: string }
    let agentMetrics: { latencyMs?: number; inputTokens?: number; outputTokens?: number; model?: string } = {}
    let interviewPack: { suggested_questions: string[]; internal_notes: string[] } | undefined

    if (useAgent) {
      // Use AI agent to generate personalized email
      console.log('[email/send] Using AI agent for email generation')

      const founderPrefs: FounderPrefs = {
        name: founderInfo?.name,
        company: founderInfo?.company,
        title: founderInfo?.title,
        tone: founderInfo?.tone,
        interviewType: founderInfo?.interviewType,
        timeWindow: founderInfo?.timeWindow,
        schedulingLink: founderInfo?.schedulingLink,
        compensationNote: founderInfo?.compensationNote
      }

      const agentResult = await generateEmailWithAgent(candidate, job, founderPrefs)

      if (!agentResult.success || !agentResult.output) {
        console.warn('[email/send] Agent failed, falling back to template:', agentResult.error)
        emailTemplate = generateInterviewEmail(candidate, job, founderInfo)
      } else {
        emailTemplate = extractEmailTemplate(agentResult.output)
        interviewPack = agentResult.output.interview_pack
        agentMetrics = {
          latencyMs: agentResult.latencyMs,
          inputTokens: agentResult.inputTokens,
          outputTokens: agentResult.outputTokens,
          model: agentResult.model
        }
        console.log('[email/send] Agent generated email successfully', agentMetrics)
      }
    } else {
      // Use template-based generation
      console.log('[email/send] Using template for email generation')
      emailTemplate = generateInterviewEmail(candidate, job, founderInfo)
    }

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
      },
      ...(useAgent && {
        agent: {
          ...agentMetrics,
          interviewPack
        }
      })
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
