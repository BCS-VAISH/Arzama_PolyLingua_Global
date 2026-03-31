import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
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
    content: {
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

// Index for faster queries
CommentSchema.index({ courseId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;

