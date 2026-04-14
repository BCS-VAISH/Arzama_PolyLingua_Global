import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { requireAuth } from '@/lib/auth';
import { IUser } from '@/models/User';

type PopulatedComment = {
  _id: { toString(): string };
  content: string;
  courseId?: { courseId?: string; title?: string } | null;
  createdAt: Date;
};

// GET /api/user/comments
async function handleGet(_req: NextRequest, user: IUser) {
  try {
    await connectDB();

    const comments = await Comment.find({ userId: user._id })
      .populate('courseId', 'courseId title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedComments = (comments as PopulatedComment[]).map((comment) => ({
      id: comment._id.toString(),
      content: comment.content,
      courseId: comment.courseId?.courseId,
      courseName: comment.courseId?.title,
      createdAt: comment.createdAt,
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGet);
