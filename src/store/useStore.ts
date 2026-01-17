import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Job, Candidate, SwipeAction } from '@/types'

interface AppState {
  // Jobs
  jobs: Job[]
  currentJob: Job | null
  createJob: (job: Omit<Job, 'id' | 'createdAt'>) => Job
  setCurrentJob: (job: Job | null) => void

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
          createdAt: new Date()
        }
        set((state) => ({
          jobs: [...state.jobs, newJob],
          currentJob: newJob
        }))
        // Don't auto-load mock candidates - let user upload or load manually
        return newJob
      },

      setCurrentJob: (job) => {
        set({ currentJob: job })
        // Don't auto-load - candidates are uploaded or loaded manually
      },

      // Candidates
      candidates: [],

      loadCandidatesForJob: (jobId) => {
        // No longer auto-loads mock data
        // Candidates are added via addCandidate/addCandidates after AI parsing
      },

      addCandidate: (candidate) => {
        set((state) => ({
          candidates: [...state.candidates, candidate]
        }))
      },

      addCandidates: (candidates) => {
        set((state) => ({
          candidates: [...state.candidates, ...candidates]
        }))
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

      // Filtering
      getPendingCandidates: () => {
        const { candidates, currentJob } = get()
        if (!currentJob) return []
        return candidates.filter(c => c.jobId === currentJob.id && c.status === 'pending')
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
