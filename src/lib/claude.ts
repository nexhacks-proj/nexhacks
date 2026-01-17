import Anthropic from '@anthropic-ai/sdk'
import type {
  CandidateProfile,
  SwipeCard,
  EmailDraft,
  JobContext,
  FounderPreferences,
} from '@/types/agent'

// Phoenix tracing (optional - only if configured)
// Supports both @arizeai/phoenix-client and arize-ai packages
let phoenixClient: any = null
let phoenixSpan: any = null

export function initializePhoenix() {
  if (!phoenixClient && typeof window === 'undefined') {
    // Only initialize on server-side
    try {
      // Try @arizeai/phoenix-client first (official package)
      try {
        const { createClient } = require('@arizeai/phoenix-client')
        phoenixClient = createClient({
          options: {
            baseUrl: process.env.PHOENIX_HOST || process.env.PHOENIX_BASE_URL || 'http://localhost:6006',
            headers: process.env.PHOENIX_API_KEY
              ? { Authorization: `Bearer ${process.env.PHOENIX_API_KEY}` }
              : {},
          },
        })
      } catch {
        // Fallback to arize-ai if available
        const phoenix = require('arize-ai')
        if (phoenix?.phoenix?.Client) {
          phoenixClient = phoenix.phoenix.Client({
            projectName: process.env.PHOENIX_PROJECT_NAME || 'hiring-agent',
            apiKey: process.env.PHOENIX_API_KEY,
          })
        } else if (phoenix?.Client) {
          phoenixClient = phoenix.Client({
            projectName: process.env.PHOENIX_PROJECT_NAME || 'hiring-agent',
            apiKey: process.env.PHOENIX_API_KEY,
          })
        }
      }
    } catch (error) {
      // Phoenix is optional - continue without tracing
      console.warn('Phoenix not available, continuing without tracing')
    }
  }
  return phoenixClient
}

// Try to use OpenInference for tracing if available
export function initializeTracing() {
  if (typeof window !== 'undefined') return null
  
  try {
    // Try @arizeai/openinference-core for span support
    const openInference = require('@arizeai/openinference-core')
    if (openInference?.withSpan) {
      phoenixSpan = openInference
      return openInference
    }
  } catch {
    // Not available, that's okay
  }
  return null
}

// Initialize Claude client
function getClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }
  return new Anthropic({ apiKey })
}

// Helper to extract JSON from response (handles markdown code blocks)
function extractJSON(text: string): any {
  let jsonText = text.trim()
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '')
  }
  return JSON.parse(jsonText)
}

// Helper to create a Phoenix span (if available)
async function withSpan<T>(
  name: string,
  attributes: Record<string, any>,
  fn: () => Promise<T>
): Promise<T> {
  // Try OpenInference first (preferred for tracing)
  const tracing = initializeTracing()
  if (tracing?.withSpan) {
    return tracing.withSpan(name, { attributes }, fn)
  }

  // Fallback: try Phoenix client directly
  const client = initializePhoenix()
  if (!client) {
    // No Phoenix, just run the function
    return fn()
  }

  // If client has startSpan method, use it
  try {
    if (typeof client.startSpan === 'function') {
      const span = client.startSpan(name, { attributes })
      try {
        const result = await fn()
        if (span?.end) {
          span.end({ status: { statusCode: 'OK' } })
        }
        return result
      } catch (error) {
        if (span?.end) {
          span.end({
            status: {
              statusCode: 'ERROR',
              description: error instanceof Error ? error.message : String(error),
            },
          })
        }
        throw error
      }
    }
  } catch (error) {
    // If span creation fails, just run the function
  }

  // No tracing available, just run the function
  return fn()
}

