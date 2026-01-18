
import { useStore } from './src/store/useStore';
import { Job, Candidate } from './src/types';

// Mock localStorage for Zustand persist
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
global.localStorage = localStorageMock as any;

// Helper to create a mock job
const createMockJob = (id: string): Job => ({
  id,
  title: 'Software Engineer',
  description: 'Develop software',
  techStack: ['React', 'Node.js'],
  experienceLevel: '1-3',
  startupExperiencePreferred: true,
  createdAt: new Date(),
});

// Helper to create mock candidates
const createMockCandidates = (jobId: string, count: number): Candidate[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `cand-${i}`,
    jobId,
    name: `Candidate ${i}`,
    email: `cand${i}@example.com`,
    rawResume: 'Resume content...',
    status: 'pending',
    skills: ['React'],
    yearsOfExperience: 2,
    projects: [],
    education: [],
    workHistory: [],
    topStrengths: [],
    standoutProject: '',
    aiSummary: '',
    aiBucket: 'average', // All in same bucket to test shuffling
  }));
};

async function runTest() {
  console.log('Starting reproduction test...');

  const store = useStore.getState();
  const jobId = 'job-1';
  const job = createMockJob(jobId);
  const candidates = createMockCandidates(jobId, 10);

  // 1. Add candidates
  console.log('Adding candidates...');
  store.addCandidates(candidates);

  // 2. Set current job (First time)
  console.log('Setting current job (1st time)...');
  store.setCurrentJob(job);
  
  const firstRanking = store.rankedPendingIds;
  console.log('First ranking:', firstRanking.join(', '));

  // 3. Set current job again (Simulating swipe/re-render)
  console.log('Setting current job (2nd time)...');
  store.setCurrentJob(job);

  const secondRanking = store.rankedPendingIds;
  console.log('Second ranking:', secondRanking.join(', '));

  // 4. Compare
  const isSame = JSON.stringify(firstRanking) === JSON.stringify(secondRanking);
  
  if (isSame) {
    console.log('SUCCESS: Ranking remained stable.');
  } else {
    console.log('FAILURE: Ranking changed! Issue reproduced.');
  }
}

runTest().catch(console.error);
