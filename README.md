# SwipeHire - AI-Powered Startup Hiring

A mobile-first web app that helps early-stage startup founders screen job applicants quickly using a Tinder-style swipe interface with AI-powered resume analysis.

## Features

- **Quick Job Setup**: Define role requirements with structured filters (tech stack, experience level, preferences)
- **AI Resume Parsing**: Upload resumes and let Cerebras AI extract skills, experience, and generate summaries
- **Batch Processing**: Process multiple resumes in a single API call for speed
- **ATS Webhook Integration**: Connect to Workday, Greenhouse, Lever, or any ATS via webhook
- **Swipe Interface**: Make quick yes/no decisions with intuitive swipe gestures
- **Candidate Dashboard**: Manage interested, starred, and passed candidates

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (swipe animations)
- Zustand (state management)
- Cerebras AI - GPT OSS 120B (resume parsing)

## Getting Started

### 1. Get your Cerebras API Key

1. Go to [Cerebras Cloud](https://cloud.cerebras.ai/)
2. Create a new API key
3. Copy your API key

### 2. Setup Environment

```bash
# Create .env.local file
echo "CEREBRAS_API_KEY=your_api_key_here" > .env.local

# Optional: Add webhook API key for ATS integration
echo "WEBHOOK_API_KEY=your_secret_key" >> .env.local
```

### 3. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Usage

1. **Create a Job**: Click "Create New Job" and define your role requirements
2. **Upload Resumes**: Upload files or paste text - AI parses them automatically
3. **Or Load Demo Data**: Click "Load Mock Candidates" to test with 20 sample resumes
4. **Review Candidates**: Swipe through AI-summarized candidate cards
   - Swipe right / → : Interested
   - Swipe left / ← : Pass
   - Tap star / ↑ : Save for later
   - Z : Undo last action
5. **Manage Results**: View and manage candidates in the dashboard

---

## ATS Webhook Integration

Connect SwipeHire to your Applicant Tracking System (Workday, Greenhouse, Lever, etc.) to automatically process resumes as they come in.

### Webhook Endpoint

```
POST /api/webhook/ats
```

### Authentication

Include your API key in the request headers:

```
x-api-key: your-webhook-secret
```

Or use Bearer token:

```
Authorization: Bearer your-webhook-secret
```

### Request Payload

```json
{
  "candidate": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567"
  },
  "resume": {
    "text": "Full resume text content here..."
  },
  "job": {
    "id": "job-123",
    "title": "Senior Frontend Engineer",
    "techStack": ["React", "TypeScript", "Node.js"],
    "experienceLevel": "3+",
    "visaSponsorship": false,
    "startupExperiencePreferred": true,
    "portfolioRequired": false,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "metadata": {
    "source": "workday",
    "applicationId": "APP-12345",
    "appliedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Resume Formats

The webhook accepts resumes in three formats:

**1. Plain Text (recommended)**
```json
{
  "resume": {
    "text": "John Doe\nSenior Engineer\n\nEXPERIENCE\n..."
  }
}
```

**2. Base64 Encoded File**
```json
{
  "resume": {
    "base64": "JVBERi0xLjQKJeLjz9...",
    "fileType": "pdf"
  }
}
```
Supported file types: `pdf`, `docx`, `doc`, `txt`

**3. URL (fetched server-side)**
```json
{
  "resume": {
    "url": "https://example.com/resumes/john-doe.pdf"
  }
}
```

### Response

**Success (200)**
```json
{
  "success": true,
  "candidate": {
    "id": "ats-1705312200000-abc123def",
    "jobId": "job-123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "skills": ["React", "TypeScript", "Node.js"],
    "yearsOfExperience": 5,
    "topStrengths": [
      "Strong React expertise with 5 years experience",
      "Led teams at two startups",
      "Full-stack capabilities"
    ],
    "aiSummary": "Strong candidate with relevant startup experience...",
    "status": "pending"
  },
  "message": "Resume processed and stored successfully"
}
```

**Error (4xx/5xx)**
```json
{
  "error": "Missing required candidate fields (name, email)"
}
```

### Webhook Verification

Some ATS systems require endpoint verification. Send a GET request with a challenge parameter:

```
GET /api/webhook/ats?challenge=abc123
```

Response:
```json
{
  "challenge": "abc123"
}
```

### Example: cURL

```bash
curl -X POST https://your-domain.com/api/webhook/ats \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-webhook-secret" \
  -d '{
    "candidate": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "resume": {
      "text": "Jane Smith\nSenior Software Engineer\n\nEXPERIENCE\nGoogle | 2020-Present\n- Built distributed systems\n- Led team of 5\n\nSKILLS\nPython, Go, Kubernetes"
    },
    "job": {
      "id": "job-456",
      "title": "Backend Engineer",
      "techStack": ["Python", "Go", "PostgreSQL"],
      "experienceLevel": "3+",
      "visaSponsorship": false,
      "startupExperiencePreferred": true,
      "portfolioRequired": false,
      "createdAt": "2024-01-01"
    }
  }'
