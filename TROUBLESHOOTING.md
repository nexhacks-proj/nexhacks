# MongoDB Connection Troubleshooting

## Current Issue: DNS Resolution Failure

Your diagnostic shows **DNS resolution is failing** for the MongoDB Atlas cluster. This is **very likely caused by school WiFi blocking MongoDB domains**.

## Why School WiFi Blocks This

1. **DNS Filtering**: Blocks `mongodb.net` domains
2. **Port Blocking**: Blocks ports 27017 and sometimes 443
3. **Firewall Rules**: Prevents database connections for security

## Solutions (Try in Order)

### ✅ Solution 1: Use Mobile Hotspot (Easiest)
**This usually works immediately!**

1. Turn on your phone's hotspot
2. Connect your Mac to the hotspot
3. Run: `npm run test:pipeline`

### ✅ Solution 2: Use Home Network
If you have access to home WiFi or another non-school network, try that.

### ✅ Solution 3: Try Different WiFi Network
- Campus WiFi (non-dorm)
- Coffee shop WiFi
- Friend's hotspot

### ⚠️ Solution 4: VPN (Sometimes Works)
Some VPNs can bypass DNS blocks, but many school networks block VPNs too.

### 🔧 Solution 5: Use MongoDB Realm/Atlas HTTP API (Advanced)
Instead of direct database connection, use MongoDB's HTTP API through your Next.js API routes. This uses HTTPS (port 443) which is less likely to be blocked.

### 🚫 What Won't Work
- Changing connection string (DNS is blocked)
- Different MongoDB cluster (same domain gets blocked)
- Different credentials (network issue, not auth issue)

## Quick Test

Run this to see the exact error:
```bash
npm run test:connection
```

If you see:
- `DNS lookup failed` → Network/DNS blocking
- `IP not whitelisted` → MongoDB Atlas config
- `Authentication failed` → Wrong username/password
- `Timeout` → Firewall blocking ports

## For Hackathon

**If you're stuck on school WiFi**, consider:

1. **Mobile hotspot** (fastest solution)
2. **Code locally with mock data** (Zustand/localStorage) and sync to DB later when you have better WiFi
3. **Use MongoDB Compass desktop app** to test if it's a network issue vs code issue

## Verification

Once you're on a different network:
```bash
npm run test:pipeline
```

Should show: `✅ Connected to MongoDB!`
