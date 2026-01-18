# How to View Data in MongoDB Atlas

## ✅ Your Data is Being Saved!

The logs show candidates are being saved successfully:
- `[candidateStore] ✅ Saved 1 candidate(s) (1 new, 0 updated)`
- `[candidateStore] ✅ Saved 31 candidate(s) (0 new, 31 updated)`

## 📍 Where to Find Your Data in MongoDB Atlas

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/

2. **Navigate to Data Explorer**:
   - Click **"Browse Collections"** or **"Data Explorer"** in the left sidebar
   - Or click your cluster name → **"Browse Collections"**

3. **Select Your Database**:
   - In the left sidebar, expand your cluster: **MainCluster**
   - Expand the database: **swipehire**
   - You'll see two collections:
     - **`jobs`** - Contains all job postings
     - **`candidates`** - Contains all candidate resumes

4. **View the Collections**:
   - Click on **`candidates`** to see all saved candidates
   - Click on **`jobs`** to see all saved jobs
   - Documents will appear in the main view

## 🔍 Quick Access Path

```
MongoDB Atlas Dashboard
  → Clusters (left sidebar)
    → MainCluster
      → Browse Collections
        → swipehire (database)
          → candidates (collection) ← YOUR CANDIDATES ARE HERE!
          → jobs (collection) ← YOUR JOBS ARE HERE!
```

## 📊 What You'll See

### In `candidates` collection:
Each document contains:
- `id` - Unique candidate ID
- `jobId` - Which job they applied for
- `name` - Candidate name
- `email` - Email address
- `rawResume` - Full resume text
- `skills` - Array of skills
- `yearsOfExperience` - Number
- `projects`, `education`, `workHistory` - Arrays
- `topStrengths` - Array
- `aiSummary` - AI-generated summary
- `status` - 'pending', 'interested', 'rejected', or 'starred'

### In `jobs` collection:
Each document contains:
- `id` - Unique job ID
- `title` - Job title
- `techStack` - Array of technologies
- `experienceLevel` - 'none', '1-3', or '3+'
- `visaSponsorship`, `startupExperiencePreferred`, `portfolioRequired` - Booleans
- `createdAt` - Date

## 💡 Pro Tip

You can use the **query bar** at the top to filter:
- `{ status: "pending" }` - See only pending candidates
- `{ jobId: "your-job-id" }` - See candidates for a specific job
- Click "Find" to execute queries
