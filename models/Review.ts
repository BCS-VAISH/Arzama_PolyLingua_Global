import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same user for same course
ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Index for faster queries by courseId with sorting by createdAt
// Note: MongoDB can use the compound index above for courseId queries, 
// but this separate index optimizes sorting by createdAt
ReviewSchema.index({ courseId: 1, createdAt: -1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

