import mongoose, { Schema, Document } from 'mongoose'
import { Job } from '@/types'

export interface JobDocument extends Job, Document {}

const JobSchema = new Schema<JobDocument>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
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
export default mongoose.models.Job || mongoose.model<JobDocument>('Job', JobSchema)
