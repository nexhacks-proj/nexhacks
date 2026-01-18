'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import ResumeUploader from '@/components/ResumeUploader'
import { ArrowLeft, SkipForward } from 'lucide-react'

export default function UploadCandidatesPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const { jobs, currentJob, setCurrentJob } = useStore()

  useEffect(() => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setCurrentJob(job)
    } else {
      router.push('/')
    }
  }, [jobId, jobs, setCurrentJob, router])

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
             // Navigate ONLY when uploading is fully done or manually skipped
             router.push(`/job/${jobId}/swipe`)
          }}
          onMockComplete={() => {
             // Same for mock candidates
             router.push(`/job/${jobId}/swipe`)
          }}
        />

        {/* Skip Upload Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push(`/job/${jobId}/swipe`)}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-2 text-base font-medium"
          >
            <SkipForward className="w-4 h-4" />
            Skip Upload and Continue Swiping
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
          <h3 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            How it works
          </h3>
          <ul className="text-sm text-primary-700 dark:text-primary-200 space-y-1">
            <li>• Upload resume files (PDF, Word, or text) or paste text</li>
            <li>• Cerebras AI extracts skills, experience, and projects</li>
            <li>• AI generates tailored summaries based on your job requirements</li>
            <li>• Review candidates in the swipe interface</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
