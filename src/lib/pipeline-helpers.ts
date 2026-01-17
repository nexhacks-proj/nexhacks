// Helper functions to convert between old and new data structures
import type { Job, Candidate } from '@/types'
import type {
  CandidateProfile,
  SwipeCard,
  JobContext,
  FounderPreferences,
} from '@/types/agent'

// Convert Job to JobContext
export function jobToJobContext(job: Job): JobContext {
  return {
    job_title: job.title,
    required_skills: job.techStack,
    nice_to_have: [], // Can be extended later
    experience_level: job.experienceLevel,
    location_policy: 'Remote or On-site', // Default, can be extended
    sponsorship_policy: job.visaSponsorship ? 'allowed' : 'not_allowed',
  }
}

// Convert CandidateProfile + SwipeCard to legacy Candidate format
export function profileAndCardToCandidate(
  profile: CandidateProfile,
  card: SwipeCard,
  candidateId: string,
  jobId: string,
  rawResume: string
): Candidate {
  // Extract skills from profile
  const allSkills = [
    ...profile.candidate.skills.programming_languages,
    ...profile.candidate.skills.frameworks,
    ...profile.candidate.skills.tools,
    ...profile.candidate.skills.cloud,
  ]

  // Convert experience
  const workHistory = profile.candidate.experience.map((exp) => ({
    company: exp.company,
    role: exp.title,
    duration: exp.dates || 'Unknown',
    highlights: exp.bullets,
    isStartup: false, // Could be inferred from company name/size
  }))

  // Convert education
  const education = profile.candidate.education.map((edu) => ({
    institution: edu.school,
    degree: edu.degree || 'Unknown',
    field: edu.major || 'Unknown',
    year: edu.graduation ? parseInt(edu.graduation) || 0 : 0,
  }))

  // Convert projects
  const projects = profile.candidate.projects.map((proj) => ({
    name: proj.name,
    description: proj.description,
    technologies: proj.tech,
  }))

  return {
    id: candidateId,
    jobId,
    name: profile.candidate.full_name !== 'unknown' ? profile.candidate.full_name : 'Unknown',
    email: profile.candidate.email !== 'unknown' ? profile.candidate.email : '',
    rawResume,
    skills: allSkills,
    yearsOfExperience: profile.candidate.years_experience_estimate || 0,
    projects,
    education,
    workHistory,
    topStrengths: card.card.top_reasons,
    standoutProject: card.card.highlight,
    aiSummary: card.card.ai_summary,
    status: 'pending',
  }
}

// Default founder preferences (can be customized per job)
export function getDefaultFounderPreferences(
  companyName: string = 'Our Company',
  founderName: string = 'The Team'
): FounderPreferences {
  return {
    founder_name: founderName,
    company_name: companyName,
    founder_title: 'Founder',
    tone: 'friendly',
    interview_type: '20-min call',
    time_window: 'next week',
    scheduling_link: null,
    location_policy: 'Remote or On-site',
    compensation_note: null,
  }
}
