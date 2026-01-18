// Email Agent - AI-powered email generation using Gemini
// Part of the 3-step agent pipeline: Extract → Score → Email

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { Candidate, Job } from '@/types'
import { traceLLMCall, recordLLMMetrics, getCurrentSpan, LLM_ATTRIBUTES } from './tracing'

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

export interface FounderPrefs {
  name?: string
  company?: string
  title?: string
  tone?: 'friendly' | 'professional' | 'casual'
  interviewType?: string
  timeWindow?: string
  schedulingLink?: string
  compensationNote?: string
}

export interface EmailAgentOutput {
  email: {
    subject_options: string[]
    body: string
    personalization_hooks: string[]
    next_steps: string[]
  }
  interview_pack: {
    suggested_questions: string[]
    internal_notes: string[]
  }
}

export interface EmailAgentResult {
  success: boolean
  output?: EmailAgentOutput
  error?: string
  latencyMs?: number
  model?: string
  inputTokens?: number
  outputTokens?: number
}

/**
 * Generate a personalized interview invitation email using Claude
 * This is PROMPT 3 in the agent pipeline
 */
export async function generateEmailWithAgent(
  candidate: Candidate,
  job: Job,
  founderPrefs?: FounderPrefs
): Promise<EmailAgentResult> {
  const startTime = Date.now()

  // Build candidate card summary for the prompt
  const candidateCard = {
    name: candidate.name,
    role: job.title,
    headline: candidate.aiSummary?.split('.')[0] || `Candidate for ${job.title}`,
    score: candidate.aiBucket === 'top' ? 95 :
           candidate.aiBucket === 'strong' ? 80 :
           candidate.aiBucket === 'average' ? 60 :
           candidate.aiBucket === 'weak' ? 40 : 25,
    tags: {
      strong: candidate.topStrengths?.slice(0, 4) || [],
      partial: candidate.skills?.slice(0, 4) || [],
      missing: []
    },
    highlight: candidate.standoutProject || 'Strong technical background',
    ai_summary: candidate.aiSummary || 'Promising candidate for the role.',
    top_reasons: candidate.topStrengths?.slice(0, 3) || ['Relevant experience', 'Technical skills', 'Good fit'],
    top_concern: 'None identified',
    recommended_action: 'interview'
  }

  const systemPrompt = `You are a startup recruiter assistant writing concise, high-converting outreach emails.

RULES:
- Return ONLY valid JSON matching the schema
- Tone: friendly, professional, efficient
- No slang, no emojis
- Personalize using candidate evidence (projects/experience) without sounding creepy`

  const userPrompt = `Write an interview invitation email based on the information below.

================================================================================
FOUNDER PREFERENCES
================================================================================
{
  "founder_name": "${founderPrefs?.name || 'Hiring Manager'}",
  "company_name": "${founderPrefs?.company || 'Our Company'}",
  "founder_title": "${founderPrefs?.title || 'Founder'}",
  "tone": "${founderPrefs?.tone || 'friendly'}",
  "interview_type": "${founderPrefs?.interviewType || '20-minute intro call'}",
  "time_window": "${founderPrefs?.timeWindow || 'this week or next'}",
  "scheduling_link": ${founderPrefs?.schedulingLink ? `"${founderPrefs.schedulingLink}"` : 'null'},
  "compensation_note": ${founderPrefs?.compensationNote ? `"${founderPrefs.compensationNote}"` : 'null'}
}

================================================================================
JOB DETAILS
================================================================================
{
  "job_title": "${job.title}",
  "tech_stack": ${JSON.stringify(job.techStack || [])}
}

================================================================================
CANDIDATE CARD
================================================================================
${JSON.stringify(candidateCard, null, 2)}

================================================================================
CANDIDATE EVIDENCE
================================================================================
Name:            ${candidate.name}
Email:           ${candidate.email}
Top Strengths:   ${candidate.topStrengths?.join(', ') || 'Not specified'}
Standout Project: ${candidate.standoutProject || 'Not specified'}
Skills:          ${candidate.skills?.join(', ') || 'Not specified'}
Experience:      ${candidate.yearsOfExperience || 0} years
Projects:        ${candidate.projects?.map(p => `${p.name}: ${p.description}`).join('; ') || 'Not specified'}

================================================================================
OUTPUT SCHEMA (Return ONLY this JSON structure)
================================================================================
{
  "email": {
    "subject_options": ["exactly 3 subject lines"],
    "body": "email body, 120-180 words max, use \\n for line breaks",
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

================================================================================
EMAIL REQUIREMENTS
================================================================================
1. Start with a clear reason you're reaching out

2. Include 2 personalization hooks referencing candidate projects/experience

3. State interview length + format (e.g., 20-min call)

4. Call to action:
   - If scheduling_link is provided → include it as the primary CTA
   - If not provided → ask for 2-3 availability slots

5. End with a polite close and signature (founder name + company)

6. IMPORTANT: Use "\\n\\n" between paragraphs in the email body for proper formatting`

  const modelName = 'gemini-2.5-pro'

  try {
    // Wrap the LLM call with Phoenix tracing
    const result = await traceLLMCall(
      {
        agentName: 'email-agent',
        agentStep: 'email',
        model: modelName,
        systemPrompt,
        userPrompt,
        maxTokens: 1024,
        temperature: 0.7
      },
      async () => {
        const genAI = getGeminiClient()
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        })

        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                email: {
                  type: SchemaType.OBJECT,
                  properties: {
                    subject_options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    body: { type: SchemaType.STRING },
                    personalization_hooks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    next_steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                  },
                  required: ['subject_options', 'body', 'personalization_hooks', 'next_steps']
                },
                interview_pack: {
                  type: SchemaType.OBJECT,
                  properties: {
                    suggested_questions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    internal_notes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                  },
                  required: ['suggested_questions', 'internal_notes']
                }
              },
              required: ['email', 'interview_pack']
            },
          },
        })

        const geminiResponse = response.response
        const usageMetadata = geminiResponse.usageMetadata

        // Record LLM metrics to the current span
        const currentSpan = getCurrentSpan()
        if (currentSpan) {
          recordLLMMetrics(currentSpan, {
            inputTokens: usageMetadata?.promptTokenCount,
            outputTokens: usageMetadata?.candidatesTokenCount
          })
          currentSpan.setAttribute(LLM_ATTRIBUTES.LLM_RESPONSE_MODEL, modelName)
        }

        return {
          text: geminiResponse.text(),
          inputTokens: usageMetadata?.promptTokenCount,
          outputTokens: usageMetadata?.candidatesTokenCount
        }
      }
    )

    const latencyMs = Date.now() - startTime

    // Parse JSON from response
    let jsonText = result.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const output = JSON.parse(jsonText) as EmailAgentOutput

    return {
      success: true,
      output,
      latencyMs,
      model: modelName,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    console.error('[EmailAgent] Error generating email:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate email',
      latencyMs
    }
  }
}

/**
 * Get the first subject line and body from the agent output
 * Helper for simple use cases
 */
export function extractEmailTemplate(output: EmailAgentOutput): { subject: string; body: string } {
  return {
    subject: output.email.subject_options[0] || 'Interview Invitation',
    body: output.email.body
  }
}