// ===== STEP 1: Extract Candidate Profile =====
export async function extractCandidateProfile(
  resumeText: string,
  jobContext: JobContext,
  promptVariant: 'A' | 'B' = 'A'
): Promise<CandidateProfile> {
  return withSpan(
    'extract_candidate_profile',
    {
      'prompt.variant': promptVariant,
      'job.title': jobContext.job_title,
      'resume.length': resumeText.length,
    },
    async () => {
      const client = getClaudeClient()

      // Prompt A (original) vs Prompt B (variant for A/B testing)
      const systemPrompt = `You are a resume parsing engine for a hiring assistant. 
Return ONLY valid JSON that matches the provided schema.
Do not include markdown, commentary, or extra text.
If a field is unknown, use null or "unknown" exactly as specified.`

      const userPrompt = `Extract a structured candidate profile from the resume text below.

JOB CONTEXT (for interpreting relevance):
- Job title: ${jobContext.job_title}
- Required skills: ${jobContext.required_skills.join(', ')}
- Nice-to-have: ${jobContext.nice_to_have.join(', ')}
- Location/remote: ${jobContext.location_policy}
- Sponsorship policy: ${jobContext.sponsorship_policy}

RESUME TEXT:
${resumeText}

Return ONLY JSON with this exact schema:
{
  "candidate": {
    "full_name": "string or 'unknown'",
    "email": "string or 'unknown'",
    "location": "string or 'unknown'",
    "links": {
      "github": "string or null",
      "linkedin": "string or null",
      "portfolio": "string or null"
    },
    "education": [
      {
        "school": "string",
        "degree": "string or null",
        "major": "string or null",
        "graduation": "string or null"
      }
    ],
    "work_auth": {
      "status": "citizen|permanent_resident|visa|needs_sponsorship|unknown",
      "evidence": "short quote from resume or 'unknown'"
    },
    "years_experience_estimate": "number or null",
    "skills": {
      "programming_languages": ["string"],
      "frameworks": ["string"],
      "tools": ["string"],
      "cloud": ["string"]
    },
    "experience": [
      {
        "company": "string",
        "title": "string",
        "dates": "string or null",
        "bullets": ["string"],
        "impact_metrics": ["string"]
      }
    ],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "tech": ["string"],
        "impact_metrics": ["string"],
        "link": "string or null"
      }
    ],
    "top_signals": ["3 to 6 short phrases that are strongest signals for hiring"]
  }
}

Rules:
- Keep bullets concise.
- Prefer exact phrases from the resume for evidence/metrics when possible.
- If email is not present, return "unknown".`

      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const profile = extractJSON(content.text) as CandidateProfile

      // Validate JSON structure
      if (!profile.candidate) {
        throw new Error('Invalid profile structure: missing candidate field')
      }

      return profile
    }
  )
}

// ===== STEP 2: Score + Create Swipe Card =====
export async function scoreAndCreateCard(
  profile: CandidateProfile,
  jobContext: JobContext,
  promptVariant: 'A' | 'B' = 'A'
): Promise<SwipeCard> {
  return withSpan(
    'score_and_create_card',
    {
      'prompt.variant': promptVariant,
      'job.title': jobContext.job_title,
      'candidate.name': profile.candidate.full_name,
    },
    async () => {
      const client = getClaudeClient()

      const systemPrompt = `You are an explainable hiring decision assistant.
Return ONLY valid JSON that matches the schema.
Never mention protected characteristics (race, gender, religion, etc.).
Base everything on job-relevant evidence from the extracted profile.`

      const userPrompt = `You will receive:
1) The job requirements
2) The extracted candidate profile JSON

Your job:
- Compute a fit score from 0 to 100.
- Produce a swipe-card output that is concise and mobile-friendly.
- Provide top reasons + top concern grounded in evidence.
- Add tags grouped into strong/partial/missing aligned to the job requirements.
- Recommend one of: "interview" | "save" | "archive"

JOB:
{
  "job_title": "${jobContext.job_title}",
  "required_skills": ${JSON.stringify(jobContext.required_skills)},
  "nice_to_have": ${JSON.stringify(jobContext.nice_to_have)},
  "experience_level": "${jobContext.experience_level}", 
  "location_policy": "${jobContext.location_policy}",
  "sponsorship_policy": "${jobContext.sponsorship_policy}"
}

CANDIDATE_PROFILE_JSON:
${JSON.stringify(profile, null, 2)}

Return ONLY JSON with this exact schema:
{
  "card": {
    "name": "string",
    "role": "string",
    "headline": "max 8 words, punchy but professional",
    "subheadline": "max 10 words, includes 2 key skills",
    "score": 0,
    "tags": {
      "strong": ["1-4 items"],
      "partial": ["0-4 items"],
      "missing": ["0-4 items"]
    },
    "highlight": "one standout project/impact line, max 12 words",
    "ai_summary": "max 2 sentences, friendly-professional, no fluff",
    "top_reasons": ["exactly 3 bullets, each <= 10 words"],
    "top_concern": "one bullet <= 12 words",
    "recommended_action": "interview|save|archive",
    "confidence": 0.0
  },
  "evidence": {
    "reason_evidence": [
      {"reason": "string", "resume_evidence": "short quote or paraphrase"}
    ],
    "concern_evidence": "short quote or paraphrase or 'none'"
  }
}

Scoring rules:
- Required skills coverage is the biggest weight.
- Strong impact metrics and shipped projects increase score.
- If sponsorship policy conflicts with candidate work_auth, set recommended_action="archive" and explain in top_concern.
- Confidence is 0.0 to 1.0 based on evidence completeness.`

      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const card = extractJSON(content.text) as SwipeCard

      // Validate structure
      if (!card.card || !card.evidence) {
        throw new Error('Invalid card structure: missing card or evidence field')
      }

      return card
    }
  )
}

