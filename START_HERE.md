# 🚀 START HERE - Quick Setup Guide

## Current Issue

Node.js is not installed or not found in PATH.

## ⚡ Quick Fix (5 minutes)

### Step 1: Install Node.js

1. **Download:** https://nodejs.org/
   - Click the **green "LTS"** button
   - Downloads a `.msi` file

2. **Install:**
   - Run the downloaded file
   - Click through the installer (all defaults are fine)
   - **IMPORTANT:** Make sure "Add to PATH" is checked ✓

3. **Restart Command Prompt:**
   - Close your current CMD window
   - Open a NEW Command Prompt

### Step 2: Verify Installation

In your NEW Command Prompt:

```cmd
node --version
npm --version
```

Both should show version numbers. If they do, you're ready!

### Step 3: Install Dependencies

```cmd
cd C:\Users\pikal\nexhacks
npm install
```

This will take 2-5 minutes. Wait for it to finish.

### Step 4: Set Up Environment

Create `.env.local` in your project folder with:

```
GEMINI_API_KEY=AIzaSyATBpTF_aoE7gcqmVf3G7e6-2riB41Fq0c
```

### Step 5: Start Server

```cmd
npm run dev
```

Server will start at: **http://localhost:3000**

### Step 6: Test

Open your browser and go to: **http://localhost:3000**

---

## 📋 Quick Reference

| Step | Command | Expected Result |
|------|---------|----------------|
| 1 | `node --version` | Shows version (e.g., v20.11.0) |
| 2 | `npm --version` | Shows version (e.g., 10.2.0) |
| 3 | `npm install` | Installs dependencies |
| 4 | `npm run dev` | Starts server on :3000 |

## ❌ Common Issues

**"node is not recognized"**
→ Node.js not installed. Install from nodejs.org

**"npm is not recognized"**
→ Node.js not in PATH. Reinstall and check "Add to PATH"

**Port 3000 already in use**
→ Close other apps or use `npm run dev -- -p 3001`

## ✅ Success Indicators

- ✅ `node --version` works
- ✅ `npm --version` works
- ✅ `npm install` completes without errors
- ✅ `npm run dev` shows "Ready on http://localhost:3000"

---

## Need Help?

- **Node.js download:** https://nodejs.org/
- **Check if installed:** Open new CMD, type `node --version`
