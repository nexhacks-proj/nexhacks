'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { ArrowLeft, Plus, X, Briefcase } from 'lucide-react'
import { ExperienceLevel } from '@/types'

const COMMON_TECH_TAGS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
  'Next.js', 'Vue', 'Angular', 'Ruby', 'Rust', 'GraphQL'
]

export default function NewJobPage() {
  const router = useRouter()
  const { createJob } = useStore()

  const [title, setTitle] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('1-3')
  const [visaSponsorship, setVisaSponsorship] = useState(false)
  const [startupExperience, setStartupExperience] = useState(false)
  const [portfolioRequired, setPortfolioRequired] = useState(false)

  const handleAddTag = (tag: string) => {
    if (tag && !techStack.includes(tag)) {
      setTechStack([...techStack, tag])
    }
    setCustomTag('')
  }

  const handleRemoveTag = (tag: string) => {
    setTechStack(techStack.filter(t => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const job = createJob({
      title: title.trim(),
      techStack,
      experienceLevel,
      visaSponsorship,
      startupExperiencePreferred: startupExperience,
      portfolioRequired
    })

    router.push(`/job/${job.id}/upload`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Create New Job
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Title */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Role Title *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Full-Stack Engineer"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                required
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Required Tech Stack
            </label>

            {/* Selected Tags */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {techStack.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_TECH_TAGS.filter(tag => !techStack.includes(tag)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(customTag)
                  }
                }}
                placeholder="Add custom technology..."
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => handleAddTag(customTag)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Experience Level */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'none' as ExperienceLevel, label: 'Entry Level', desc: '0 years' },
                { value: '1-3' as ExperienceLevel, label: 'Mid Level', desc: '1-3 years' },
                { value: '3+' as ExperienceLevel, label: 'Senior', desc: '3+ years' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setExperienceLevel(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    experienceLevel === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <span className={`block font-medium ${
                    experienceLevel === option.value
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {option.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Preferences
            </h3>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer">
              <span className="text-slate-700 dark:text-slate-200">Visa sponsorship allowed</span>
              <input
                type="checkbox"
                checked={visaSponsorship}
                onChange={(e) => setVisaSponsorship(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer">
              <span className="text-slate-700 dark:text-slate-200">Startup experience preferred</span>
              <input
                type="checkbox"
                checked={startupExperience}
                onChange={(e) => setStartupExperience(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer">
              <span className="text-slate-700 dark:text-slate-200">Portfolio required</span>
              <input
                type="checkbox"
                checked={portfolioRequired}
                onChange={(e) => setPortfolioRequired(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            Create Job & Start Reviewing
          </button>
        </form>
      </main>
    </div>
  )
}
