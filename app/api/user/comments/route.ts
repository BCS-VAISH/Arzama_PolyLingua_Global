import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';

// GET /api/user/comments
async function handleGet(req: NextRequest, user: any) {
  try {
    await connectDB();

    const comments = await Comment.find({ userId: user._id })
      .populate('courseId', 'courseId title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedComments = comments.map((comment: any) => ({
      id: comment._id.toString(),
      content: comment.content,
      courseId: comment.courseId?.courseId,
      courseName: comment.courseId?.title,
      createdAt: comment.createdAt,
    }));

    return NextResponse.json({
      comments: formattedComments,
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGet);

