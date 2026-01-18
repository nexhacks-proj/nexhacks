import { Candidate, Job } from '@/types'

// Cerebras API - ultra-fast inference
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions'

const getCerebrasKey = () => {
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) {
    throw new Error('CEREBRAS_API_KEY not set')
  }
  return apiKey
}

async function callCerebras(prompt: string): Promise<string> {
  const response = await fetch(CEREBRAS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getCerebrasKey()}`
    },
    body: JSON.stringify({
      model: 'gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 16000,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cerebras API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

interface ResumeParseResult {
  skills: string[]
  yearsOfExperience: number
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    year: number
  }>
  workHistory: Array<{
    company: string
    role: string
    duration: string
    highlights: string[]
    isStartup: boolean
  }>
  topStrengths: string[]
  standoutProject: string
  aiSummary: string
}

export async function parseResumeWithAI(
  rawResume: string,
  job: Job
): Promise<ResumeParseResult> {
  const prompt = `You are an expert technical recruiter at a fast-growing startup. Analyze this resume for a ${job.title} position requiring ${job.techStack.join(', ')}.

RESUME:
${rawResume}

Provide a DETAILED analysis. Return ONLY valid JSON (no markdown):
{
  "skills": ["list", "all", "relevant", "technical", "skills"],
  "yearsOfExperience": <total years of professional tech experience>,
  "projects": [{"name": "Project Name", "description": "Detailed description of what it does and its impact", "technologies": ["specific", "tech", "used"]}],
  "education": [{"institution": "Full Name", "degree": "Degree Type", "field": "Field", "year": 2020}],
  "workHistory": [{"company": "Name", "role": "Title", "duration": "Year-Year", "highlights": ["Specific achievement", "Another accomplishment"], "isStartup": false}],
  "topStrengths": ["Specific strength for THIS role with evidence", "Another specific strength", "Third strength relevant to ${job.techStack[0]}"],
  "standoutProject": "Their most impressive accomplishment with specifics about scale and impact. 2-3 sentences.",
  "aiSummary": "Start with verdict (Strong Yes/Lean Yes/Maybe/Lean No/Strong No). Then 3-4 sentences explaining why, mentioning both strengths and any red flags."
}`

  const text = await callCerebras(prompt)
  const jsonText = extractJSON(text)
  return JSON.parse(jsonText) as ResumeParseResult
}

// Parse multiple resumes in a single API call - Cerebras is fast enough for this
export async function parseMultipleResumesWithAI(
  resumes: Array<{ id: string; name: string; email: string; rawResume: string }>,
  job: Job
): Promise<Array<ResumeParseResult & { id: string }>> {
  const resumesText = resumes.map((r, idx) =>
    `=== RESUME ${idx + 1} (ID: ${r.id}) ===\n${r.rawResume}\n=== END RESUME ${idx + 1} ===`
  ).join('\n\n')

  const prompt = `You are an expert technical recruiter at a fast-growing startup. Analyze ALL ${resumes.length} resumes below for a ${job.title} position.

JOB REQUIREMENTS:
- Role: ${job.title}
- Required Tech Stack: ${job.techStack.join(', ')}
- Experience Level: ${job.experienceLevel === 'none' ? 'Entry Level (0 years OK)' : job.experienceLevel === '1-3' ? 'Mid Level (1-3 years required)' : 'Senior (3+ years required)'}
- Startup Experience: ${job.startupExperiencePreferred ? 'Strongly preferred - we value scrappy builders' : 'Not required'}

RESUMES TO ANALYZE:
${resumesText}

TASK: Provide a DETAILED analysis for each candidate. Be thorough and specific.

Return a JSON array with ${resumes.length} objects. Each object must have:
{
  "id": "<exact ID from the resume header, e.g. mock-1>",
  "skills": ["list", "all", "relevant", "technical", "skills", "mentioned"],
  "yearsOfExperience": <total years of professional software/tech experience as a number>,
  "projects": [
    {
      "name": "Project Name",
      "description": "Detailed 1-2 sentence description of what the project does and its impact",
      "technologies": ["specific", "technologies", "used"]
    }
  ],
  "education": [
    {
      "institution": "Full University Name",
      "degree": "Degree Type (BS, MS, PhD, etc)",
      "field": "Field of Study",
      "year": <graduation year as number>
    }
  ],
  "workHistory": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start Year - End Year",
      "highlights": ["Specific achievement with metrics if available", "Another concrete accomplishment"],
      "isStartup": <true if company was early-stage/small startup, false otherwise>
    }
  ],
  "topStrengths": [
    "Specific strength #1 explaining WHY they're good for THIS ${job.title} role",
    "Specific strength #2 with concrete evidence from their background",
    "Specific strength #3 relevant to ${job.techStack.slice(0, 2).join(' and ')}"
  ],
  "standoutProject": "Their single most impressive accomplishment. Be specific about scale, impact, and why it matters. 2-3 sentences.",
  "aiSummary": "Detailed 3-4 sentence hiring recommendation. Start with your verdict (Strong Yes / Lean Yes / Maybe / Lean No / Strong No). Explain the key reasons for your assessment. Mention specific strengths AND any red flags or gaps. Be candid and direct."
}

