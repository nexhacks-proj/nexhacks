import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIBucket, Candidate, Job } from '@/types'

const getGeminiKey = () => {
  // Try multiple sources for the API key
  const apiKey = process.env.GEMINI_API_KEY || 
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY // Fallback if needed
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment')
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')))
    console.error('NODE_ENV:', process.env.NODE_ENV)
    throw new Error('GEMINI_API_KEY environment variable is not set. Make sure .env.local exists in the project root and contains GEMINI_API_KEY=your-key-here. Restart the dev server after creating/updating .env.local.')
  }
  return apiKey
}

const getModel = () => {
  const genAI = new GoogleGenerativeAI(getGeminiKey())
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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

TASK: Parse this resume, provide a structured analysis, and rank the candidate. Return ONLY valid JSON with this exact structure:

{
  "skills": ["skill1", "skill2", ...],
  "yearsOfExperience": <number>,
  "projects": [
    {
      "name": "project name",
      "description": "brief description (1 sentence)",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "field": "field of study",
      "year": <graduation year>
    }
  ],
  "workHistory": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "time period (e.g., '2020-2023')",
      "highlights": ["achievement 1", "achievement 2"],
      "isStartup": <true if early-stage startup, false otherwise>
    }
  ],
  "topStrengths": [
    "strength 1 (specific to this role)",
    "strength 2 (specific to this role)",
    "strength 3 (specific to this role)"
  ],
  "standoutProject": "The single most impressive thing this candidate has done (1-2 sentences). Focus on impact and scale.",
  "aiSummary": "2-3 sentence hiring manager summary. Is this a good fit? What are the trade-offs? Be honest and direct. ${feedback ? 'Mention how they match the specific likes/dislikes feedback.' : ''}",
  "aiBucket": "<'top' | 'strong' | 'average' | 'weak' | 'poor'>"
}

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
    const model = getModel()
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

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
    console.error('Error parsing resume with Gemini:', error)
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
  "id": "<the ID from the resume header>",
  "skills": ["skill1", "skill2", ...],
  "yearsOfExperience": <number>,
  "projects": [
    {
      "name": "project name",
      "description": "brief description (1 sentence)",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "field": "field of study",
      "year": <graduation year>
    }
  ],
  "workHistory": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "time period (e.g., '2020-2023')",
      "highlights": ["achievement 1", "achievement 2"],
      "isStartup": <true if early-stage startup, false otherwise>
    }
  ],
  "topStrengths": [
    "strength 1 (specific to this role)",
    "strength 2 (specific to this role)",
    "strength 3 (specific to this role)"
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
3.  NO extra text: Return ONLY the JSON array, no markdown, no explanations, nothing else.`

  try {
    const model = getModel()
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log("Gemini Raw Response:", text) // DEBUG

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
    console.error('Error batch parsing resumes with Gemini:', error)
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
  // Process in batches - increased from 5 to 8 for better throughput
  // Process up to 3 batches in parallel for faster overall processing
  const BATCH_SIZE = 8
  const MAX_PARALLEL_BATCHES = 3
  const results: Array<Omit<Candidate, 'jobId'>> = []
  const totalBatches = Math.ceil(candidates.length / BATCH_SIZE)

  // Process batches with controlled parallelism
  for (let i = 0; i < totalBatches; i += MAX_PARALLEL_BATCHES) {
    const batchPromises: Promise<void>[] = []
    
    // Process up to MAX_PARALLEL_BATCHES batches simultaneously
    for (let j = 0; j < MAX_PARALLEL_BATCHES && (i + j) < totalBatches; j++) {
      const batchIndex = i + j
      const batch = candidates.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE)

      const batchPromise = (async () => {
        try {
          const parsedBatch = await parseMultipleResumesWithAI(batch, job, job.feedback)

          // Match parsed results with original candidates
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
              // Fallback if ID not found in response
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
        } catch (error) {
          console.error(`Failed to parse batch ${batchIndex}:`, error)
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
        } finally {
          // Update progress as each batch completes
          const completed = Math.min((batchIndex + 1) * BATCH_SIZE, candidates.length)
          onProgress?.(completed, candidates.length)
        }
      })()

      batchPromises.push(batchPromise)
    }

    // Wait for all parallel batches in this group to complete
    await Promise.all(batchPromises)
  }

  return results
}

