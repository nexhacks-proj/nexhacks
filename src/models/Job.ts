import { Job } from '@/types'

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

export interface JobDocument extends Job, Document {}

let JobModel: any = null

if (mongoose && Schema) {
  const JobSchema = new Schema(
    {
      id: { type: String, required: true, unique: true },
      title: { type: String, required: true },
      description: { type: String },
      techStack: [{ type: String }],
      experienceLevel: {
        type: String,
        enum: ['none', '1-3', '3+'],
        required: true
      },
      visaSponsorship: { type: Boolean, default: false },
      startupExperiencePreferred: { type: Boolean, default: false },
      portfolioRequired: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    },
    {
      timestamps: true
    }
  )

  // Prevent model re-compilation in Next.js dev mode
  JobModel = mongoose.models?.Job || mongoose.model('Job', JobSchema)
}

export default JobModel
