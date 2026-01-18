import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Job, Candidate, SwipeAction, AIBucket } from '@/types'

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

        const pending = candidates.filter(c => c.jobId === currentJob.id && c.status === 'pending')

        // 1. Define bucket weights. Higher weight means more likely to be picked.
        const bucketWeights: Record<AIBucket, number> = {
          top: 5,
          strong: 4,
          average: 3,
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
            // Only add the bucket to the sampling list if there are candidates in it
            if (candidatesByBucket[b] && candidatesByBucket[b].length > 0) {
              weightedBucketList.push(b)
            }
          }
        }
        
        // 4. Build the final sorted list.
        const sortedCandidates: Candidate[] = []
        const candidatePointers: Record<AIBucket, number> = {
          top: 0,
          strong: 0,
          average: 0,
          weak: 0,
          poor: 0
        }

        while (sortedCandidates.length < pending.length) {
          if (weightedBucketList.length === 0) {
             // This can happen if some candidates don't have a valid bucket.
             // Add remaining candidates to avoid an infinite loop.
             const remaining = pending.filter(c => !sortedCandidates.find(sc => sc.id === c.id));
             sortedCandidates.push(...remaining);
             break;
          }

          // Randomly select a bucket based on weight
          const randomBucketIndex = Math.floor(Math.random() * weightedBucketList.length)
          const selectedBucket = weightedBucketList[randomBucketIndex]

          // Get the next candidate from that bucket
          const candidateIndex = candidatePointers[selectedBucket]
          const candidate = candidatesByBucket[selectedBucket][candidateIndex]
          
          if(candidate) {
            sortedCandidates.push(candidate)
            candidatePointers[selectedBucket]++
          }


          // If we've used all candidates from that bucket, remove it from future sampling
          if (candidatePointers[selectedBucket] >= candidatesByBucket[selectedBucket].length) {
            // Remove all instances of this bucket from the weighted list
            for (let i = weightedBucketList.length - 1; i >= 0; i--) {
              if (weightedBucketList[i] === selectedBucket) {
                weightedBucketList.splice(i, 1)
              }
            }
          }
        }

        return sortedCandidates
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
