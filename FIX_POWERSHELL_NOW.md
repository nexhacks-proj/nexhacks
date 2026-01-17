# Quick Fix: PowerShell Execution Policy

## ✅ Solution: Use Command Prompt Instead

**Easiest fix:** VSCode is now configured to use Command Prompt by default!

### Step 1: Close Current Terminal

Close your current PowerShell terminal in VSCode (click the trash icon or type `exit`)

### Step 2: Open New Terminal

Press `` Ctrl+` `` or go to: **Terminal → New Terminal**

It should now open **Command Prompt** (shows `C:\Users\pikal\nexhacks>`) instead of PowerShell.

### Step 3: Run Your Commands

Now these will work without errors:

```cmd
npm install
npm install @anthropic-ai/sdk
npm install -D tsx
npm run dev
```

---

## 🔄 Alternative: Fix PowerShell (If You Prefer PowerShell)

If you want to use PowerShell instead:

### Option 1: Change Execution Policy (Requires Admin)

1. **Open PowerShell as Administrator**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Type `Y` when prompted**

4. **Restart VSCode**

### Option 2: Bypass for Single Command (No Admin)

In PowerShell, use `npm.cmd` instead of `npm`:

```powershell
npm.cmd install
npm.cmd install @anthropic-ai/sdk
npm.cmd install -D tsx
npm.cmd run dev
```

### Option 3: Use the Batch File

Just run the batch file I created:

```powershell
.\install-all.bat
```

---

## ✅ Recommended: Use Command Prompt

**Just close your PowerShell terminal and open a new one** - it will use Command Prompt by default now and all npm commands will work!

The VSCode settings have been updated to default to Command Prompt.
