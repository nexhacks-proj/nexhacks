import { Candidate } from '@/types'

// Optional mongoose import - handles if mongoose is not installed
let mongoose: any = null
let Schema: any = null
let Document: any = null

try {
  const mongooseModule = require('mongoose')
  mongoose = mongooseModule.default || mongooseModule
  Schema = mongooseModule.Schema
  Document = mongooseModule.Document
} catch (error) {
  // Mongoose not installed - model will return null
}

export interface CandidateDocument extends Candidate, Document {}

let CandidateModel: any = null

if (mongoose && Schema) {
  const ProjectSchema = new Schema({
    name: String,
    description: String,
    technologies: [String]
  }, { _id: false })

  const EducationSchema = new Schema({
    institution: String,
    degree: String,
    field: String,
    year: Number
  }, { _id: false })

  const WorkHistorySchema = new Schema({
    company: String,
    role: String,
    duration: String,
    highlights: [String],
    isStartup: Boolean
  }, { _id: false })

  const CandidateSchema = new Schema<CandidateDocument>(
    {
      id: { type: String, required: true, unique: true },
      jobId: { type: String, required: true, index: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      rawResume: { type: String, required: true },
      
      // AI-extracted fields
      skills: [{ type: String }],
      yearsOfExperience: { type: Number, default: 0 },
      projects: [ProjectSchema],
      education: [EducationSchema],
      workHistory: [WorkHistorySchema],
      
      // AI-generated summary
      topStrengths: [{ type: String }],
      standoutProject: { type: String, default: '' },
      aiSummary: { type: String, default: '' },
      
      // Status
      status: {
        type: String,
        enum: ['pending', 'interested', 'rejected', 'starred'],
        default: 'pending'
      },
      swipedAt: Date
    },
    {
      timestamps: true
    }
  )

  // Create indexes for common queries
  CandidateSchema.index({ jobId: 1, status: 1 })
  CandidateSchema.index({ email: 1 })

  // Prevent model re-compilation in Next.js dev mode
  CandidateModel = mongoose.models?.Candidate || mongoose.model<CandidateDocument>('Candidate', CandidateSchema)
}

export default CandidateModel
