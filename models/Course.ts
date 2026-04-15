import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  courseId?: string; // Optional for backward compatibility
  title: string;
  description: string;
  price: number; // Price in main currency
  discount?: number; // Discount percentage (0-100)
  category: string;
  thumbnail?: string; // URL to thumbnail image
  videoLink?: string; // URL to course video
  duration?: string; // Course duration (e.g., "10 hours", "5 weeks")
  level: 'beginner' | 'intermediate' | 'advanced';
  priceCents?: number; // Legacy field for backward compatibility
  currency?: string; // Legacy field
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    courseId: {
      type: String,
      sparse: true, // Allow multiple nulls
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    videoLink: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Course level is required'],
      default: 'beginner',
    },
    // Legacy fields for backward compatibility
    priceCents: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'inr',
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index({ category: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ createdAt: -1 });

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;

