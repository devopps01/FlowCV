import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  userId: string;
  title: string;
  description: string;
  templateId: string;
  fileName: string;
  isPublic: boolean;
  isPremium: boolean;
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  ratingCount: number;
  thumbnail: string;
  templateData: any;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  templateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['professional', 'creative', 'executive', 'academic', 'entry-level'],
    default: 'professional'
  },
  tags: [{
    type: String,
    trim: true
  }],
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  templateData: {
    type: Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TemplateSchema.index({ userId: 1, createdAt: -1 });
TemplateSchema.index({ category: 1, isPublic: 1, rating: -1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Template = mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
export default Template;
