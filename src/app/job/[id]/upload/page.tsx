'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import ResumeUploader from '@/components/ResumeUploader'
import { mockRawResumes } from '@/data/mockCandidates'
import { Candidate } from '@/types'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function UploadCandidatesPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const { jobs, currentJob, setCurrentJob, addCandidate } = useStore()
  const [isLoadingMock, setIsLoadingMock] = useState(false)
  const [loadProgress, setLoadProgress] = useState({ current: 0, total: 0 })
  const [mockError, setMockError] = useState<string | null>(null)

  useEffect(() => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setCurrentJob(job)
    } else {
      router.push('/')
    }
  }, [jobId, jobs, setCurrentJob, router])

  const loadMockCandidates = async () => {
    if (!currentJob) return

    setIsLoadingMock(true)
    setMockError(null)
    setLoadProgress({ current: 0, total: mockRawResumes.length })

    try {
      // Send all mock resumes in a single batch API call to avoid rate limiting
      const response = await fetch('/api/candidates/parse-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumes: mockRawResumes,
          job: currentJob
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // Add all parsed candidates to the store
      for (const candidate of data.candidates) {
        const parsedCandidate: Candidate = {
          ...candidate,
          jobId: currentJob.id,
          status: 'pending' as const
        }
        addCandidate(parsedCandidate)
      }

      setLoadProgress({ current: mockRawResumes.length, total: mockRawResumes.length })
      router.push(`/job/${jobId}/swipe`)
    } catch (error) {
      console.error('Error loading mock candidates:', error)
      const errorMsg = error instanceof Error
        ? error.message
        : 'Failed to load mock candidates. Please check that GEMINI_API_KEY is set correctly.'
      setMockError(errorMsg)
    }

    setIsLoadingMock(false)
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
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
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Upload Candidates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currentJob.title}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <ResumeUploader
          job={currentJob}
          onComplete={(candidateIds) => {
            router.push(`/job/${jobId}/swipe`)
          }}
        />

        {/* Info Box */}
        <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
          <h3 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            How it works
          </h3>
          <ul className="text-sm text-primary-700 dark:text-primary-200 space-y-1">
            <li>• Upload resume files (PDF, Word, or text) or paste text</li>
            <li>• Gemini AI extracts skills, experience, and projects</li>
            <li>• AI generates tailored summaries based on your job requirements</li>
            <li>• Review candidates in the swipe interface</li>
          </ul>
        </div>

        {/* Or use mock data */}
        <div className="mt-6">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Or process mock candidates with AI for testing
            </p>
            <button
              onClick={loadMockCandidates}
              disabled={isLoadingMock}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 rounded-lg transition-colors text-sm flex items-center gap-2 mx-auto"
            >
              {isLoadingMock && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoadingMock ? 'Processing Mock Resumes...' : 'Load Mock Candidates (AI Parsed)'}
            </button>
          </div>

          {isLoadingMock && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Processing {loadProgress.current} of {loadProgress.total} mock candidates with Gemini AI...
              </p>
            </div>
          )}

          {mockError && !isLoadingMock && (
            <div className="mt-4 bg-danger/10 border border-danger/20 rounded-xl p-4">
              <p className="text-sm font-medium text-danger mb-1">Mock Data Error</p>
              <p className="text-sm text-danger/80">{mockError}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
