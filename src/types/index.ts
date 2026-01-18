export interface Job {
  id: string
  title: string
  description?: string
  techStack: string[]
  experienceLevel: 'none' | '1-3' | '3+'
  visaSponsorship: boolean
  startupExperiencePreferred: boolean
  portfolioRequired: boolean
  feedback?: {
    likes: string[]
    dislikes: string[]
  }
  createdAt: Date
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  email: string
  rawResume: string

  // AI-extracted fields
  skills: string[]
  yearsOfExperience: number
  projects: Project[]
  education: Education[]
  workHistory: WorkHistory[]

  // AI-generated summary
  topStrengths: string[]
  standoutProject: string
  aiSummary: string

  // AI-generated bucket for ranking
  aiBucket: AIBucket

  // TL;DR compressed summary (generated on-demand)
  tldr?: string

  // bear-1 compression stats
  compressionStats?: {
    originalTokens: number
    compressedTokens: number
    saved: number
  }

  // Status
  status: 'pending' | 'interested' | 'rejected' | 'starred'
  swipedAt?: Date
}

export type AIBucket = 'top' | 'strong' | 'average' | 'weak' | 'poor'

export interface Project {
  name: string
  description: string
  technologies: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  year: number
}

export interface WorkHistory {
  company: string
  role: string
  duration: string
  highlights: string[]
  isStartup: boolean
}

export interface SwipeAction {
  candidateId: string
  action: 'interested' | 'rejected' | 'starred'
  timestamp: Date
}

export type ExperienceLevel = 'none' | '1-3' | '3+'
