'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Candidate } from '@/types'
import { Star, Check, X, User, Briefcase, Sparkles } from 'lucide-react'

interface CandidateCardProps {
  candidate: Candidate
  onSwipe: (direction: 'left' | 'right', feedback?: string) => void
  onStar: () => void
  onTap: () => void
  isTop: boolean
}

export default function CandidateCard({
  candidate,
  onSwipe,
  onStar,
  onTap,
  isTop
}: CandidateCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  // Visual feedback colors
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80 // Lower threshold for mobile
    if (info.offset.x > threshold) {
      setExitDirection('right')
      onSwipe('right', feedbackText)
    } else if (info.offset.x < -threshold) {
      setExitDirection('left')
      onSwipe('left', feedbackText)
    }
  }

  return (
    <motion.div
      className={`absolute w-full h-full ${isTop ? 'z-10' : 'z-0'}`}
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={
        exitDirection === 'left'
          ? { x: -500, opacity: 0, rotate: -30 }
          : exitDirection === 'right'
          ? { x: 500, opacity: 0, rotate: 30 }
          : {}
      }
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      onClick={(e) => {
        if (Math.abs(x.get()) < 5) {
          onTap()
        }
      }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mx-2 sm:mx-4 cursor-grab active:cursor-grabbing h-full flex flex-col touch-manipulation select-none">
        {/* Swipe Indicators */}
        <motion.div
          className="absolute inset-0 bg-danger/20 rounded-2xl flex items-center justify-center pointer-events-none z-20"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <div className="bg-danger text-white p-4 rounded-full shadow-lg">
            <X className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-success/20 rounded-2xl flex items-center justify-center pointer-events-none z-20"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <div className="bg-success text-white p-4 rounded-full shadow-lg">
            <Check className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
        </motion.div>

        {/* Card Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold truncate">{candidate.name}</h2>
                <div className="flex items-center gap-1 text-primary-100 text-sm">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>{candidate.yearsOfExperience} years exp.</span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStar()
              }}
              className="p-3 -m-1 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors flex-shrink-0"
            >
              <Star className="w-6 h-6" />
            </button>
          </div>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {candidate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                +{candidate.skills.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Card Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 overflow-y-auto touch-scroll">
          {/* Top Strengths */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Key Strengths
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {candidate.topStrengths.slice(0, 3).map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                  <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-xs sm:text-sm leading-snug">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Standout Project */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 sm:mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-warning" />
              Standout
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 line-clamp-3">
              {candidate.standoutProject}
            </p>
          </div>

          {/* AI Summary */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic line-clamp-3">
              "{candidate.aiSummary}"
            </p>
          </div>
        </div>

        {/* Feedback Section - Visible only on top card */}
        {isTop && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50">
             <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
               Recruiter Notes
             </div>
             <input
               type="text"
               value={feedbackText}
               onChange={(e) => setFeedbackText(e.target.value)}
               placeholder="Add feedback (e.g. 'Love the startup exp', 'Needs React')..."
               className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400"
               onKeyDown={(e) => e.stopPropagation()} // Prevent triggering global hotkeys
               onClick={(e) => e.stopPropagation()}
             />
             <p className="text-[10px] text-slate-400 mt-1.5">
               {feedbackText ? "Swipe right to LIKE this trait, left to DISLIKE it." : "Swipe normally to process without feedback."}
             </p>
          </div>
        )}

        {/* Tap hint */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-center flex-shrink-0">
          <span className="text-xs text-slate-400">Tap to view full resume</span>
        </div>
      </div>
    </motion.div>
  )
}
