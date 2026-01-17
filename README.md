# SwipeHire - Startup Hiring Swipe App

A mobile-first web app that helps early-stage startup founders screen job applicants quickly using a swipe-based interface.

## Features

- **Quick Job Setup**: Define role requirements with structured filters (tech stack, experience level, preferences)
- **AI Resume Parsing**: Upload resumes and let Gemini AI extract skills, experience, and generate summaries
- **AI-Powered Candidate Cards**: Each candidate is summarized into high-signal cards with key strengths highlighted
- **Swipe Interface**: Make quick yes/no decisions with intuitive swipe gestures
- **Candidate Dashboard**: Manage interested, starred, and passed candidates
- **Keyboard Navigation**: Arrow keys for swiping, Z for undo

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (swipe animations)
- Zustand (state management)
- Lucide React (icons)
- Google Gemini Pro (AI resume parsing)

## Getting Started

### 1. Get your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy your API key

### 2. Setup Environment

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local and add your Gemini API key
# GEMINI_API_KEY=your_api_key_here
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Usage

1. **Create a Job**: Click "Create New Job" and define your role requirements
2. **Upload Resumes**: Upload resume files or paste text - Gemini AI will parse them automatically
3. **Review Candidates**: Swipe through AI-summarized candidate cards
   - Swipe right / → : Interested
   - Swipe left / ← : Pass
   - Tap star / ↑ : Save for later
   - Z : Undo last action
4. **Manage Results**: View and manage candidates in the dashboard

### Testing without AI

You can skip the upload step and use mock candidates to test the interface without an API key.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   └── candidates/    # Candidate processing endpoints
│   ├── page.tsx           # Home page
│   ├── job/new/           # Job creation page
│   └── job/[id]/          # Job-specific pages
│       ├── upload/        # Resume upload page
│       ├── swipe/         # Swipe interface
│       └── dashboard/     # Candidate management
├── components/            # React components
│   ├── CandidateCard.tsx  # Swipeable card component
│   ├── CandidateDetail.tsx # Full resume modal
│   └── ResumeUploader.tsx # AI resume upload
├── data/                  # Mock candidate data
├── lib/                   # Utilities
│   └── gemini.ts          # Gemini AI integration
├── store/                 # Zustand state management
└── types/                 # TypeScript types
```
