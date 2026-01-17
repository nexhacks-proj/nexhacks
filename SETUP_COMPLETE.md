# Setup Complete - Next Steps

## Issue: Node.js/npm not found in PATH

Your system doesn't have Node.js/npm accessible from the command line.

## Solution Options

### Option 1: Install Node.js (Recommended)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the LTS version (Windows Installer .msi)
   - Run the installer

2. **After installation:**
   - **Restart your Command Prompt** (important!)
   - Navigate to project:
     ```cmd
     cd C:\Users\pikal\nexhacks
     ```
   - Install dependencies:
     ```cmd
     npm install
     ```
   - Start dev server:
     ```cmd
     npm run dev
     ```

### Option 2: Use Node Version Manager (nvm-windows)

If you prefer managing multiple Node versions:

1. Install nvm-windows: https://github.com/coreybutler/nvm-windows/releases
2. Install Node.js:
   ```cmd
   nvm install lts
   nvm use lts
   ```
3. Then run `npm install` and `npm run dev`

## After Node.js is Installed

Once you can run `npm --version` successfully:

1. **Install dependencies:**
   ```cmd
   npm install
   ```

2. **Add Claude SDK (for new pipeline):**
   ```cmd
   npm install @anthropic-ai/sdk
   ```

3. **Set up environment:**
   - Create/edit `.env.local` file with:
     ```
     GEMINI_API_KEY=AIzaSyATBpTF_aoE7gcqmVf3G7e6-2riB41Fq0c
     # ANTHROPIC_API_KEY=your-claude-key-here (optional)
     ```

4. **Start server:**
   ```cmd
   npm run dev
   ```

5. **Test:**
   - Open: http://localhost:3000
   - Or use: `test-browser.html`

## Quick Check Commands

After installing Node.js, verify:
```cmd
node --version
npm --version
```

Both should show version numbers.

## Need Help?

- Node.js installation: https://nodejs.org/
- Node.js docs: https://nodejs.org/docs/
