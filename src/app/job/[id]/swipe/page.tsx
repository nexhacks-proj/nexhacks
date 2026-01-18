'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import CandidateCard from '@/components/CandidateCard'
import CandidateDetail from '@/components/CandidateDetail'
import LoadingOverlay from '@/components/LoadingOverlay'
import { Candidate } from '@/types'
import { ArrowLeft, RotateCcw, X, Star, Heart, Users, CheckCircle, XCircle, Upload } from 'lucide-react'
import { playRejectSound, playSuccessSound, playStarSound, playUndoSound } from '@/lib/sounds'

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
    swipeHistory,
    isReprocessing,
    addFeedback,
    reprocessCandidates
  } = useStore()

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSwipe = useCallback(async (direction: 'left' | 'right', feedback?: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:37',message:'handleSwipe called',data:{direction,isAnimating,pendingCount:getPendingCandidates().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const currentPending = getPendingCandidates()
    if (isAnimating || currentPending.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:40',message:'handleSwipe early return',data:{isAnimating,pendingCount:currentPending.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return
    }

    // Play sound effects
    if (direction === 'left') {
      playRejectSound()
    } else {
      playSuccessSound()
    }

    setIsAnimating(true)
    const candidate = currentPending[0]
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:49',message:'handleSwipe processing candidate',data:{candidateId:candidate.id,direction},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Handle feedback if present
    if (feedback && feedback.trim()) {
      const type = direction === 'right' ? 'likes' : 'dislikes'
      addFeedback(type, feedback.trim())
    }

    setTimeout(async () => {
      swipeCandidate(candidate.id, direction === 'right' ? 'interested' : 'rejected')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:58',message:'swipeCandidate called',data:{candidateId:candidate.id,status:direction === 'right' ? 'interested' : 'rejected'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // If we had feedback, trigger reprocessing AFTER the swipe action
      if (feedback && feedback.trim()) {
        await reprocessCandidates()
      }
      
      setIsAnimating(false)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:65',message:'handleSwipe completed',data:{direction},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }, 300)
  }, [isAnimating, swipeCandidate, addFeedback, reprocessCandidates])

  const handleStar = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:69',message:'handleStar called',data:{pendingCount:getPendingCandidates().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const currentPending = getPendingCandidates()
    if (currentPending.length === 0) return
    const candidate = currentPending[0]
    playStarSound()
    swipeCandidate(candidate.id, 'starred')
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:74',message:'handleStar completed',data:{candidateId:candidate.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }, [swipeCandidate])

  const handleUndo = useCallback(() => {
    if (swipeHistory.length > 0) {
      playUndoSound()
      undoLastSwipe()
    }
  }, [swipeHistory, undoLastSwipe])

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
  }, [selectedCandidate, handleSwipe, handleStar, handleUndo])

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

  if (!currentJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }



  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-100 dark:bg-slate-900 flex flex-col">
      {isReprocessing && <LoadingOverlay />}
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 pt-safe">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push('/')
              }}
              className="p-3 -m-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
              type="button"
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
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/job/${jobId}/upload`)
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all active:scale-95"
                title="Upload More Resumes"
                type="button"
              >
                <Upload className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div className="flex gap-2">
              <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/job/${jobId}/dashboard`)
                  }}
                  className="p-3 -m-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                  type="button"
                >
                  <Users className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </button>
            </div>
            </div>
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
              {(() => {
                const cardsToShow = pendingCandidates.slice(0, 3)
                return cardsToShow.reverse().map((candidate, index) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onSwipe={handleSwipe}
                    onStar={handleStar}
                    onTap={() => setSelectedCandidate(candidate)}
                    isTop={index === cardsToShow.length - 1}
                  />
                ))
              })()}
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
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/job/${jobId}/upload`)
                  }}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-all active:scale-95 flex items-center gap-2"
                  type="button"
                >
                  <Upload className="w-4 h-4" />
                  Upload More Resumes
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/job/${jobId}/dashboard`)
                  }}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all active:scale-95"
                  type="button"
                >
                  View Results
                </button>
              </div>
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
              onClick={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:248',message:'Undo button clicked',data:{swipeHistoryLength:swipeHistory.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                e.preventDefault()
                e.stopPropagation()
                handleUndo()
              }}
              disabled={swipeHistory.length === 0}
              className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
            >
              <RotateCcw className="w-6 h-6 text-slate-500" />
            </button>

            {/* Reject */}
            <button
              onClick={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:257',message:'Reject button clicked',data:{isAnimating,pendingCount:pendingCandidates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                e.preventDefault()
                e.stopPropagation()
                handleSwipe('left')
              }}
              disabled={isAnimating}
              className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-danger touch-manipulation"
            >
              <X className="w-10 h-10 sm:w-12 sm:h-12 text-danger" />
            </button>

            {/* Star */}
            <button
              onClick={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:265',message:'Star button clicked',data:{isAnimating,pendingCount:pendingCandidates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                e.preventDefault()
                e.stopPropagation()
                handleStar()
              }}
              disabled={isAnimating}
              className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-warning touch-manipulation"
            >
              <Star className="w-7 h-7 sm:w-8 sm:h-8 text-warning" />
            </button>

            {/* Interested */}
            <button
              onClick={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'swipe/page.tsx:275',message:'Interested button clicked',data:{isAnimating,pendingCount:pendingCandidates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                e.preventDefault()
                e.stopPropagation()
                handleSwipe('right')
              }}
              disabled={isAnimating}
              className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-success touch-manipulation"
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
