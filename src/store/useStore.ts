import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { reprocessResumesAction } from '@/app/actions'
import { Job, Candidate, SwipeAction, AIBucket } from '@/types'

interface AppState {
  // Jobs
  jobs: Job[]
  currentJob: Job | null
  createJob: (job: Omit<Job, 'id' | 'createdAt'>) => Job
  setCurrentJob: (job: Job | null) => void
  deleteJob: (jobId: string) => void
  deleteAllJobs: () => void

  // Candidates
  candidates: Candidate[]
  loadCandidatesForJob: (jobId: string) => void
  addCandidate: (candidate: Candidate) => void
  addCandidates: (candidates: Candidate[]) => void
  getCandidateById: (id: string) => Candidate | undefined

  // Swipe actions
  swipeHistory: SwipeAction[]
  swipeCandidate: (candidateId: string, action: 'interested' | 'rejected' | 'starred') => void
  undoLastSwipe: () => void

  // Filtering
  getPendingCandidates: () => Candidate[]
  getInterestedCandidates: () => Candidate[]
  getRejectedCandidates: () => Candidate[]
  getStarredCandidates: () => Candidate[]

  // New state and actions for ranking
  rankedPendingIds: string[]
  rankPendingCandidatesForCurrentJob: () => void

  // Feedback & Reprocessing
  isReprocessing: boolean
  addFeedback: (type: 'likes' | 'dislikes', text: string) => void
  reprocessCandidates: () => Promise<void>
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Jobs
      jobs: [],
      currentJob: null,

