import { useState } from 'react'
import { X, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'

interface FeedbackModalProps {
  onClose: () => void
  onSave: (type: 'likes' | 'dislikes', text: string) => Promise<void>
  existingLikes: string[]
  existingDislikes: string[]
}

export default function FeedbackModal({ onClose, onSave, existingLikes, existingDislikes }: FeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'likes' | 'dislikes'>('likes')
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setIsSubmitting(true)
    try {
      await onSave(activeTab, inputText.trim())
      setInputText('')
      // We don't close automatically so they can add more
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Refine Ranking
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Tell the AI what you're looking for. It will re-analyze and re-rank the remaining candidates based on your feedback.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'likes'
                  ? 'bg-white dark:bg-slate-600 text-success shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              I Like...
            </button>
            <button
              onClick={() => setActiveTab('dislikes')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'dislikes'
                  ? 'bg-white dark:bg-slate-600 text-danger shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              I Dislike...
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-6">
             <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activeTab === 'likes' ? "e.g., Startup experience..." : "e.g., Job hopping, Lack of degree..."}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSubmitting}
                className="absolute right-2 top-2 bottom-2 px-4 bg-primary-500 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </button>
            </div>
          </form>

          {/* Existing Feedback List */}
          <div className="space-y-4">
             {existingLikes.length > 0 && (
               <div>
                 <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <ThumbsUp className="w-3 h-3 text-success" /> Likes
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {existingLikes.map((item, i) => (
                     <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-success/10 text-success text-xs font-medium border border-success/20">
                       {item}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {existingDislikes.length > 0 && (
               <div>
                 <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <ThumbsDown className="w-3 h-3 text-danger" /> Dislikes
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {existingDislikes.map((item, i) => (
                     <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-danger/10 text-danger text-xs font-medium border border-danger/20">
                       {item}
                     </span>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-medium transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