IMPORTANT GUIDELINES:
- topStrengths must be SPECIFIC to this candidate and role, not generic
- aiSummary must start with a clear verdict and be detailed (3-4 sentences)
- standoutProject should highlight their BEST work with specifics
- If a resume is clearly unqualified or has red flags, be honest about it
- Extract ALL skills mentioned, not just a few
- Include ALL work history, not just recent roles

Return ONLY the JSON array. No markdown code blocks.`

  const text = await callCerebras(prompt)
  const jsonText = extractJSON(text)
  return JSON.parse(jsonText) as Array<ResumeParseResult & { id: string }>
}

// Robust JSON extraction from LLM output
function extractJSON(text: string): string {
  let cleaned = text.trim()

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '')

  // Find the JSON array or object
  const arrayStart = cleaned.indexOf('[')
  const objectStart = cleaned.indexOf('{')

  let start = -1
  let isArray = false

  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    start = arrayStart
    isArray = true
  } else if (objectStart !== -1) {
    start = objectStart
    isArray = false
  }

  if (start === -1) {
    throw new Error('No JSON found in response')
  }

  // Find matching end bracket
  const openBracket = isArray ? '[' : '{'
  const closeBracket = isArray ? ']' : '}'
  let depth = 0
  let end = -1

  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === openBracket) depth++
    if (cleaned[i] === closeBracket) depth--
    if (depth === 0) {
      end = i + 1
      break
    }
  }

  if (end === -1) {
    throw new Error('Malformed JSON - no closing bracket found')
  }

  return cleaned.slice(start, end)
}

export async function batchParseResumes(
  candidates: Array<{ id: string; name: string; email: string; rawResume: string }>,
  job: Job,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<Omit<Candidate, 'jobId'>>> {
  // Process in batches of 10 for Cerebras (fast enough)
  const BATCH_SIZE = 10
  const results: Array<Omit<Candidate, 'jobId'>> = []

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE)

    try {
      const parsedBatch = await parseMultipleResumesWithAI(batch, job)

      for (const candidate of batch) {
        const parsed = parsedBatch.find(p => p.id === candidate.id)
        if (parsed) {
          const { id, ...parseResult } = parsed
          results.push({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            rawResume: candidate.rawResume,
            ...parseResult,
            status: 'pending'
          })
        } else {
          results.push({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            rawResume: candidate.rawResume,
            skills: [],
            yearsOfExperience: 0,
            projects: [],
            education: [],
            workHistory: [],
            topStrengths: ['Unable to parse resume'],
            standoutProject: 'Resume parsing failed',
            aiSummary: 'AI parsing failed for this candidate.',
            status: 'pending'
          })
        }
      }
    } catch (error) {
      console.error(`Failed to parse batch starting at ${i}:`, error)
      for (const candidate of batch) {
        results.push({
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          rawResume: candidate.rawResume,
          skills: [],
          yearsOfExperience: 0,
          projects: [],
          education: [],
          workHistory: [],
          topStrengths: ['Unable to parse resume'],
          standoutProject: 'Resume parsing failed',
          aiSummary: 'AI parsing failed for this candidate.',
          status: 'pending'
        })
      }
    }

    // Update progress after each batch
    onProgress?.(results.length, candidates.length)
  }

  return results
}
