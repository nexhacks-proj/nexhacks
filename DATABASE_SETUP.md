# MongoDB Database Setup

## Connection String

The database is configured with:
- **Username**: `elgooseman321_db_user`
- **Password**: `VkOrkGwTYnu64tuz`
- **Cluster**: `maincluster.ndr3cps.mongodb.net`
- **Database Name**: `swipehire`

## Quick Fix for IP Whitelisting

The test is failing because your IP address isn't whitelisted in MongoDB Atlas. To fix:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access** → **IP Access List**
3. Click **Add IP Address**
4. Either:
   - Click **Add Current IP Address** (recommended for security)
   - OR add `0.0.0.0/0` to allow all IPs (⚠️ only for hackathon/testing)

## Testing the Connection

Once IP is whitelisted, run:

```bash
npm run test:pipeline
```

This will test:
- ✅ Database connection
- ✅ Job model creation/updates
- ✅ Candidate model creation/updates
- ✅ Query operations

## Environment Variables

You can override the connection string with an environment variable:

```bash
# Create .env.local file
echo "MONGODB_URI=mongodb+srv://elgooseman321_db_user:VkOrkGwTYnu64tuz@maincluster.ndr3cps.mongodb.net/swipehire?retryWrites=true&w=majority&appName=MainCluster" > .env.local
```

## Models

The database includes two main models:

### Job Model
- Stores job postings with requirements
- Fields: title, techStack, experienceLevel, etc.

### Candidate Model
- Stores candidate resumes and AI-parsed data
- Fields: name, email, skills, workHistory, aiSummary, etc.
- Indexed by `jobId` and `status` for fast queries

## API Routes Using Database

All these routes now use MongoDB:
- `/api/webhook/ats` - Stores webhook candidates in DB
- `/api/candidates/webhook` - Fetches candidates from DB
