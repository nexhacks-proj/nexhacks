# ⚡ Quick Fix for PowerShell Error

## The Problem
PowerShell execution policy is blocking npm commands.

## ✅ EASIEST SOLUTION (Do This Now!)

### 1. Close Current Terminal
Click the trash icon (🗑️) on your terminal tab in VSCode

### 2. Open New Terminal
Press: `` Ctrl + ` ``
or go to: **Terminal → New Terminal**

### 3. It Will Now Use Command Prompt
You'll see: `C:\Users\pikal\nexhacks>` instead of `PS C:\...`

### 4. Run These Commands (They'll Work Now!)

```cmd
npm install
npm install @anthropic-ai/sdk
npm install -D tsx
npm run dev
```

**That's it!** Command Prompt doesn't have the PowerShell execution policy issue.

---

## 🎯 Why This Works

I updated your VSCode settings to use **Command Prompt** instead of PowerShell by default.

**VSCode settings updated:**
- `.vscode/settings.json` now defaults to Command Prompt
- All new terminals will use Command Prompt
- npm commands work without execution policy issues

---

## 📝 Alternative: If You Want to Keep PowerShell

If you prefer PowerShell, run these commands instead:

```powershell
npm.cmd install
npm.cmd install @anthropic-ai/sdk  
npm.cmd install -D tsx
npm.cmd run dev
```

Or use the batch file:
```powershell
.\install-all.bat
```

---

## ✅ Just Do This:

1. **Close terminal** (click trash icon)
2. **Open new terminal** (Ctrl+`)
3. **Run your commands** - they'll work now!
