'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { Star, Check, Close, Person, Work, AutoAwesome } from '@mui/icons-material'
import { Candidate } from '@/types'

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
  isTop,
}: CandidateCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80
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
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: isTop ? 10 : 0,
        x,
        rotate,
        opacity,
      }}
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
      <Card
        elevation={8}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          mx: { xs: 1, sm: 2 },
          cursor: isTop ? 'grab' : 'default',
          '&:active': {
            cursor: isTop ? 'grabbing' : 'default',
          },
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        {/* Swipe Indicators */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(211, 47, 47, 0.2)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 20,
            opacity: leftIndicatorOpacity,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 2,
              backgroundColor: 'error.main',
              color: 'white',
              borderRadius: '50%',
            }}
          >
            <Close sx={{ fontSize: { xs: 48, sm: 56 } }} />
          </Paper>
        </motion.div>
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(46, 125, 50, 0.2)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 20,
            opacity: rightIndicatorOpacity,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 2,
              backgroundColor: 'success.main',
              color: 'white',
              borderRadius: '50%',
            }}
          >
            <Check sx={{ fontSize: { xs: 48, sm: 56 } }} />
          </Paper>
        </motion.div>

        {/* Card Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            p: { xs: 2, sm: 3 },
            color: 'white',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Person sx={{ fontSize: { xs: 24, sm: 28 } }} />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {candidate.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Work sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {candidate.yearsOfExperience} years exp.
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                onStar()
              }}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Star />
            </IconButton>
          </Box>

          {/* Skills Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {candidate.skills.slice(0, 4).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            ))}
            {candidate.skills.length > 4 && (
              <Chip
                label={`+${candidate.skills.length - 4}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Card Body - Scrollable */}
        <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          {/* Top Strengths */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Key Strengths
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {candidate.topStrengths.slice(0, 3).map((strength, i) => (
                <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography component="span" color="success.main" sx={{ mt: 0.25, flexShrink: 0 }}>
                    ✓
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {strength}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Standout Project */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              backgroundColor: 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <AutoAwesome sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'text.secondary',
                }}
              >
                Standout
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {candidate.standoutProject}
            </Typography>
          </Paper>

          {/* AI Summary */}
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              "{candidate.aiSummary}"
            </Typography>
          </Box>
        </CardContent>

        {/* Feedback Section - Visible only on top card */}
        {isTop && (
          <Box
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              p: { xs: 1.5, sm: 2 },
              backgroundColor: 'action.hover',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1,
                display: 'block',
              }}
            >
              Recruiter Notes
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Add feedback (e.g. 'Love the startup exp', 'Needs React')..."
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.625rem' }}>
              {feedbackText
                ? "Swipe right to LIKE this trait, left to DISLIKE it."
                : "Swipe normally to process without feedback."}
            </Typography>
          </Box>
        )}

        {/* Tap hint */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 }, textAlign: 'center', flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Tap to view full resume
          </Typography>
        </Box>
      </Card>
    </motion.div>
  )
}