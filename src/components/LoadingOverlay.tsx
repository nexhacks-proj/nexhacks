import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { AutoAwesome } from '@mui/icons-material'

export default function LoadingOverlay() {
  return (
    <Backdrop
      open={true}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 400, px: 2 }}>
        <Box
          sx={{
            position: 'relative',
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 3,
          }}
        >
          <CircularProgress
            size={64}
            thickness={4}
            sx={{
              position: 'absolute',
              color: 'primary.main',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'primary.main',
            }}
          >
            <AutoAwesome sx={{ fontSize: 24, animation: 'pulse 2s ease-in-out infinite' }} />
          </Box>
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Refining Your Applicants
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The AI is re-analyzing remaining resumes based on your feedback to surface the best matches.
        </Typography>
      </Box>
    </Backdrop>
  )
}