import mongoose, { Schema, model, Document, Model } from 'mongoose';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  salary?: string;
  jobType?: string;
  url?: string;
  notes?: string;
  appliedDate?: string;
  followUpDate?: string;
  contacts?: Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  role: { type: String },
}, { _id: false });

const jobSchema = new Schema<IJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
      default: 'saved',
    },
    salary: {
      type: String,
      default: '',
    },
    jobType: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    appliedDate: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: String,
      default: '',
    },
    contacts: [contactSchema],
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ userId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ company: 1 });

export const Job: Model<IJob> =
  mongoose.models.Job || model<IJob>('Job', jobSchema);
