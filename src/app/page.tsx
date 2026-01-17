'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { Briefcase, Users, Zap, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { jobs, setCurrentJob } = useStore()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">SwipeHire</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Screen Candidates in Minutes,<br />Not Hours
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            AI-powered candidate cards let you make quick, instinct-driven hiring decisions
            with a simple swipe interface.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Quick Job Setup
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Define your role requirements with structured filters in under a minute.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              AI-Powered Summaries
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Each candidate is summarized into high-signal cards with key strengths highlighted.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Swipe to Decide
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Make quick yes/no decisions with intuitive swipe gestures on mobile or desktop.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => router.push('/job/new')}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create New Job
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Jobs */}
        {jobs.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Your Jobs
            </h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    setCurrentJob(job)
                    router.push(`/job/${job.id}/swipe`)
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-left"
                >
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {job.techStack.join(', ')}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
