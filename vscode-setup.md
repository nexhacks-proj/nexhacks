# VSCode Setup Commands

## 🚀 Run These in VSCode Terminal

Open VSCode's integrated terminal (`` Ctrl+` `` or View → Terminal), then run:

### Step 1: Check if Node.js is installed

```bash
node --version
npm --version
```

If these work, skip to Step 3!

### Step 2: Install Node.js (if needed)

**Option A: Using winget (Windows 10+)**
```bash
winget install OpenJS.NodeJS.LTS
```

Then **restart VSCode** and continue to Step 3.

**Option B: Manual Installation**
1. Go to: https://nodejs.org/
2. Download LTS version
3. Install it
4. Restart VSCode

### Step 3: Install All Dependencies

Run these commands **one at a time** in VSCode terminal:

```bash
# Navigate to project (if not already there)
cd C:\Users\pikal\nexhacks

# Install all project dependencies
npm install

# Install Claude SDK (for new 3-step pipeline)
npm install @anthropic-ai/sdk

# Install testing tool (optional, for test scripts)
npm install -D tsx
```

### Step 4: Verify Installation

```bash
# Check what's installed
npm list --depth=0

# Should show packages like:
# ├── next@14.2.0
# ├── react@18.2.0
# ├── @anthropic-ai/sdk@...
# etc.
```

### Step 5: Start Dev Server

```bash
npm run dev
```

Server will start at: **http://localhost:3000**

---

## 📝 Quick Copy-Paste (All at Once)

If you want to run everything in sequence:

```bash
cd C:\Users\pikal\nexhacks
npm install
npm install @anthropic-ai/sdk
npm install -D tsx
npm run dev
```

---

## ✅ What Gets Installed

- ✅ Next.js (web framework)
- ✅ React (UI library)  
- ✅ TypeScript (type safety)
- ✅ Tailwind CSS (styling)
- ✅ Zustand (state management)
- ✅ Framer Motion (animations)
- ✅ Google Generative AI SDK (Gemini)
- ✅ Claude SDK (new pipeline)
- ✅ tsx (testing tool)

---

## 🔧 VSCode Extensions (Recommended)

While you're in VSCode, install these helpful extensions:

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense**
3. **Prettier - Code formatter**
4. **REST Client** (for testing API endpoints)

---

## 🎯 Troubleshooting

**Terminal shows "command not found"**
→ Make sure you're using VSCode's integrated terminal (not external)

**"node is not recognized"**
→ Install Node.js from nodejs.org, then restart VSCode

**Port 3000 already in use**
→ Stop other servers or use: `npm run dev -- -p 3001`
