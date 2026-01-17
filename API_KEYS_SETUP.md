# API Keys Setup Guide

## Current Setup

✅ **Gemini API Key**: Configured in `.env.local`
- Used for: Legacy `/api/candidates/parse` endpoint
- Status: Ready to use

⚠️ **Claude API Key**: Not configured yet
- Required for: New 3-step pipeline (`/api/candidates/pipeline`)
- Get it from: https://console.anthropic.com/

## Testing Options

### Option 1: Test Legacy Endpoint (Works Now!)

Your Gemini key is set up. You can test the legacy endpoint:

```bash
# Start server
npm run dev

# Test legacy endpoint (uses Gemini)
curl -X POST http://localhost:3000/api/candidates/parse \
  -H "Content-Type: application/json" \
  -d '{
    "rawResume": "John Doe\nEmail: john@example.com\n\nEXPERIENCE\n\nSenior Engineer | TechCorp | 2020-Present",
    "name": "John Doe",
    "email": "john@example.com",
    "job": {
      "id": "test",
      "title": "Senior Engineer",
      "techStack": ["React", "TypeScript"],
      "experienceLevel": "3+",
      "visaSponsorship": false,
      "startupExperiencePreferred": true,
      "portfolioRequired": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }'
```

### Option 2: Test New 3-Step Pipeline (Needs Claude Key)

To test the new pipeline, you need a Claude API key:

1. **Get Claude API Key:**
   - Visit: https://console.anthropic.com/
   - Sign up/login
   - Create an API key
   - Copy it

2. **Add to `.env.local`:**
   ```bash
   ANTHROPIC_API_KEY=your-claude-key-here
   ```

3. **Test the pipeline:**
   ```bash
   npm run dev
   # Then use test-browser.html or test-pipeline.ts
   ```

## Quick Comparison

| Feature | Legacy (Gemini) | New Pipeline (Claude) |
|---------|----------------|----------------------|
| Endpoint | `/api/candidates/parse` | `/api/candidates/pipeline` |
| Steps | 1 (extract + summarize) | 3 (extract → score → email) |
| Output | Basic candidate data | Full profile + card + email |
| A/B Testing | ❌ | ✅ |
| Phoenix Tracing | ❌ | ✅ |
| Email Generation | ❌ | ✅ |

## Next Steps

1. ✅ **Test legacy endpoint** with your Gemini key (works now!)
2. ⏳ **Get Claude key** to test the new 3-step pipeline
3. 🚀 **Use new pipeline** for production (better features)

## Security Note

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`.
