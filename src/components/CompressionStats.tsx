'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingDown, Clock, DollarSign } from 'lucide-react'
import { Candidate } from '@/types'

interface CompressionStatsProps {
  candidates: Candidate[]
}

export default function CompressionStats({ candidates }: CompressionStatsProps) {
  // Aggregate compression stats from all candidates
  const stats = candidates.reduce(
    (acc, candidate) => {
      if (candidate.compressionStats) {
        acc.totalOriginal += candidate.compressionStats.originalTokens
        acc.totalCompressed += candidate.compressionStats.compressedTokens
        acc.totalSaved += candidate.compressionStats.saved
        acc.count += 1
      }
      return acc
    },
    { totalOriginal: 0, totalCompressed: 0, totalSaved: 0, count: 0 }
  )

  const compressionRatio = stats.totalOriginal > 0
    ? ((1 - stats.totalCompressed / stats.totalOriginal) * 100).toFixed(1)
    : '0'

  // Estimate cost savings (assuming $0.01 per 1K tokens)
  const costSaved = ((stats.totalSaved / 1000) * 0.01).toFixed(2)

  if (stats.count === 0) {
    return null // Don't show if no compression data
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5" />
        <h3 className="font-semibold">bear-1 Compression</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-emerald-100 text-xs mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Tokens Saved</span>
          </div>
          <p className="text-xl font-bold">{stats.totalSaved.toLocaleString()}</p>
        </div>

        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-emerald-100 text-xs mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Compression</span>
          </div>
          <p className="text-xl font-bold">{compressionRatio}%</p>
        </div>

        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-emerald-100 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Est. Saved</span>
          </div>
          <p className="text-xl font-bold">${costSaved}</p>
        </div>

        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-emerald-100 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Resumes</span>
          </div>
          <p className="text-xl font-bold">{stats.count}</p>
        </div>
      </div>

      <p className="text-xs text-emerald-100 mt-3 text-center">
        Powered by TheTokenCompany's bear-1 model
      </p>
    </div>
  )
}
