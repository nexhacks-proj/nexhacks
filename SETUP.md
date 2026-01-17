# SwipeHire Setup Guide

## Quick Start with Gemini AI

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account (the one with Gemini Pro subscription)
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables

1. Open the file [.env.local](.env.local) in the project root
2. Paste your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Save the file

### Step 3: Install Dependencies

Open terminal in the project folder and run:
```bash
npm install
```

Or if you're using the setup script:
```bash
setup.bat
```

### Step 4: Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## How AI Resume Parsing Works

When you upload a resume (text file or paste text):

1. **Upload**: Resume text is sent to `/api/candidates/parse`
2. **AI Processing**: Gemini Pro analyzes the resume using a structured prompt
3. **Extraction**: AI extracts:
   - Skills and technologies
   - Years of experience
   - Work history (with startup detection)
   - Projects and achievements
   - Education
4. **Summarization**: AI generates:
   - Top 3 strengths specific to your job requirements
   - Standout project/achievement
   - Honest 2-3 sentence hiring summary
5. **Card Generation**: Data is formatted into swipeable candidate cards

## Supported Resume Formats

- `.txt` - Plain text resumes
- `.pdf` - PDF resumes (text will be extracted)
- `.doc/.docx` - Word documents
- **Paste Text** - Copy/paste resume text directly

## Testing Without API Key

If you don't have a Gemini API key yet, you can still test the app:

1. Create a new job
2. On the upload page, click "Continue with Mock Data"
3. This uses 8 pre-generated candidates to demo the swipe interface

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
- Make sure `.env.local` exists and contains your API key
- Restart the dev server after adding the key

### Resume parsing fails
- Check that your API key is valid
- Ensure you have quota remaining in your Gemini account
- Try with a simpler/shorter resume first

### Slow parsing
- Gemini API can take 2-5 seconds per resume
- For multiple resumes, they're processed sequentially
- Consider batching uploads in groups of 5-10

## API Rate Limits

Gemini Pro API limits (as of 2026):
- Free tier: 60 requests per minute
- Paid tier: Higher limits based on plan

Each resume = 1 API request

## Cost Estimate

Gemini Pro pricing:
- Free tier: Generous limits for testing
- Paid usage: Very affordable for resume parsing
- Each resume typically costs < $0.01 to process
