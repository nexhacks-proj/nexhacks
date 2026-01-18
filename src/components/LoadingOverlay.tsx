import { Loader2, Sparkles } from 'lucide-react'

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center fade-in animate-in duration-300">
      <div className="text-center max-w-sm px-4">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-500 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Refining Your Applicants
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          The AI is re-analyzing remaining resumes based on your feedback to surface the best matches.
        </p>
      </div>
    </div>
  )
}
