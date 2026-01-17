'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { Candidate } from '@/types'
import CandidateDetail from '@/components/CandidateDetail'
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Mail,
  ChevronRight,
  Layers
} from 'lucide-react'

type Tab = 'interested' | 'starred' | 'rejected' | 'pending'

export default function DashboardPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const {
    jobs,
    currentJob,
    setCurrentJob,
    getPendingCandidates,
    getInterestedCandidates,
    getRejectedCandidates,
    getStarredCandidates,
    swipeCandidate
  } = useStore()

  const [activeTab, setActiveTab] = useState<Tab>('interested')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  useEffect(() => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setCurrentJob(job)
    } else {
      router.push('/')
    }
  }, [jobId, jobs, setCurrentJob, router])

  const pending = getPendingCandidates()
  const interested = getInterestedCandidates()
  const rejected = getRejectedCandidates()
  const starred = getStarredCandidates()

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    {
      key: 'interested',
      label: 'Interested',
      count: interested.length,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-success'
    },
    {
      key: 'starred',
      label: 'Starred',
      count: starred.length,
      icon: <Star className="w-4 h-4" />,
      color: 'text-warning'
    },
    {
      key: 'rejected',
      label: 'Passed',
      count: rejected.length,
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-danger'
    },
    {
      key: 'pending',
      label: 'Pending',
      count: pending.length,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-slate-500'
    }
  ]

  const getCandidates = () => {
    switch (activeTab) {
      case 'interested':
        return interested
      case 'starred':
        return starred
      case 'rejected':
        return rejected
      case 'pending':
        return pending
      default:
        return []
    }
  }

  const candidates = getCandidates()

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
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/job/${jobId}/swipe`)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div>
                <h1 className="font-semibold text-slate-900 dark:text-white">
                  {currentJob.title}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Candidate Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/job/${jobId}/swipe`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm"
            >
              <Layers className="w-4 h-4" />
              Continue Swiping
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`p-3 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-100 dark:bg-slate-700 ring-2 ring-primary-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className={`flex items-center justify-center gap-1 ${tab.color}`}>
                  {tab.icon}
                  <span className="font-bold">{tab.count}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {tab.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Candidate List */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
              No candidates here yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {activeTab === 'pending'
                ? 'All candidates have been reviewed!'
                : `Swipe candidates to add them to ${activeTab}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <CandidateListItem
                key={candidate.id}
                candidate={candidate}
                onClick={() => setSelectedCandidate(candidate)}
              />
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {activeTab === 'interested' && interested.length > 0 && (
          <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <h3 className="font-medium text-slate-900 dark:text-white mb-3">
              Bulk Actions
            </h3>
            <button
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Interview Invites to All ({interested.length})
            </button>
            <p className="text-xs text-slate-400 text-center mt-2">
              This would trigger email templates in a real implementation
            </p>
          </div>
        )}
      </main>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSwipe={(direction) => {
            swipeCandidate(
              selectedCandidate.id,
              direction === 'right' ? 'interested' : 'rejected'
            )
            setSelectedCandidate(null)
          }}
          onStar={() => {
            swipeCandidate(selectedCandidate.id, 'starred')
            setSelectedCandidate(null)
          }}
        />
      )}
    </div>
  )
}

function CandidateListItem({
  candidate,
  onClick
}: {
  candidate: Candidate
  onClick: () => void
}) {
  const statusConfig = {
    interested: { bg: 'bg-success/10', text: 'text-success', label: 'Interested' },
    rejected: { bg: 'bg-danger/10', text: 'text-danger', label: 'Passed' },
    starred: { bg: 'bg-warning/10', text: 'text-warning', label: 'Starred' },
    pending: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Pending' }
  }

  const config = statusConfig[candidate.status]

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left flex items-center gap-4"
    >
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
          {candidate.name.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-900 dark:text-white truncate">
            {candidate.name}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {candidate.yearsOfExperience} years · {candidate.skills.slice(0, 3).join(', ')}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
          {candidate.aiSummary}
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
    </button>
  )
}
