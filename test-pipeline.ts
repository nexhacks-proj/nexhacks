#!/usr/bin/env tsx
/**
 * Test script to verify MongoDB connection and database operations
 * Run with: npm run test:pipeline
 */

import mongoose from 'mongoose'
import connectDB from './src/lib/db'
import CandidateModel from './src/models/Candidate'
import JobModel from './src/models/Job'
import { Candidate, Job } from './src/types'

async function testDatabase() {
  console.log('🧪 Testing MongoDB Connection...\n')
  
  // Show connection info (without password)
  const uri = process.env.MONGODB_URI || 'mongodb+srv://elgooseman321_db_user:***@maincluster.ndr3cps.mongodb.net/swipehire?retryWrites=true&w=majority&appName=MainCluster'
  console.log(`📡 Connection: ${uri.replace(/:[^:@]+@/, ':***@')}\n`)

  try {
    // 1. Test Connection
    console.log('1️⃣  Testing database connection...')
    await connectDB()
    console.log('   ✅ Connected to MongoDB!\n')

    // 2. Test Job Model
    console.log('2️⃣  Testing Job model...')
    const testJob: Job = {
      id: `test-job-${Date.now()}`,
      title: 'Test Full-Stack Engineer',
      techStack: ['React', 'TypeScript', 'Node.js'],
      experienceLevel: '3+',
      visaSponsorship: false,
      startupExperiencePreferred: true,
      portfolioRequired: false,
      createdAt: new Date()
    }

    const jobDoc = await JobModel.findOneAndUpdate(
      { id: testJob.id },
      testJob,
      { upsert: true, new: true }
    )
    console.log(`   ✅ Job created/updated: ${jobDoc.title} (${jobDoc.id})\n`)

    // 3. Test Candidate Model
    console.log('3️⃣  Testing Candidate model...')
    const testCandidate: Candidate = {
      id: `test-candidate-${Date.now()}`,
      jobId: testJob.id,
      name: 'Test Candidate',
      email: 'test@example.com',
      rawResume: 'Test resume content...',
      skills: ['React', 'TypeScript'],
      yearsOfExperience: 5,
      projects: [],
      education: [],
      workHistory: [],
      topStrengths: ['Strong React skills'],
      standoutProject: 'Test project',
      aiSummary: 'Test candidate summary',
      aiBucket: 'average' as const,
      status: 'pending' as const
    }

    const candidateDoc = await CandidateModel.findOneAndUpdate(
      { id: testCandidate.id },
      testCandidate,
      { upsert: true, new: true }
    )
    console.log(`   ✅ Candidate created/updated: ${candidateDoc.name} (${candidateDoc.id})\n`)

    // 4. Test Queries
    console.log('4️⃣  Testing queries...')
    const candidatesByJob = await CandidateModel.find({ jobId: testJob.id }).lean()
    console.log(`   ✅ Found ${candidatesByJob.length} candidate(s) for job ${testJob.id}\n`)

    const jobs = await JobModel.find({}).lean()
    console.log(`   ✅ Found ${jobs.length} job(s) in database\n`)

    // 5. Cleanup Test Data (optional - comment out if you want to keep test data)
    console.log('5️⃣  Cleaning up test data...')
    await CandidateModel.deleteOne({ id: testCandidate.id })
    await JobModel.deleteOne({ id: testJob.id })
    console.log('   ✅ Test data cleaned up\n')

    console.log('🎉 All tests passed! Database is working correctly.\n')

  } catch (error) {
    console.error('\n❌ Test failed!\n')
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('ip') || errorMsg.includes('whitelist') || errorMsg.includes('network')) {
        console.error('🔒 IP WHITELISTING REQUIRED')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('Your IP address needs to be whitelisted in MongoDB Atlas.')
        console.error('')
        console.error('Quick fix:')
        console.error('1. Go to: https://cloud.mongodb.com/')
        console.error('2. Network Access → IP Access List')
        console.error('3. Click "Add IP Address"')
        console.error('4. Click "Add Current IP Address" (or use 0.0.0.0/0 for testing)')
        console.error('5. Wait 1-2 minutes for changes to propagate')
        console.error('6. Run this test again')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      }
      
      console.error('Error details:', error.message)
      if (!errorMsg.includes('ip') && !errorMsg.includes('whitelist')) {
        console.error('Stack:', error.stack)
      }
    } else {
      console.error('Unknown error:', error)
    }
    
    process.exit(1)
  } finally {
    // Close connection
    await mongoose.connection.close()
    console.log('👋 Database connection closed')
  }
}

// Run the test
testDatabase().catch(console.error)
