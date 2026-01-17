# 3-Step AI Agent Pipeline

This document describes the 3-step AI agent pipeline for candidate processing, designed for Arize Phoenix integration and A/B testing.

## Overview

The pipeline consists of three sequential steps:

1. **Extract** → Parse resume text into strict JSON candidate profile
2. **Score + Explain** → Generate fit score and swipe card with evidence
3. **Generate Email** → Create interview email draft + questions

Each step returns **strict JSON only** (no markdown, no commentary) for consistency and easy A/B testing.

## Architecture

```
Resume Text
    ↓
[Step 1: Extract] → CandidateProfile (JSON)
    ↓
[Step 2: Score] → SwipeCard (JSON)
    ↓
[Step 3: Email] → EmailDraft (JSON)
    ↓
Complete Pipeline Result
```

## API Endpoints

### 1. New Pipeline Endpoint (Recommended)

**POST** `/api/candidates/pipeline`

```typescript
{
  rawResume: string
  job: Job
  founderPrefs?: FounderPreferences  // Optional
  promptVariant?: 'A' | 'B'         // For A/B testing
  enableTracing?: boolean            // Default: true
}
```

**Response:**
```typescript
{
  success: true
  profile: CandidateProfile
  card: SwipeCard
  email: EmailDraft
  traceId?: string
  promptVariant: 'A' | 'B'
}
```

### 2. Legacy Endpoint (Backward Compatible)

**POST** `/api/candidates/parse`

Add `useNewPipeline: true` to the request body to use the new Claude pipeline instead of Gemini.

## Usage Examples

### Basic Usage

```typescript
import { runPipeline } from '@/lib/claude'
import { jobToJobContext, getDefaultFounderPreferences } from '@/lib/pipeline-helpers'

const jobContext = jobToJobContext(job)
const founderPrefs = getDefaultFounderPreferences('My Company', 'John Doe')

const result = await runPipeline(
  resumeText,
  jobContext,
  founderPrefs,
  {
    promptVariant: 'A',
    enableTracing: true
  }
)

console.log('Score:', result.card.card.score)
console.log('Recommended:', result.card.card.recommended_action)
console.log('Email subject options:', result.email.email.subject_options)
```

### A/B Testing

```typescript
import { assignVariant, computeMetrics, compareVariants } from '@/lib/ab-testing'

// Assign variant based on candidate ID
const variant = assignVariant(candidateId)

// Run pipeline with variant
const result = await runPipeline(resumeText, jobContext, founderPrefs, {
  promptVariant: variant,
  enableTracing: true
})

// Compute metrics
const metrics = computeMetrics(
  result.profile,
  result.card,
  result.email,
  variant,
  result.traceId
)

// Compare variants (after collecting data)
const comparison = compareVariants(metricsA, metricsB)
```

### Using the API Route

```typescript
const response = await fetch('/api/candidates/pipeline', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rawResume: resumeText,
    job: jobObject,
    founderPrefs: {
      founder_name: 'Jane Smith',
      company_name: 'Startup Inc',
      founder_title: 'CEO',
      tone: 'friendly',
      interview_type: '20-min call',
      time_window: 'next week',
      scheduling_link: 'https://cal.com/jane',
      location_policy: 'Remote',
      compensation_note: null
    },
    promptVariant: 'A',
    enableTracing: true
  })
})

const data = await response.json()
```

## Phoenix Tracing

To enable Phoenix tracing:

1. Install Phoenix packages (choose one):
   ```bash
   # Option 1: Official Phoenix packages (recommended)
   npm install @arizeai/phoenix-client @arizeai/openinference-core
   
   # Option 2: Legacy package
   npm install arize-ai
   ```

2. Set environment variables:
   ```bash
   # For @arizeai/phoenix-client
   PHOENIX_HOST=http://localhost:6006  # or PHOENIX_BASE_URL
   PHOENIX_API_KEY=your-api-key
   
   # For arize-ai (legacy)
   PHOENIX_PROJECT_NAME=hiring-agent
   PHOENIX_API_KEY=your-api-key
   ```

3. The pipeline will automatically create spans for each step

Each span includes:
- Step name (extract_candidate_profile, score_and_create_card, generate_email)
- Attributes (job title, candidate name, prompt variant, etc.)
- Status (OK or ERROR)
- Trace ID for correlation

## A/B Testing Metrics

The pipeline tracks these metrics:

- **validJSON**: Whether output is valid JSON
- **requiredSkillCoverage**: Coverage of required skills (0-1)
- **emailHasHooks**: Email includes 2 personalization hooks
- **emailHasNextSteps**: Email includes 2 next steps
- **cardHasEvidence**: Card includes evidence for reasons

Use `computeMetrics()` to calculate these for each pipeline run.

## Prompt Variants

- **Variant A**: Original prompts (default)
- **Variant B**: Alternative prompts for A/B testing

To create Variant B prompts, modify the prompts in `src/lib/claude.ts` or create a separate file.

## Data Structures

See `src/types/agent.ts` for complete type definitions:

- `CandidateProfile`: Extracted candidate data
- `SwipeCard`: Score, reasons, concerns, recommended action
- `EmailDraft`: Email body, subject options, interview questions

## Environment Variables

Required:
- `ANTHROPIC_API_KEY`: Claude API key

Optional:
- `PHOENIX_PROJECT_NAME`: Phoenix project name (default: 'hiring-agent')
- `PHOENIX_API_KEY`: Phoenix API key for tracing

## Migration from Gemini

The legacy Gemini endpoint (`/api/candidates/parse`) is still available. To migrate:

1. Update API calls to use `/api/candidates/pipeline`
2. Or add `useNewPipeline: true` to existing `/api/candidates/parse` calls
3. Update components to use new data structures (see `profileAndCardToCandidate` helper)

## Error Handling

The pipeline includes error handling at each step:
- Invalid JSON responses are caught and re-thrown
- Missing required fields are validated
- Phoenix tracing errors don't break the pipeline (tracing is optional)

## Next Steps for Arize

To satisfy Arize requirements:

1. ✅ **Tracing**: Implemented with Phoenix spans
2. ✅ **A/B Testing**: Prompt variants A/B supported
3. ✅ **Metrics**: Validation functions provided

To complete:
- Set up Phoenix dashboard
- Run A/B tests on a dataset
- Compare metrics between variants
- Export results to Arize