// ===== STEP 3: Generate Email + Questions =====
export async function generateEmail(
  card: SwipeCard,
  jobContext: JobContext,
  founderPrefs: FounderPreferences,
  promptVariant: 'A' | 'B' = 'A'
): Promise<EmailDraft> {
  return withSpan(
    'generate_email',
    {
      'prompt.variant': promptVariant,
      'job.title': jobContext.job_title,
      'founder.name': founderPrefs.founder_name,
    },
    async () => {
      const client = getClaudeClient()

      const systemPrompt = `You are a startup recruiter assistant writing concise, high-converting outreach emails.
Return ONLY valid JSON matching the schema.
Tone: friendly, professional, efficient. No slang, no emojis.
Personalize using candidate evidence (projects/experience) without sounding creepy.`

      const userPrompt = `Write an interview invitation email based on:
- Founder preferences
- Job info
- The swipe-card + evidence

FOUNDER_PREFS:
{
  "founder_name": "${founderPrefs.founder_name}",
  "company_name": "${founderPrefs.company_name}",
  "founder_title": "${founderPrefs.founder_title}",
  "tone": "${founderPrefs.tone}", 
  "interview_type": "${founderPrefs.interview_type}", 
  "time_window": "${founderPrefs.time_window}",
  "scheduling_link": ${founderPrefs.scheduling_link ? `"${founderPrefs.scheduling_link}"` : 'null'},
  "location_policy": "${founderPrefs.location_policy}",
  "compensation_note": ${founderPrefs.compensation_note ? `"${founderPrefs.compensation_note}"` : 'null'}
}

JOB:
{
  "job_title": "${jobContext.job_title}"
}

CARD_JSON:
${JSON.stringify(card, null, 2)}

Return ONLY JSON with this exact schema:
{
  "email": {
    "subject_options": ["exactly 3 subject lines"],
    "body": "email body, 120-180 words max",
    "personalization_hooks": ["exactly 2 short hooks referencing candidate evidence"],
    "next_steps": ["exactly 2 bullets with clear actions"]
  },
  "interview_pack": {
    "suggested_questions": [
      "exactly 3 questions: 1 project-based, 1 skill-based, 1 behavioral"
    ],
    "internal_notes": ["exactly 2 notes for interviewer, concise"]
  }
}

Email requirements:
- Start with a clear reason you're reaching out.
- Include 2 personalization hooks referencing candidate projects/experience.
- State interview length + format (e.g., 20-min call).
- If scheduling_link is provided, include it as the primary CTA.
- If not provided, ask for 2-3 availability slots.
- End with a polite close and signature (founder name + company).`

      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const email = extractJSON(content.text) as EmailDraft

      // Validate structure
      if (!email.email || !email.interview_pack) {
        throw new Error('Invalid email structure: missing email or interview_pack field')
      }

      return email
    }
  )
}

// ===== UNIFIED PIPELINE =====
export async function runPipeline(
  resumeText: string,
  jobContext: JobContext,
  founderPrefs: FounderPreferences,
  options: {
    promptVariant?: 'A' | 'B'
    enableTracing?: boolean
  } = {}
): Promise<{
  profile: CandidateProfile
  card: SwipeCard
  email: EmailDraft
  traceId?: string
}> {
  const { promptVariant = 'A', enableTracing = true } = options

  if (enableTracing) {
    initializePhoenix()
  }

  const traceId = enableTracing && phoenixClient
    ? `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    : undefined

  // Step 1: Extract
  const profile = await extractCandidateProfile(resumeText, jobContext, promptVariant)

  // Step 2: Score + Card
  const card = await scoreAndCreateCard(profile, jobContext, promptVariant)

  // Step 3: Email
  const email = await generateEmail(card, jobContext, founderPrefs, promptVariant)

  return {
    profile,
    card,
    email,
    traceId,
  }
}
