// Types for the 3-step AI agent pipeline

// ===== STEP 1: Extract Candidate Profile =====
export interface CandidateProfile {
  candidate: {
    full_name: string | 'unknown'
    email: string | 'unknown'
    location: string | 'unknown'
    links: {
      github: string | null
      linkedin: string | null
      portfolio: string | null
    }
    education: Array<{
      school: string
      degree: string | null
      major: string | null
      graduation: string | null
    }>
    work_auth: {
      status: 'citizen' | 'permanent_resident' | 'visa' | 'needs_sponsorship' | 'unknown'
      evidence: string
    }
    years_experience_estimate: number | null
    skills: {
      programming_languages: string[]
      frameworks: string[]
      tools: string[]
      cloud: string[]
    }
    experience: Array<{
      company: string
      title: string
      dates: string | null
      bullets: string[]
      impact_metrics: string[]
    }>
    projects: Array<{
      name: string
      description: string
      tech: string[]
      impact_metrics: string[]
      link: string | null
    }>
    top_signals: string[] // 3-6 short phrases
  }
}

// ===== STEP 2: Score + Swipe Card =====
export interface SwipeCard {
  card: {
    name: string
    role: string
    headline: string // max 8 words
    subheadline: string // max 10 words, includes 2 key skills
    score: number // 0-100
    tags: {
      strong: string[] // 1-4 items
      partial: string[] // 0-4 items
      missing: string[] // 0-4 items
    }
    highlight: string // max 12 words
    ai_summary: string // max 2 sentences
    top_reasons: string[] // exactly 3 bullets, each <= 10 words
    top_concern: string // one bullet <= 12 words
    recommended_action: 'interview' | 'save' | 'archive'
    confidence: number // 0.0 to 1.0
  }
  evidence: {
    reason_evidence: Array<{
      reason: string
      resume_evidence: string
    }>
    concern_evidence: string
  }
}

// ===== STEP 3: Email + Interview Pack =====
export interface EmailDraft {
  email: {
    subject_options: string[] // exactly 3 subject lines
    body: string // 120-180 words max
    personalization_hooks: string[] // exactly 2 hooks
    next_steps: string[] // exactly 2 bullets
  }
  interview_pack: {
    suggested_questions: string[] // exactly 3: 1 project-based, 1 skill-based, 1 behavioral
    internal_notes: string[] // exactly 2 notes for interviewer
  }
}

// ===== Job Context for Pipeline =====
export interface JobContext {
  job_title: string
  required_skills: string[]
  nice_to_have: string[]
  experience_level: 'none' | '1-3' | '3+'
  location_policy: string
  sponsorship_policy: 'allowed' | 'not_allowed'
}

// ===== Founder Preferences for Email =====
export interface FounderPreferences {
  founder_name: string
  company_name: string
  founder_title: string
  tone: 'professional' | 'casual' | 'friendly'
  interview_type: string // e.g., "20-min call", "30-min video"
  time_window: string // e.g., "next week", "this week"
  scheduling_link: string | null
  location_policy: string
  compensation_note: string | null
}

// ===== Pipeline Result =====
export interface PipelineResult {
  profile: CandidateProfile
  card: SwipeCard
  email: EmailDraft
  trace_id?: string // Phoenix trace ID
  prompt_variant?: 'A' | 'B' // For A/B testing
}
