# Debugging Environment Variable Issues

## Current Status

The `.env.local` file exists and contains:
```
GEMINI_API_KEY=AIzaSyAE16pD3dz7sfoG762wxphT-j2WaQjV2tw
```

But Next.js is not reading it. Here's how to fix:

## Steps to Fix

### 1. Verify File Location

The `.env.local` file MUST be in the project root:
```
C:\Users\pikal\nexhacks\.env.local  ✅ Correct
C:\Users\pikal\nexhacks\src\.env.local  ❌ Wrong
```

### 2. Restart Dev Server (CRITICAL)

Next.js loads `.env.local` at startup. You MUST restart:

```cmd
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Check File Encoding

The file should be plain text (UTF-8 or ASCII). No BOM, no special encoding.

### 4. Verify File Content

Run this to verify:
```cmd
type .env.local
```

Should show:
```
GEMINI_API_KEY=AIzaSyAE16pD3dz7sfoG762wxphT-j2WaQjV2tw
```

### 5. Check Terminal Logs

After restarting, check the terminal where `npm run dev` is running.

You should see debug output:
```
[DEBUG] GEMINI_API_KEY exists: true
[DEBUG] NODE_ENV: development
```

If you see `false`, the env var isn't loading.

### 6. Try Alternative: Use NEXT_PUBLIC_ Prefix (Not Recommended)

If it still doesn't work, you can try (but this exposes the key to client):
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your-key-here
```

But the proper fix is to ensure `.env.local` is in the root and restart.

### 7. Verify Next.js Configuration

Check `next.config.js` - it should be minimal (no env config needed).

## Common Issues

1. **Server not restarted** - Most common issue!
2. **File in wrong location** - Must be in root
3. **File name wrong** - Must be exactly `.env.local` (not `.env`, not `.env.local.txt`)
4. **Hidden file** - On Windows, `.env.local` might be hidden
5. **Syntax error** - Must be `KEY=value` format, no quotes

## Quick Test

After restarting, try uploading a resume again. Check the terminal logs for the debug output.
