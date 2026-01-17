# Setup Environment Variables

## Quick Fix for GEMINI_API_KEY Error

The error shows `GEMINI_API_KEY` is not set. Follow these steps:

### Step 1: Create/Edit `.env.local` File

Create or edit `.env.local` in your project root (`C:\Users\pikal\nexhacks\.env.local`)

Add this line:
```
GEMINI_API_KEY=AIzaSyATBpTF_aoE7gcqmVf3G7e6-2riB41Fq0c
```

### Step 2: Restart Your Dev Server

After creating/editing `.env.local`:

1. **Stop the server** (press `Ctrl+C` in the terminal running `npm run dev`)
2. **Start it again:**
   ```cmd
   npm run dev
   ```

### Step 3: Try Uploading Again

The resume upload should work now!

---

## Complete `.env.local` Example

Your `.env.local` file should look like:

```bash
# Gemini API Key (required)
GEMINI_API_KEY=AIzaSyATBpTF_aoE7gcqmVf3G7e6-2riB41Fq0c

# Claude API Key (optional - for 3-step pipeline)
# ANTHROPIC_API_KEY=your-claude-key-here

# Phoenix Tracing (optional - for Arize)
# PHOENIX_HOST=http://localhost:6006
# PHOENIX_API_KEY=your-phoenix-api-key
```

---

## How to Create `.env.local` in VSCode

1. **In VSCode:**
   - Right-click on the project folder (in Explorer)
   - Select "New File"
   - Name it: `.env.local`

2. **Add the content:**
   ```
   GEMINI_API_KEY=AIzaSyATBpTF_aoE7gcqmVf3G7e6-2riB41Fq0c
   ```

3. **Save the file** (Ctrl+S)

4. **Restart dev server**

---

## Verify It's Working

After restarting the server, you should see:
- ✅ No errors about missing API key
- ✅ Resumes process successfully
- ✅ Check terminal logs - should not show "GEMINI_API_KEY not set"

---

## Troubleshooting

**Still getting the error after creating `.env.local`?**

1. **Check file location:**
   - File must be in project root: `C:\Users\pikal\nexhacks\.env.local`
   - Not in `src/` or any subfolder

2. **Check file name:**
   - Must be exactly: `.env.local` (with the dot at the start)
   - Not `.env`, not `env.local`, not `.env.local.txt`

3. **Restart server:**
   - Environment variables are loaded at startup
   - Must restart after creating/editing `.env.local`

4. **Check syntax:**
   - No spaces around `=`
   - No quotes around the key value
   - One key per line

5. **Verify in terminal:**
   ```cmd
   # Check if file exists
   dir .env.local
   
   # View contents (in Windows)
   type .env.local
   ```

---

## Security Note

⚠️ **Never commit `.env.local` to git!** 
- It's already in `.gitignore`
- Contains sensitive API keys
