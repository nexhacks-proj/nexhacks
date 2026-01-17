/**
 * Example: Using the 3-Step AI Agent Pipeline
 * 
 * This example shows how to use the pipeline programmatically
 * (not via API route)
 */

import { runPipeline } from '@/lib/claude'
import { jobToJobContext, getDefaultFounderPreferences } from '@/lib/pipeline-helpers'
import { assignVariant, computeMetrics } from '@/lib/ab-testing'
import type { Job } from '@/types'

// Example resume text
const exampleResume = `
John Doe
Email: john.doe@example.com
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
- Built scalable microservices handling 1M+ requests/day
- Led team of 5 engineers, reduced deployment time by 60%
- Technologies: React, TypeScript, Node.js, AWS, Docker

Software Engineer | StartupXYZ | 2018 - 2020
- Developed full-stack features using React and Python
- Improved API response time by 40%
- Technologies: React, Python, PostgreSQL

EDUCATION

BS Computer Science | Stanford University | 2018

SKILLS
Programming: JavaScript, TypeScript, Python, Java
Frameworks: React, Node.js, Express
Tools: Docker, Kubernetes, AWS, Git
Cloud: AWS (EC2, S3, Lambda)

PROJECTS

E-commerce Platform
- Built full-stack e-commerce platform with React and Node.js
- Handled 10K+ daily active users
- Link: github.com/johndoe/ecommerce
`

// Example job
const exampleJob: Job = {
  id: 'job-123',
  title: 'Senior Full-Stack Engineer',
  techStack: ['React', 'TypeScript', 'Node.js', 'AWS'],
  experienceLevel: '3+',
  visaSponsorship: false,
  startupExperiencePreferred: true,
  portfolioRequired: false,
  createdAt: new Date(),
}

async function runExample() {
  try {
    // Step 1: Convert job to job context
    const jobContext = jobToJobContext(exampleJob)

    // Step 2: Set up founder preferences
    const founderPrefs = getDefaultFounderPreferences(
      'TechCorp',
      'Jane Smith'
    )
    // Customize if needed:
    founderPrefs.tone = 'friendly'
    founderPrefs.interview_type = '30-min video call'
    founderPrefs.scheduling_link = 'https://cal.com/jane-smith'

    // Step 3: Assign A/B test variant
    const candidateId = 'candidate-123'
    const variant = assignVariant(candidateId)
    console.log(`Running with variant: ${variant}`)

    // Step 4: Run the pipeline
    console.log('Running 3-step pipeline...')
    const result = await runPipeline(
      exampleResume,
      jobContext,
      founderPrefs,
      {
        promptVariant: variant,
        enableTracing: true,
      }
    )

    // Step 5: Display results
    console.log('\n=== PIPELINE RESULTS ===\n')

    console.log('📋 PROFILE:')
    console.log(`Name: ${result.profile.candidate.full_name}`)
    console.log(`Email: ${result.profile.candidate.email}`)
    console.log(`Experience: ${result.profile.candidate.years_experience_estimate} years`)
    console.log(`Skills: ${result.profile.candidate.skills.programming_languages.join(', ')}`)

    console.log('\n🎯 CARD:')
    console.log(`Score: ${result.card.card.score}/100`)
    console.log(`Headline: ${result.card.card.headline}`)
    console.log(`Recommended: ${result.card.card.recommended_action}`)
    console.log(`Top Reasons:`)
    result.card.card.top_reasons.forEach((reason, i) => {
      console.log(`  ${i + 1}. ${reason}`)
    })
    console.log(`Concern: ${result.card.card.top_concern}`)

    console.log('\n📧 EMAIL:')
    console.log('Subject Options:')
    result.email.email.subject_options.forEach((subject, i) => {
      console.log(`  ${i + 1}. ${subject}`)
    })
    console.log('\nBody:')
    console.log(result.email.email.body)
    console.log('\nInterview Questions:')
    result.email.interview_pack.suggested_questions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q}`)
    })

    // Step 6: Compute metrics
    const metrics = computeMetrics(
      result.profile,
      result.card,
      result.email,
      variant,
      result.traceId
    )

    console.log('\n📊 METRICS:')
    console.log(`Valid JSON: ${metrics.validJSON}`)
    console.log(`Skill Coverage: ${(metrics.requiredSkillCoverage * 100).toFixed(1)}%`)
    console.log(`Email Has Hooks: ${metrics.emailHasHooks}`)
    console.log(`Email Has Next Steps: ${metrics.emailHasNextSteps}`)
    console.log(`Card Has Evidence: ${metrics.cardHasEvidence}`)
    console.log(`Trace ID: ${metrics.traceId || 'N/A'}`)

  } catch (error) {
    console.error('Pipeline error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack:', error.stack)
    }
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runExample()
}

export { runExample }
