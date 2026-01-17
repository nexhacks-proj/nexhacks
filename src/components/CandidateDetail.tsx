'use client'

import { Candidate } from '@/types'
import { X, Heart, Star, User, Briefcase, GraduationCap, Code, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CandidateDetailProps {
  candidate: Candidate
  onClose: () => void
  onSwipe: (direction: 'left' | 'right') => void
  onStar: () => void
}

export default function CandidateDetail({
  candidate,
  onClose,
  onSwipe,
  onStar
}: CandidateDetailProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle for mobile */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-5 sm:p-6 text-white flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-3 -m-1 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors touch-manipulation"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 pr-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{candidate.name}</h2>
                <p className="text-primary-100 text-sm sm:text-base truncate">{candidate.email}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4">
              {candidate.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 8 && (
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                  +{candidate.skills.length - 8}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6 touch-scroll">
            {/* AI Summary */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
              <h3 className="font-semibold text-primary-700 dark:text-primary-300 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4" />
                AI Summary
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200">{candidate.aiSummary}</p>
            </div>

            {/* Key Strengths */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Star className="w-4 h-4 text-warning" />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {candidate.topStrengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                    <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Work History */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Briefcase className="w-4 h-4 text-primary-500" />
                Work Experience
              </h3>
              <div className="space-y-4">
                {candidate.workHistory.map((work, i) => (
                  <div
                    key={i}
                    className="border-l-2 border-primary-200 dark:border-primary-700 pl-4"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                        {work.role}
                      </h4>
                      {work.isStartup && (
                        <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full">
                          Startup
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {work.company} · {work.duration}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {work.highlights.map((highlight, j) => (
                        <li key={j} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          • {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {candidate.projects.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Code className="w-4 h-4 text-success" />
                  Projects
                </h3>
                <div className="space-y-3">
                  {candidate.projects.map((project, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 sm:p-4"
                    >
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                        {project.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <GraduationCap className="w-4 h-4 text-primary-500" />
                  Education
                </h3>
                <div className="space-y-2">
                  {candidate.education.map((edu, i) => (
                    <div key={i} className="text-slate-700 dark:text-slate-200">
                      <p className="font-medium text-sm sm:text-base">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {edu.institution} · {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Resume */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 text-slate-500" />
                Original Resume
              </h3>
              <pre className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-mono overflow-x-auto">
                {candidate.rawResume}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 pb-safe">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onSwipe('left')}
                className="flex-1 py-4 bg-danger/10 hover:bg-danger/20 active:bg-danger/30 text-danger font-medium rounded-xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
              >
                <X className="w-5 h-5" />
                <span className="text-sm sm:text-base">Pass</span>
              </button>
              <button
                onClick={onStar}
                className="py-4 px-5 bg-warning/10 hover:bg-warning/20 active:bg-warning/30 text-warning font-medium rounded-xl transition-colors touch-manipulation"
              >
                <Star className="w-6 h-6" />
              </button>
              <button
                onClick={() => onSwipe('right')}
                className="flex-1 py-4 bg-success/10 hover:bg-success/20 active:bg-success/30 text-success font-medium rounded-xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm sm:text-base">Interested</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
