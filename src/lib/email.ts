// Email template generation and sending utilities

import { Candidate, Job } from '@/types'

export interface EmailTemplate {
  subject: string
  body: string
}

/**
 * Generate a personalized interview invitation email
 */
export function generateInterviewEmail(
  candidate: Candidate,
  job: Job,
  founderInfo?: {
    name?: string
    company?: string
    email?: string
    schedulingLink?: string
  }
): EmailTemplate {
  const founderName = founderInfo?.name || 'Hiring Manager'
  const companyName = founderInfo?.company || 'Our Team'
  const schedulingLink = founderInfo?.schedulingLink

  // Personalize with candidate's standout project or strength
  const personalization = candidate.standoutProject
    ? ` I was particularly impressed by your work on ${candidate.standoutProject.split('.')[0]}.`
    : candidate.topStrengths.length > 0
    ? ` Your experience with ${candidate.topStrengths[0]} stands out to us.`
    : ''

  const subject = `Interview Invitation: ${job.title} at ${companyName}`

  const body = `Hi ${candidate.name.split(' ')[0]},${personalization}

We'd love to discuss the ${job.title} role with you. Your background aligns well with what we're looking for.

${schedulingLink
  ? `Please book a time that works for you: ${schedulingLink}`
  : `Could you please share 2-3 time slots that work for you this week for a brief 20-30 minute conversation?`
}

Looking forward to connecting!

Best regards,
${founderName}
${companyName}${founderInfo?.email ? `\n${founderInfo.email}` : ''}`

  return { subject, body }
}

/**
 * Generate a simple HTML email template
 */
export function generateHTMLEmail(template: EmailTemplate): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="white-space: pre-wrap;">${template.body}</div>
  </div>
  <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
    This email was sent automatically by our hiring system.
  </p>
</body>
</html>
  `.trim()
}
