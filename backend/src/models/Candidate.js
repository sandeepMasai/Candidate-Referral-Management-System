import mongoose from 'mongoose';

export const CANDIDATE_STATUSES = ['Pending', 'Reviewed', 'Hired'];

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: CANDIDATE_STATUSES,
      default: 'Pending',
    },
    resumeUrl: {
      type: String,
    },
    resumeFileName: {
      type: String,
    },
    resumePublicId: {
      type: String, // Cloudinary public ID for deletion
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

candidateSchema.index({ email: 1 }, { unique: false });
candidateSchema.index({ referredBy: 1, createdAt: -1 });

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;

