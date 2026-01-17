'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import CandidateCard from '@/components/CandidateCard'
import CandidateDetail from '@/components/CandidateDetail'
import { Candidate } from '@/types'
import { ArrowLeft, RotateCcw, X, Star, Heart, Users, CheckCircle, XCircle } from 'lucide-react'

export default function SwipePage() {
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
    swipeCandidate,
    undoLastSwipe,
    swipeHistory
  } = useStore()

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCandidate) return // Don't handle if modal is open

      switch (e.key) {
        case 'ArrowLeft':
          handleSwipe('left')
          break
        case 'ArrowRight':
          handleSwipe('right')
          break
        case 'ArrowUp':
          handleStar()
          break
        case 'z':
        case 'Z':
          handleUndo()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // Load job on mount
  useEffect(() => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setCurrentJob(job)
    } else {
      router.push('/')
    }
  }, [jobId, jobs, setCurrentJob, router])

  const pendingCandidates = getPendingCandidates()
  const interestedCount = getInterestedCandidates().length
  const rejectedCount = getRejectedCandidates().length
  const starredCount = getStarredCandidates().length

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || pendingCandidates.length === 0) return

    setIsAnimating(true)
    const candidate = pendingCandidates[0]

    setTimeout(() => {
      swipeCandidate(candidate.id, direction === 'right' ? 'interested' : 'rejected')
      setIsAnimating(false)
    }, 300)
  }

  const handleStar = () => {
    if (pendingCandidates.length === 0) return
    const candidate = pendingCandidates[0]
    swipeCandidate(candidate.id, 'starred')
  }

  const handleUndo = () => {
    if (swipeHistory.length > 0) {
      undoLastSwipe()
    }
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 pt-safe">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="p-3 -m-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="text-center flex-1 px-2">
              <h1 className="font-semibold text-slate-900 dark:text-white truncate">
                {currentJob.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingCandidates.length} remaining
              </p>
            </div>
            <button
              onClick={() => router.push(`/job/${jobId}/dashboard`)}
              className="p-3 -m-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95"
            >
              <Users className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center gap-8 mt-3 py-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{interestedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <XCircle className="w-5 h-5 text-danger" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{rejectedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="w-5 h-5 text-warning" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{starredCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Card Stack */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 px-3 sm:py-4 sm:px-4 overflow-hidden">
        <div className="relative w-full max-w-lg h-[calc(100dvh-280px)] min-h-[400px] max-h-[580px]">
          {pendingCandidates.length > 0 ? (
            <>
              {/* Show up to 3 cards in stack */}
              {pendingCandidates.slice(0, 3).reverse().map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onSwipe={handleSwipe}
                  onStar={handleStar}
                  onTap={() => setSelectedCandidate(candidate)}
                  isTop={index === pendingCandidates.slice(0, 3).length - 1}
                />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                All Done!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                You've reviewed all candidates for this role.
              </p>
              <button
                onClick={() => router.push(`/job/${jobId}/dashboard`)}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                View Results
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      {pendingCandidates.length > 0 && (
        <div className="pb-6 pb-safe px-4">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-3 sm:gap-4">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={swipeHistory.length === 0}
              className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
            >
              <RotateCcw className="w-6 h-6 text-slate-500" />
            </button>

            {/* Reject */}
            <button
              onClick={() => handleSwipe('left')}
              disabled={isAnimating}
              className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg active:scale-95 transition-transform border-3 border-danger touch-manipulation"
            >
              <X className="w-10 h-10 sm:w-12 sm:h-12 text-danger" />
            </button>

            {/* Star */}
            <button
              onClick={handleStar}
              disabled={isAnimating}
              className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-warning touch-manipulation"
            >
              <Star className="w-7 h-7 sm:w-8 sm:h-8 text-warning" />
            </button>

            {/* Interested */}
            <button
              onClick={() => handleSwipe('right')}
              disabled={isAnimating}
              className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg active:scale-95 transition-transform border-3 border-success touch-manipulation"
            >
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-success" />
            </button>
          </div>

          {/* Keyboard hints - only on desktop */}
          <div className="text-center mt-3 text-xs text-slate-400 hidden sm:block">
            ← Reject · → Interested · ↑ Star · Z Undo
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSwipe={(direction) => {
            handleSwipe(direction)
            setSelectedCandidate(null)
          }}
          onStar={() => {
            handleStar()
            setSelectedCandidate(null)
          }}
        />
      )}
    </div>
  )
}
