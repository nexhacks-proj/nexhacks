import { AIBucket, Candidate, Job } from '@/types'

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
  aiBucket: AIBucket
}

export async function parseResumeWithAI(
  rawResume: string,
  job: Job,
  feedback?: { likes: string[]; dislikes: string[] }
): Promise<ResumeParseResult> {
  let prompt = `You are an expert technical recruiter analyzing resumes for a startup hiring manager. Your goal is to not just parse the resume, but to also categorize the candidate's fit for a specific role.

JOB REQUIREMENTS:
- Role: ${job.title}
- Tech Stack: ${job.techStack.join(', ')}
- Experience Level: ${job.experienceLevel === 'none' ? 'Entry Level (0 years)' : job.experienceLevel === '1-3' ? 'Mid Level (1-3 years)' : 'Senior (3+ years)'}
- Startup Experience Preferred: ${job.startupExperiencePreferred ? 'Yes' : 'No'}
`

  if (feedback && (feedback.likes.length > 0 || feedback.dislikes.length > 0)) {
    prompt += `
RECRUITER FEEDBACK:
The hiring manager has provided the following specific feedback. Use this to heavily influence the 'aiBucket' and 'aiSummary':
${feedback.likes.length > 0 ? `- LIKES (Boost these candidates): ${feedback.likes.join(', ')}` : ''}
${feedback.dislikes.length > 0 ? `- DISLIKES (Penalty these candidates): ${feedback.dislikes.join(', ')}` : ''}
`
  }

  prompt += `
RESUME:
${rawResume}


IMPORTANT INSTRUCTIONS:
1.  **Bucketing:** Based on the ENTIRE resume and how it matches the job requirements ${feedback ? 'AND recruiter feedback' : ''}, assign the candidate to one of these 5 buckets:
    - 'top': Exceptional candidate, a near-perfect match. Checks all the boxes and more. (90th percentile)
    - 'strong': Very good candidate, meets most key requirements. (75th percentile)
    - 'average': Decent candidate, meets some requirements but has gaps. (50th percentile)
    - 'weak': Poor fit, missing most key requirements. (25th percentile)
    - 'poor': Completely unqualified. (10th percentile)
    ${feedback ? 'NOTE: If a candidate matches a "DISLIKE", they should likely be in "weak" or "poor". If they match "LIKES", boost them up.' : ''}
2.  **JSON ONLY:** Return ONLY the JSON object, no markdown, no explanations, no text before or after the JSON.`


  try {
    const text = await callCerebras(prompt)


    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonText) as ResumeParseResult
    return parsed
  } catch (error) {
    console.error('Error parsing resume with Cerebras:', error)
    // Preserve the original error message if it's already an Error
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to parse resume with AI')
  }
}

// Parse multiple resumes in a single API call to avoid rate limiting
export async function parseMultipleResumesWithAI(
  resumes: Array<{ id: string; name: string; email: string; rawResume: string }>,
  job: Job,
  feedback?: { likes: string[]; dislikes: string[] }
): Promise<Array<ResumeParseResult & { id: string }>> {
  const resumesText = resumes.map((r, idx) =>
    `=== RESUME ${idx + 1} (ID: ${r.id}) ===\n${r.rawResume}\n=== END RESUME ${idx + 1} ===`
  ).join('\n\n')

  let prompt = `You are an expert technical recruiter analyzing MULTIPLE resumes for a startup hiring manager. Your goal is to not just parse the resumes, but to also categorize each candidate's fit for a specific role.

JOB REQUIREMENTS:
- Role: ${job.title}
- Tech Stack: ${job.techStack.join(', ')}
- Experience Level: ${job.experienceLevel === 'none' ? 'Entry Level (0 years)' : job.experienceLevel === '1-3' ? 'Mid Level (1-3 years)' : 'Senior (3+ years)'}
- Startup Experience Preferred: ${job.startupExperiencePreferred ? 'Yes' : 'No'}
`

  if (feedback && (feedback.likes.length > 0 || feedback.dislikes.length > 0)) {
    prompt += `
RECRUITER FEEDBACK:
The hiring manager has provided the following specific feedback. Use this to heavily influence the 'aiBucket' and 'aiSummary':
${feedback.likes.length > 0 ? `- LIKES (Boost these candidates): ${feedback.likes.join(', ')}` : ''}
${feedback.dislikes.length > 0 ? `- DISLIKES (Penalty these candidates): ${feedback.dislikes.join(', ')}` : ''}
`
  }

  prompt += `
RESUMES TO ANALYZE:
${resumesText}

TASK: Parse ALL ${resumes.length} resumes above and provide a structured analysis for EACH candidate. Return ONLY a valid JSON array with one object per resume, in the SAME ORDER as provided above.

Each object in the array must have this exact structure:
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
  "standoutProject": "The single most impressive thing this candidate has done (1-2 sentences). Focus on impact and scale.",
  "aiSummary": "2-3 sentence hiring manager summary. Is this a good fit? What are the trade-offs? Be honest and direct. ${feedback ? 'Mention how they match the specific likes/dislikes feedback.' : ''}",
  "aiBucket": "<'top' | 'strong' | 'average' | 'weak' | 'poor'>"
}

IMPORTANT INSTRUCTIONS:
1.  **Bucketing:** For EACH candidate, based on their ENTIRE resume and how it matches the job requirements ${feedback ? 'AND recruiter feedback' : ''}, assign them to one of these 5 buckets:
    - 'top': Exceptional candidate, a near-perfect match. Checks all the boxes and more. (90th percentile)
    - 'strong': Very good candidate, meets most key requirements. (75th percentile)
    - 'average': Decent candidate, meets some requirements but has gaps. (50th percentile)
    - 'weak': Poor fit, missing most key requirements. (25th percentile)
    - 'poor': Completely unqualified. (10th percentile)
    ${feedback ? 'NOTE: If a candidate matches a "DISLIKE", they should likely be in "weak" or "poor". If they match "LIKES", boost them up.' : ''}
2.  **JSON ARRAY ONLY:** Return a JSON ARRAY with exactly ${resumes.length} objects. Each object MUST include the "id" field matching the resume ID.
3.  NO extra text: Return ONLY the JSON array, no markdown, no explanations, nothing else.
- topStrengths must be SPECIFIC to this candidate and role, not generic
- aiSummary must start with a clear verdict and be detailed (3-4 sentences)
- standoutProject should highlight their BEST work with specifics
- If a resume is clearly unqualified or has red flags, be honest about it
- Extract ALL skills mentioned, not just a few
- Include ALL work history, not just recent roles

Return ONLY the JSON array. No markdown code blocks.`

  try {
    const text = await callCerebras(prompt)
    console.log("Cerebras (OSS120B) Raw Response:", text) // DEBUG

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonText) as Array<ResumeParseResult & { id: string }>
    return parsed
  } catch (error) {
    console.error('Error batch parsing resumes with Cerebras:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to batch parse resumes with AI')
  }
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
      const parsedBatch = await parseMultipleResumesWithAI(batch, job, job.feedback)

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
            aiBucket: 'average',
            status: 'pending'
              })
            }
          }
        } catch (error) {
          console.error(`Failed to parse batch ${i}:`, error)
          // Add fallback entries for entire failed batch
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
              aiSummary: 'AI parsing failed for this candidate. Please review manually.',
              aiBucket: 'average', // Default bucket
          status: 'pending'
        })
      }
    }

    onProgress?.(Math.min(i + BATCH_SIZE, candidates.length), candidates.length)
  }

  return results
}
