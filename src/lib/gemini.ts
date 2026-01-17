import { GoogleGenerativeAI } from '@google/generative-ai'
import { Candidate, Job } from '@/types'

const getGeminiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return process.env.GEMINI_API_KEY
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
}

export async function parseResumeWithAI(
  rawResume: string,
  job: Job
): Promise<ResumeParseResult> {
  const prompt = `You are an expert technical recruiter analyzing resumes for a startup hiring manager.

JOB REQUIREMENTS:
- Role: ${job.title}
- Tech Stack: ${job.techStack.join(', ')}
- Experience Level: ${job.experienceLevel === 'none' ? 'Entry Level (0 years)' : job.experienceLevel === '1-3' ? 'Mid Level (1-3 years)' : 'Senior (3+ years)'}
- Startup Experience Preferred: ${job.startupExperiencePreferred ? 'Yes' : 'No'}

RESUME:
${rawResume}

TASK: Parse this resume and provide a structured analysis optimized for quick hiring decisions. Return ONLY valid JSON with this exact structure:

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
  "aiSummary": "2-3 sentence hiring manager summary. Is this a good fit? What are the trade-offs? Be honest and direct."
}

IMPORTANT:
- topStrengths should be 3 bullet points highlighting why this candidate fits THIS specific role
- standoutProject should be the ONE most impressive accomplishment
- aiSummary should be candid - mention both strengths AND concerns/gaps
- Return ONLY the JSON object, no markdown, no explanations`

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

export async function batchParseResumes(
  candidates: Array<{ id: string; name: string; email: string; rawResume: string }>,
  job: Job,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<Omit<Candidate, 'jobId'>>> {
  let completed = 0

  // Process all candidates in parallel for much faster batch processing
  const processOne = async (candidate: typeof candidates[0]): Promise<Omit<Candidate, 'jobId'>> => {
    try {
      const parsed = await parseResumeWithAI(candidate.rawResume, job)
      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        rawResume: candidate.rawResume,
        ...parsed,
        status: 'pending'
      }
    } catch (error) {
      console.error(`Failed to parse resume for ${candidate.name}:`, error)
      // Fallback to basic parsing if AI fails
      return {
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
        status: 'pending'
      }
    }
  }

  const promises = candidates.map(async (candidate) => {
    const result = await processOne(candidate)
    completed++
    onProgress?.(completed, candidates.length)
    return result
  })

  return Promise.all(promises)
}
