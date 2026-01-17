/**
 * Test Script for 3-Step AI Agent Pipeline
 * 
 * Run with: npx tsx test-pipeline.ts
 * Or: node --loader ts-node/esm test-pipeline.ts
 */

import { runPipeline } from './src/lib/claude'
import { jobToJobContext, getDefaultFounderPreferences } from './src/lib/pipeline-helpers'
import { computeMetrics } from './src/lib/ab-testing'
import type { Job } from './src/types'

// Test resume text
const testResume = `
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

// Test job
const testJob: Job = {
  id: 'test-job-123',
  title: 'Senior Full-Stack Engineer',
  techStack: ['React', 'TypeScript', 'Node.js', 'AWS'],
  experienceLevel: '3+',
  visaSponsorship: false,
  startupExperiencePreferred: true,
  portfolioRequired: false,
  createdAt: new Date(),
}

async function testPipeline() {
  console.log('🧪 Testing 3-Step AI Agent Pipeline\n')
  console.log('=' .repeat(50))

  try {
    // Check environment
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ERROR: ANTHROPIC_API_KEY not set in environment')
      console.log('\n💡 Add to .env.local:')
      console.log('   ANTHROPIC_API_KEY=your-key-here\n')
      process.exit(1)
    }

    console.log('✅ Environment check passed\n')

    // Setup
    console.log('📋 Setting up test data...')
    const jobContext = jobToJobContext(testJob)
    const founderPrefs = getDefaultFounderPreferences('Test Company', 'Test Founder')
    founderPrefs.tone = 'friendly'
    founderPrefs.interview_type = '20-min call'
    founderPrefs.scheduling_link = 'https://cal.com/test'
    console.log('✅ Test data ready\n')

    // Run pipeline
    console.log('🚀 Running pipeline (this may take 30-60 seconds)...\n')
    const startTime = Date.now()

    const result = await runPipeline(
      testResume,
      jobContext,
      founderPrefs,
      {
        promptVariant: 'A',
        enableTracing: false, // Disable for testing if Phoenix not set up
      }
    )

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Pipeline completed in ${duration}s\n`)

    // Test Step 1: Profile Extraction
    console.log('=' .repeat(50))
    console.log('📋 STEP 1: Profile Extraction\n')
    
    if (!result.profile?.candidate) {
      throw new Error('Profile extraction failed: missing candidate data')
    }

    console.log(`✅ Name: ${result.profile.candidate.full_name}`)
    console.log(`✅ Email: ${result.profile.candidate.email}`)
    console.log(`✅ Experience: ${result.profile.candidate.years_experience_estimate || 'N/A'} years`)
    console.log(`✅ Skills: ${result.profile.candidate.skills.programming_languages.length} languages`)
    console.log(`✅ Projects: ${result.profile.candidate.projects.length} projects`)
    console.log(`✅ Experience entries: ${result.profile.candidate.experience.length}`)

    // Test Step 2: Card Scoring
    console.log('\n' + '=' .repeat(50))
    console.log('🎯 STEP 2: Card Scoring\n')

    if (!result.card?.card) {
      throw new Error('Card generation failed: missing card data')
    }

    const card = result.card.card
    console.log(`✅ Score: ${card.score}/100`)
    console.log(`✅ Headline: ${card.headline}`)
    console.log(`✅ Recommended: ${card.recommended_action}`)
    console.log(`✅ Confidence: ${(card.confidence * 100).toFixed(1)}%`)
    console.log(`✅ Top Reasons: ${card.top_reasons.length} reasons`)
    console.log(`✅ Tags - Strong: ${card.tags.strong.length}, Partial: ${card.tags.partial.length}, Missing: ${card.tags.missing.length}`)

    // Validate card structure
    if (card.top_reasons.length !== 3) {
      console.warn(`⚠️  Warning: Expected 3 top reasons, got ${card.top_reasons.length}`)
    }

    // Test Step 3: Email Generation
    console.log('\n' + '=' .repeat(50))
    console.log('📧 STEP 3: Email Generation\n')

    if (!result.email?.email) {
      throw new Error('Email generation failed: missing email data')
    }

    const email = result.email.email
    console.log(`✅ Subject options: ${email.subject_options.length}`)
    console.log(`✅ Personalization hooks: ${email.personalization_hooks.length}`)
    console.log(`✅ Next steps: ${email.next_steps.length}`)
    console.log(`✅ Body length: ${email.body.split(' ').length} words`)
    console.log(`✅ Interview questions: ${result.email.interview_pack.suggested_questions.length}`)

    // Validate email structure
    if (email.subject_options.length !== 3) {
      console.warn(`⚠️  Warning: Expected 3 subject options, got ${email.subject_options.length}`)
    }
    if (email.personalization_hooks.length !== 2) {
      console.warn(`⚠️  Warning: Expected 2 hooks, got ${email.personalization_hooks.length}`)
    }

    // Compute metrics
    console.log('\n' + '=' .repeat(50))
    console.log('📊 METRICS\n')

    const metrics = computeMetrics(
      result.profile,
      result.card,
      result.email,
      'A',
      result.traceId
    )

    console.log(`✅ Valid JSON: ${metrics.validJSON ? 'YES' : 'NO'}`)
    console.log(`✅ Skill Coverage: ${(metrics.requiredSkillCoverage * 100).toFixed(1)}%`)
    console.log(`✅ Email Has Hooks: ${metrics.emailHasHooks ? 'YES' : 'NO'}`)
    console.log(`✅ Email Has Next Steps: ${metrics.emailHasNextSteps ? 'YES' : 'NO'}`)
    console.log(`✅ Card Has Evidence: ${metrics.cardHasEvidence ? 'YES' : 'NO'}`)

    // Summary
    console.log('\n' + '=' .repeat(50))
    console.log('✅ ALL TESTS PASSED!\n')

    console.log('📋 Sample Output:')
    console.log(`   Name: ${result.profile.candidate.full_name}`)
    console.log(`   Score: ${card.score}/100`)
    console.log(`   Action: ${card.recommended_action}`)
    console.log(`   Email Subject 1: ${email.subject_options[0]}`)

    console.log('\n💡 Next steps:')
    console.log('   1. Test with different resumes')
    console.log('   2. Test A/B variants (promptVariant: "B")')
    console.log('   3. Set up Phoenix tracing for production')
    console.log('   4. Integrate with your UI components\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED\n')
    console.error('Error:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }

    console.log('\n💡 Troubleshooting:')
    console.log('   1. Check ANTHROPIC_API_KEY is set')
    console.log('   2. Verify Claude API key is valid')
    console.log('   3. Check network connection')
    console.log('   4. Review error message above\n')

    process.exit(1)
  }
}

// Run test
testPipeline()
