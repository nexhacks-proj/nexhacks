# Quick Test Guide

## ⚡ Fastest Way to Test

1. **Set your API key:**
   ```bash
   # Create .env.local if it doesn't exist
   echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Open `test-browser.html` in your browser** and click "Run Pipeline Test"

That's it! 🎉

---

## Other Testing Methods

### Method 1: Test Script
```bash
npm install -D tsx  # One-time install
npm run test:pipeline
```

### Method 2: API with VS Code REST Client
- Install "REST Client" extension
- Open `test-api.http`
- Click "Send Request" above any request

### Method 3: Manual API Call
```bash
# Make sure server is running first
curl -X POST http://localhost:3000/api/candidates/pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rawResume": "John Doe\nEmail: john@example.com\n\nEXPERIENCE\n\nSenior Engineer | TechCorp | 2020-Present",
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

## What You Should See

✅ **Success:**
- Profile with candidate name, email, skills
- Card with score (0-100), headline, recommended action
- Email with 3 subject options and body
- All in JSON format

❌ **If you see errors:**
- "ANTHROPIC_API_KEY not set" → Add to `.env.local`
- Network errors → Check server is running
- JSON errors → Check Claude API key is valid

## Next Steps After Testing

1. ✅ Test with different resumes
2. ✅ Try variant B (`promptVariant: "B"`)
3. ✅ Integrate with your UI
4. ✅ Set up Phoenix tracing (optional)

See `TESTING.md` for detailed instructions.
