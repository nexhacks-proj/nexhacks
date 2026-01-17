# Node.js Installation Required

## The Problem

Your system doesn't have Node.js installed or it's not in your PATH.

## Solution: Install Node.js

### Step 1: Download Node.js

1. **Go to:** https://nodejs.org/
2. **Download:** Click the green "LTS" button (Long Term Support version)
3. **File:** You'll download a `.msi` file like `node-v20.x.x-x64.msi`

### Step 2: Install Node.js

1. **Run the installer** you just downloaded
2. **Follow the wizard:**
   - Click "Next" through the screens
   - **Check "Add to PATH"** (should be checked by default)
   - Click "Install"
3. **Wait for installation** to complete
4. **Click "Finish"**

### Step 3: Verify Installation

1. **Close ALL Command Prompt windows** (important!)
2. **Open a NEW Command Prompt**
3. **Test Node.js:**
   ```cmd
   node --version
   ```
   Should show: `v20.x.x` or similar

4. **Test npm:**
   ```cmd
   npm --version
   ```
   Should show: `10.x.x` or similar

### Step 4: Run Setup

Once Node.js is installed:

```cmd
cd C:\Users\pikal\nexhacks
setup.bat
```

Or manually:
```cmd
cd C:\Users\pikal\nexhacks
npm install
npm run dev
```

## Alternative: Use Chocolatey

If you have Chocolatey package manager:

```powershell
choco install nodejs
```

## Troubleshooting

**If `node` or `npm` still not recognized after install:**

1. Restart your computer (PATH changes need full restart)
2. Or manually add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" system variable
   - Add: `C:\Program Files\nodejs`

## Need Help?

- Node.js official site: https://nodejs.org/
- Node.js download: https://nodejs.org/en/download/
