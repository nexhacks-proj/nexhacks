# Fix PowerShell Execution Policy Issue

## Quick Fix Options

### Option 1: Use CMD Instead (Easiest)

Just use Command Prompt (cmd) instead of PowerShell:

1. Open **Command Prompt** (not PowerShell)
2. Navigate to your project:
   ```cmd
   cd C:\Users\pikal\nexhacks
   ```
3. Run:
   ```cmd
   npm run dev
   ```

### Option 2: Use Batch File

I've created `run-dev.bat` - just double-click it or run:
```cmd
run-dev.bat
```

### Option 3: Fix PowerShell (Requires Admin)

If you want to use PowerShell:

1. **Open PowerShell as Administrator** (Right-click → Run as Administrator)

2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Type `Y` when prompted**

4. **Close and reopen PowerShell**, then:
   ```powershell
   cd C:\Users\pikal\nexhacks
   npm run dev
   ```

### Option 4: Bypass for Single Command

Run this in PowerShell (no admin needed):
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

Or create an alias:
```powershell
Set-Alias npm-bypass "powershell -ExecutionPolicy Bypass -Command npm"
npm-bypass run dev
```

## Recommended Solution

**Just use Command Prompt (cmd)** - it's the simplest and doesn't require any changes!

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project and run `npm run dev`

## Why This Happens

Windows PowerShell has security policies that prevent running scripts. This is a Windows security feature, not an npm issue.
