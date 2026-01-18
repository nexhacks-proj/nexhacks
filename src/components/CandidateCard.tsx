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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CandidateCard.tsx:43',message:'handleDragEnd called',data:{offsetX:info.offset.x,feedbackText,isTop},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const threshold = 80
    if (info.offset.x > threshold) {
      setExitDirection('right')
      onSwipe('right', feedbackText)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CandidateCard.tsx:47',message:'Swipe right triggered',data:{feedbackText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } else if (info.offset.x < -threshold) {
      setExitDirection('left')
      onSwipe('left', feedbackText)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CandidateCard.tsx:50',message:'Swipe left triggered',data:{feedbackText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CandidateCard.tsx:77',message:'Card clicked',data:{xValue:x.get(),isTop},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
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

        {/* Card Header - Compressed */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            p: { xs: 1.5, sm: 2 },
            color: 'white',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Person sx={{ fontSize: { xs: 20, sm: 22 } }} />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {candidate.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Work sx={{ fontSize: 14 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem' }}>
                    {candidate.yearsOfExperience} years
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b0c145db-8445-481e-8029-d20c16f75259',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CandidateCard.tsx:193',message:'Star icon clicked',data:{candidateId:candidate.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                e.stopPropagation()
                onStar()
              }}
              size="small"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Star fontSize="small" />
            </IconButton>
          </Box>

          {/* Skills Tags - Compact */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {candidate.skills.slice(0, 5).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ))}
            {candidate.skills.length > 5 && (
              <Chip
                label={`+${candidate.skills.length - 5}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Card Body - Scrollable */}
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 1.25, sm: 1.5 } }}>
          {/* Top Strengths */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 0.75,
                fontSize: '0.7rem',
              }}
            >
              Key Strengths
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {candidate.topStrengths.slice(0, 3).map((strength, i) => (
                <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                  <Typography component="span" color="success.main" sx={{ mt: 0.2, flexShrink: 0, fontSize: '0.875rem' }}>
                    ✓
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: '0.875rem' }}>
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
              p: { xs: 1.25, sm: 1.5 },
              backgroundColor: 'action.hover',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <AutoAwesome sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                }}
              >
                Standout Project
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
              }}
            >
              {candidate.standoutProject}
            </Typography>
          </Paper>

          {/* AI Summary */}
          <Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                fontStyle: 'italic',
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
              }}
            >
              "{candidate.aiSummary}"
            </Typography>
          </Box>
        </CardContent>

        {/* Bottom Section - Integrated Notes & Tap Hint */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            p: { xs: 1.25, sm: 1.5 },
            backgroundColor: 'background.paper',
            flexShrink: 0,
          }}
        >
          {/* Recruiter Notes - Compact, only on top card */}
          {isTop && (
            <Box sx={{ mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Add notes (e.g. 'Great startup exp', 'Needs React')..."
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.8125rem',
                    '& input': {
                      py: 0.75,
                    },
                  },
                }}
              />
              {feedbackText && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.65rem' }}>
                  Swipe right to LIKE, left to DISLIKE this trait
                </Typography>
              )}
            </Box>
          )}
          
          {/* Tap hint */}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'block',
              textAlign: 'center',
              fontSize: '0.75rem',
            }}
          >
            Tap to view full resume
          </Typography>
        </Box>
      </Card>
    </motion.div>
  )
}