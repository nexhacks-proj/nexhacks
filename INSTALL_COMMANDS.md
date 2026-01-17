# Installation Commands Reference

## ✅ Node.js & npm (Already Installed!)

You already have Node.js and npm installed! If you need to reinstall or verify:

### Windows Installation

**Option 1: Download Installer (Recommended)**
1. Go to: https://nodejs.org/
2. Download the **LTS** (Long Term Support) version
3. Run the `.msi` installer
4. Check "Add to PATH" during installation

**Option 2: Using Chocolatey (If you have it)**
```powershell
choco install nodejs
```

**Option 3: Using winget (Windows 10+)**
```cmd
winget install OpenJS.NodeJS.LTS
```

### Verify Installation

```cmd
node --version
npm --version
```

Both should show version numbers.

---

## 📦 Install Project Dependencies

Already done! But if you need to reinstall:

```cmd
cd C:\Users\pikal\nexhacks
npm install
```

This installs all packages from `package.json`.

---

## 🔧 Install Additional Packages

### For the New 3-Step Pipeline (Claude)

```cmd
npm install @anthropic-ai/sdk
```

This is required for `/api/candidates/pipeline` endpoint.

### For Phoenix Tracing (Optional - for Arize)

```cmd
npm install @arizeai/phoenix-client @arizeai/openinference-core
```

OR legacy package:
```cmd
npm install arize-ai
```

### For Testing (Optional)

```cmd
npm install -D tsx
```

This allows running `npm run test:pipeline`.

---

## 🚀 Complete Setup Command List

Run these in order:

```cmd
# 1. Navigate to project
cd C:\Users\pikal\nexhacks

# 2. Install all dependencies
npm install

# 3. Install Claude SDK (for new pipeline)
npm install @anthropic-ai/sdk

# 4. Install testing tool (optional)
npm install -D tsx

# 5. Start dev server
npm run dev
```

---

## 📋 Quick Check Commands

```cmd
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if packages are installed
npm list

# Check for outdated packages
npm outdated

# Update packages
npm update
```

---

## 🔍 Troubleshooting

**"node is not recognized"**
→ Node.js not installed. Download from nodejs.org

**"npm is not recognized"**
→ Node.js not in PATH. Reinstall Node.js and check "Add to PATH"

**"package not found"**
→ Run `npm install` first

**Permission errors**
→ Run Command Prompt as Administrator

---

## 📦 What's Installed by Default

After `npm install`, you get:
- ✅ Next.js (web framework)
- ✅ React (UI library)
- ✅ TypeScript (type safety)
- ✅ Tailwind CSS (styling)
- ✅ Zustand (state management)
- ✅ Framer Motion (animations)
- ✅ Google Generative AI SDK (for Gemini)

---

## 🎯 One-Line Setup

If you want to install everything at once:

```cmd
cd C:\Users\pikal\nexhacks && npm install && npm install @anthropic-ai/sdk && npm install -D tsx
```

*(Note: `&&` might not work in CMD - run commands separately)*