```

### Example: JavaScript/Node.js

```javascript
const response = await fetch('https://your-domain.com/api/webhook/ats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.WEBHOOK_API_KEY
  },
  body: JSON.stringify({
    candidate: {
      name: candidateName,
      email: candidateEmail
    },
    resume: {
      text: resumeText
    },
    job: jobObject
  })
})

const result = await response.json()
console.log('Processed candidate:', result.candidate.id)
```

### Fetching Webhook Candidates

Retrieve candidates that were submitted via webhook:

```
GET /api/candidates/webhook?jobId=job-123
```

Response:
```json
{
  "candidates": [
    {
      "id": "ats-1705312200000-abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["React", "TypeScript"],
      "status": "pending",
      ...
    }
  ]
}
```

### Workday Integration

To connect with Workday:

1. In Workday, go to **Integration** > **Webhooks**
2. Create a new webhook subscription
3. Set the endpoint URL to `https://your-domain.com/api/webhook/ats`
4. Add the `x-api-key` header with your secret
5. Map Workday fields to the expected payload format:
   - `candidate.name` ← Candidate's full name
   - `candidate.email` ← Candidate's email
   - `resume.text` ← Resume content (or use URL)
   - `job` ← Job requisition details

You may need to create a Workday Studio integration to transform the payload format.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/candidates/parse` | POST | Parse single resume with AI |
| `/api/candidates/parse-batch` | POST | Parse multiple resumes in one call |
| `/api/candidates/webhook` | GET | Fetch webhook-submitted candidates |
| `/api/webhook/ats` | POST | ATS webhook for incoming applications |
| `/api/files/convert` | POST | Convert PDF/DOCX to text |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── candidates/
│   │   │   ├── parse/          # Single resume parsing
│   │   │   ├── parse-batch/    # Batch resume parsing
│   │   │   └── webhook/        # Fetch webhook candidates
│   │   ├── files/convert/      # File conversion
│   │   └── webhook/ats/        # ATS webhook endpoint
│   ├── job/[id]/
│   │   ├── upload/             # Resume upload page
│   │   ├── swipe/              # Swipe interface
│   │   └── dashboard/          # Candidate management
│   └── page.tsx                # Home page
├── components/
│   ├── CandidateCard.tsx       # Swipeable card
│   ├── CandidateDetail.tsx     # Full resume modal
│   └── ResumeUploader.tsx      # Upload component
├── data/
│   └── mockCandidates.ts       # 20 sample resumes
├── lib/
│   ├── cerebras.ts             # Cerebras AI integration
│   ├── fileConverter.ts        # PDF/DOCX extraction
│   └── webhookStore.ts         # Webhook candidate storage
├── store/
│   └── useStore.ts             # Zustand state
└── types/
    └── index.ts                # TypeScript types
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CEREBRAS_API_KEY` | Yes | Cerebras API key |
| `WEBHOOK_API_KEY` | No | Secret key for ATS webhook auth |

## License

MIT
