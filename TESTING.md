# Testing the 3-Step AI Agent Pipeline

## 🚀 Quick Start

**Easiest way:** Open `test-browser.html` in your browser after starting the dev server!

## Quick Test Options

### Option 1: Browser Test (Recommended for Quick Testing)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open `test-browser.html` in your browser**
   - Double-click the file, or
   - Open it from VS Code with Live Server extension

3. **Click "Run Pipeline Test"** and see results instantly!

### Option 2: Test Script (Recommended for CI/Automation)

1. **Start your Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Test using curl or Postman:**

```bash
curl -X POST http://localhost:3000/api/candidates/pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rawResume": "John Doe\nEmail: john@example.com\nLocation: San Francisco\n\nEXPERIENCE\n\nSenior Software Engineer | TechCorp | 2020-Present\n- Built scalable microservices\n- Led team of 5 engineers\n\nSKILLS\nReact, TypeScript, Node.js, AWS",
    "job": {
      "id": "test-job",
      "title": "Senior Full-Stack Engineer",
      "techStack": ["React", "TypeScript", "Node.js"],
      "experienceLevel": "3+",
      "visaSponsorship": false,
      "startupExperiencePreferred": true,
      "portfolioRequired": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "promptVariant": "A",
    "enableTracing": false
  }'
```

1. **Install tsx (if not already installed):**
   ```bash
   npm install -D tsx
   ```

2. **Run the test:**
   ```bash
   npm run test:pipeline
   # OR
   npx tsx test-pipeline.ts
   ```

Use `test-api.http` file with REST Client extension in VS Code, or import to Postman.

Or use curl:
```bash
curl -X POST http://localhost:3000/api/candidates/pipeline \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## Step-by-Step Testing

### 1. Environment Setup

Make sure you have:
```bash
# Check if .env.local exists
cat .env.local

# Should contain:
ANTHROPIC_API_KEY=your-key-here
```

### 2. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 3. Run Test Script

See `test-pipeline.ts` below - run it with:
```bash
npx tsx test-pipeline.ts
# OR
node --loader ts-node/esm test-pipeline.ts
```

### 4. Check Results

The test will output:
- ✅ Profile extraction
- ✅ Card scoring
- ✅ Email generation
- ✅ Metrics validation
- ❌ Any errors

## What to Look For

### Success Indicators:
- ✅ Valid JSON responses
- ✅ Profile has candidate data
- ✅ Card has score (0-100)
- ✅ Email has subject options
- ✅ No errors in console

### Common Issues:
- ❌ "ANTHROPIC_API_KEY not set" → Add to .env.local
- ❌ JSON parsing errors → Check Claude response format
- ❌ Missing fields → Check prompt output

## Testing A/B Variants

To test both variants:

```typescript
// Test variant A
const resultA = await runPipeline(..., { promptVariant: 'A' })

// Test variant B  
const resultB = await runPipeline(..., { promptVariant: 'B' })

// Compare
console.log('A Score:', resultA.card.card.score)
console.log('B Score:', resultB.card.card.score)
```
