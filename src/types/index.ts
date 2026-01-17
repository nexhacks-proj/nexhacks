export interface Job {
  id: string
  title: string
  techStack: string[]
  experienceLevel: 'none' | '1-3' | '3+'
  visaSponsorship: boolean
  startupExperiencePreferred: boolean
  portfolioRequired: boolean
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

  // Status
  status: 'pending' | 'interested' | 'rejected' | 'starred'
  swipedAt?: Date
}

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