      createJob: (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: Date.now().toString(),
          createdAt: new Date(),
          feedback: { likes: [], dislikes: [] }
        }
        set((state) => ({
          jobs: [...state.jobs, newJob],
          currentJob: newJob
        }))
        // Don't auto-load mock candidates - let user upload or load manually
        return newJob
      },

      setCurrentJob: (job) => {
        const { currentJob, rankedPendingIds } = get()
        // Only re-rank if the job has changed or if we don't have a ranking yet
        // Handle null job case safely
        const shouldRank = !currentJob || !job || currentJob.id !== job.id || rankedPendingIds.length === 0
        
        set({ currentJob: job })
        
        if (shouldRank) {
          get().rankPendingCandidatesForCurrentJob()
        }
      },

      deleteJob: (jobId) => {
        const { currentJob, candidates } = get()
        
        // Remove job from jobs array
        set((state) => ({
          jobs: state.jobs.filter(j => j.id !== jobId),
          // If deleting current job, set to null
          currentJob: currentJob?.id === jobId ? null : currentJob,
          // Also delete all candidates associated with this job
          candidates: state.candidates.filter(c => c.jobId !== jobId),
          // Clear swipe history for this job's candidates
          swipeHistory: state.swipeHistory.filter(sh => {
            const candidate = candidates.find(c => c.id === sh.candidateId)
            return candidate?.jobId !== jobId
          })
        }))
      },

      deleteAllJobs: () => {
        set({
          jobs: [],
          currentJob: null,
          candidates: [],
          swipeHistory: [],
          rankedPendingIds: []
        })
      },

      // Candidates
      candidates: [],
      rankedPendingIds: [],

      loadCandidatesForJob: (jobId) => {
        // No longer auto-loads mock data
        // Candidates are added via addCandidate/addCandidates after AI parsing
      },

      addCandidate: (candidate) => {
        set((state) => ({
          candidates: [...state.candidates, candidate]
        }))
        get().rankPendingCandidatesForCurrentJob()
      },

      addCandidates: (candidates) => {
        set((state) => ({
          candidates: [...state.candidates, ...candidates]
        }))
        get().rankPendingCandidatesForCurrentJob()
      },

      getCandidateById: (id) => {
        return get().candidates.find(c => c.id === id)
      },

      // Swipe actions
      swipeHistory: [],

      swipeCandidate: (candidateId, action) => {
        const status = action === 'interested' ? 'interested' :
                       action === 'rejected' ? 'rejected' : 'starred'

        set((state) => ({
          candidates: state.candidates.map(c =>
            c.id === candidateId
              ? { ...c, status, swipedAt: new Date() }
              : c
          ),
          swipeHistory: [
            ...state.swipeHistory,
            { candidateId, action, timestamp: new Date() }
          ]
        }))
      },

      undoLastSwipe: () => {
        const history = get().swipeHistory
        if (history.length === 0) return

        const lastAction = history[history.length - 1]

        set((state) => ({
          candidates: state.candidates.map(c =>
            c.id === lastAction.candidateId
              ? { ...c, status: 'pending', swipedAt: undefined }
              : c
          ),
          swipeHistory: state.swipeHistory.slice(0, -1)
        }))
      },
      
      rankPendingCandidatesForCurrentJob: () => {
        const { candidates, currentJob } = get()
        if (!currentJob) {
          set({ rankedPendingIds: [] })
          return
        }

        const pending = candidates.filter(c => c.jobId === currentJob.id && c.status === 'pending')

        // 1. Define bucket weights. Higher weight means more likely to be picked.
        const bucketWeights: Record<AIBucket, number> = {
          top: 16,
          strong: 8,
          average: 4,
          weak: 2,
          poor: 1
        }

        // 2. Group candidates by bucket and shuffle within each bucket.
        const candidatesByBucket = pending.reduce((acc, candidate) => {
          const bucket = candidate.aiBucket
          if (!acc[bucket]) {
            acc[bucket] = []
          }
          acc[bucket].push(candidate)
          return acc
        }, {} as Record<AIBucket, Candidate[]>)

        // Shuffle each bucket's candidates
        for (const bucket in candidatesByBucket) {
          const b = bucket as AIBucket
          // Simple array shuffle (Fisher-Yates)
          for (let i = candidatesByBucket[b].length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidatesByBucket[b][i], candidatesByBucket[b][j]] = [candidatesByBucket[b][j], candidatesByBucket[b][i]]
          }
        }

        // 3. Create a weighted list of bucket names to sample from.
        const weightedBucketList: AIBucket[] = []
        for (const bucket in bucketWeights) {
          const b = bucket as AIBucket
          const weight = bucketWeights[b]
          for (let i = 0; i < weight; i++) {
            if (candidatesByBucket[b] && candidatesByBucket[b].length > 0) {
              weightedBucketList.push(b)
            }
          }
        }
        
        // 4. Build the final sorted list.
        const sortedCandidates: Candidate[] = []
        const candidatePointers: Record<AIBucket, number> = { top: 0, strong: 0, average: 0, weak: 0, poor: 0 }

        while (sortedCandidates.length < pending.length) {
          if (weightedBucketList.length === 0) {
             const remaining = pending.filter(c => !sortedCandidates.find(sc => sc.id === c.id));
             sortedCandidates.push(...remaining);
             break;
          }

          const randomBucketIndex = Math.floor(Math.random() * weightedBucketList.length)
          const selectedBucket = weightedBucketList[randomBucketIndex]
          const candidateIndex = candidatePointers[selectedBucket]
          const candidate = candidatesByBucket[selectedBucket][candidateIndex]
          
          if(candidate) {
            sortedCandidates.push(candidate)
            candidatePointers[selectedBucket]++
          }

          if (candidatePointers[selectedBucket] >= candidatesByBucket[selectedBucket].length) {
            for (let i = weightedBucketList.length - 1; i >= 0; i--) {
              if (weightedBucketList[i] === selectedBucket) {
                weightedBucketList.splice(i, 1)
              }
            }
          }
        }
        set({ rankedPendingIds: sortedCandidates.map(c => c.id) })
      },

      // Feedback & Reprocessing
      isReprocessing: false,

      addFeedback: (type, text) => {
        set((state) => {
          if (!state.currentJob) return state
          
          const currentFeedback = state.currentJob.feedback || { likes: [], dislikes: [] }
          const newFeedback = {
            ...currentFeedback,
            [type]: [...currentFeedback[type], text]
          }

          const updatedJob = { ...state.currentJob, feedback: newFeedback }

          return {
            currentJob: updatedJob,
            jobs: state.jobs.map(j => j.id === updatedJob.id ? updatedJob : j)
          }
        })
      },

      reprocessCandidates: async () => {
        const { currentJob, candidates } = get()
        if (!currentJob) return

        set({ isReprocessing: true })

        try {
          // Filter only pending candidates for this job to re-process
          const pendingCandidates = candidates.filter(c => 
            c.jobId === currentJob.id && c.status === 'pending'
          )

          if (pendingCandidates.length === 0) {
            set({ isReprocessing: false })
            return
          }

          // Prepare candidates for batch parsing (we need rawResume)
          const candidatesToProcess = pendingCandidates.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            rawResume: c.rawResume
          }))

          // Re-run the AI parsing with feedback included on the server
          // The job object passed here ALREADY has the updated feedback from addFeedback
          console.log("Reprocessing starting with job feedback (Server Action):", currentJob.feedback)
          const reParsedResults = await reprocessResumesAction(candidatesToProcess, currentJob)
          console.log("Reprocessing results:", reParsedResults)

          // Update candidates in store with new AI results
          set((state) => {
            const updatedCandidates = state.candidates.map(c => {
              const newVal = reParsedResults.find(r => r.id === c.id)
              if (newVal) {
                return {
                  ...c,
                  ...newVal, // Overwrite AI fields (bucket, summary, etc.)
                }
              }
              return c
            })
            return { candidates: updatedCandidates }
          })

          // Re-rank
          get().rankPendingCandidatesForCurrentJob()
          console.log("Reprocessing and ranking complete")

        } catch (error) {
          console.error("Failed to reprocess candidates:", error)
        } finally {
          set({ isReprocessing: false })
        }
      },

      // Filtering
      getPendingCandidates: () => {
        const { candidates, currentJob, rankedPendingIds } = get()
        if (!currentJob) return []
        
        const candidateMap = new Map(candidates.map(c => [c.id, c]))

        const orderedCandidates = rankedPendingIds
          .map(id => candidateMap.get(id))
          .filter((c): c is Candidate => 
            !!c && c.jobId === currentJob.id && c.status === 'pending'
          )

        return orderedCandidates
      },

      getInterestedCandidates: () => {
        const { candidates, currentJob } = get()
        if (!currentJob) return []
        return candidates.filter(c => c.jobId === currentJob.id && c.status === 'interested')
      },

      getRejectedCandidates: () => {
        const { candidates, currentJob } = get()
        if (!currentJob) return []
        return candidates.filter(c => c.jobId === currentJob.id && c.status === 'rejected')
      },

      getStarredCandidates: () => {
        const { candidates, currentJob } = get()
        if (!currentJob) return []
        return candidates.filter(c => c.jobId === currentJob.id && c.status === 'starred')
      }
    }),
    {
      name: 'swipehire-storage',
      partialize: (state) => ({
        jobs: state.jobs,
        candidates: state.candidates,
        swipeHistory: state.swipeHistory
      })
    }
  )
)
