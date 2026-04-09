import mongoose, { Schema, model, Document, Model } from 'mongoose';

interface ICoverLetter extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  title: string;
  template: string;
  content: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      professionalTitle: string;
      photo: string;
    };
    date: string;
    recipient: {
      name: string;
      company: string;
      address: string;
    };
    body: string;
    signature: {
      fullName: string;
      place: string;
      date: string;
      image: string;
    };
  };
  design: {
    fontFamily: string;
    primaryColor: string;
  };
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const coverLetterSchema = new Schema<ICoverLetter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
    title: {
      type: String,
      required: true,
      default: 'My Cover Letter',
    },
    template: {
      type: String,
      required: true,
      default: 'classic',
    },
    content: {
      type: {
        personalInfo: {
          fullName: String,
          email: String,
          phone: String,
          location: String,
          professionalTitle: String,
          photo: String,
        },
        date: String,
        recipient: {
          name: String,
          company: String,
          address: String,
        },
        body: String,
        signature: {
          fullName: String,
          place: String,
          date: String,
          image: String,
        },
      },
      default: {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          professionalTitle: '',
          photo: '',
        },
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        recipient: {
          name: '',
          company: '',
          address: '',
        },
        body: 'Dear ______,\n\nSincerely,',
        signature: {
          fullName: '',
          place: '',
          date: '',
          image: '',
        },
      },
    },
    design: {
      type: {
        fontFamily: String,
        primaryColor: String,
      },
      default: {
        fontFamily: 'Inter',
        primaryColor: '#2563eb',
      },
    },
    previewImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

coverLetterSchema.index({ userId: 1 });

export const CoverLetter: Model<ICoverLetter> =
  mongoose.models.CoverLetter || model<ICoverLetter>('CoverLetter', coverLetterSchema);
export type { ICoverLetter };
