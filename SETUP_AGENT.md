# Setup Guide: 3-Step AI Agent Pipeline

## Quick Start

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

For Phoenix tracing (optional but recommended for Arize):
```bash
npm install @arizeai/phoenix-client @arizeai/openinference-core
# OR
npm install arize-ai
```

### 2. Set Environment Variables

Create or update `.env.local`:

```bash
# Required: Claude API Key
ANTHROPIC_API_KEY=your-claude-api-key-here

# Optional: Phoenix Tracing
PHOENIX_HOST=http://localhost:6006
PHOENIX_API_KEY=your-phoenix-api-key
# OR for legacy arize-ai package:
PHOENIX_PROJECT_NAME=hiring-agent
PHOENIX_API_KEY=your-phoenix-api-key
```

### 3. Test the Pipeline

See `examples/pipeline-example.ts` for a complete example.

## API Usage

### Using the New Pipeline Endpoint

```typescript
const response = await fetch('/api/candidates/pipeline', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rawResume: resumeText,
    job: {
      id: 'job-123',
      title: 'Senior Full-Stack Engineer',
      techStack: ['React', 'TypeScript', 'Node.js'],
      experienceLevel: '3+',
      visaSponsorship: false,
      startupExperiencePreferred: true,
      portfolioRequired: false,
      createdAt: new Date()
    },
    promptVariant: 'A', // or 'B' for A/B testing
    enableTracing: true
  })
})

const data = await response.json()
console.log('Score:', data.card.card.score)
console.log('Email subjects:', data.email.email.subject_options)
```

### Using the Legacy Endpoint with New Pipeline

Add `useNewPipeline: true` to existing calls:

```typescript
const response = await fetch('/api/candidates/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rawResume: resumeText,
    name: 'John Doe',
    email: 'john@example.com',
    job: jobObject,
    useNewPipeline: true,  // Enable new pipeline
    promptVariant: 'A'
  })
})
```

## A/B Testing Setup

1. Assign variants consistently:
```typescript
import { assignVariant } from '@/lib/ab-testing'

const variant = assignVariant(candidateId) // Returns 'A' or 'B'
```

2. Run pipeline with variant:
```typescript
const result = await runPipeline(resumeText, jobContext, founderPrefs, {
  promptVariant: variant
})
```

3. Collect metrics:
```typescript
import { computeMetrics } from '@/lib/ab-testing'

const metrics = computeMetrics(
  result.profile,
  result.card,
  result.email,
  variant,
  result.traceId
)
```

4. Compare variants:
```typescript
import { compareVariants } from '@/lib/ab-testing'

const comparison = compareVariants(metricsA, metricsB)
console.log('Valid JSON Rate:', comparison.validJSONRate)
console.log('Skill Coverage:', comparison.avgSkillCoverage)
```

## Phoenix Dashboard

1. Start Phoenix locally or connect to cloud instance
2. Set `PHOENIX_HOST` to your Phoenix URL
3. Pipeline will automatically send traces
4. View traces in Phoenix dashboard using `traceId` from responses

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
- Add `ANTHROPIC_API_KEY` to `.env.local`
- Restart your dev server

### Phoenix tracing not working
- Phoenix is optional - pipeline works without it
- Check that Phoenix packages are installed
- Verify environment variables are set correctly
- Check console for warnings

### JSON parsing errors
- Check Claude API response in logs
- Verify prompts are returning valid JSON
- Check for markdown code blocks in response

## Next Steps

1. ✅ Install dependencies
2. ✅ Set environment variables
3. ✅ Test with `/api/candidates/pipeline`
4. ✅ Set up A/B testing
5. ✅ Configure Phoenix tracing
6. ✅ Run experiments and compare metrics

See `AGENT_PIPELINE.md` for detailed documentation.
