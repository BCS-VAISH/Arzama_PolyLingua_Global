import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/comments
async function handleGet(req: NextRequest, user: any) {
  try {
    await connectDB();

    const comments = await Comment.find({})
      .populate('userId', 'name email')
      .populate('courseId', 'courseId title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedComments = comments.map((comment: any) => ({
      id: comment._id.toString(),
      content: comment.content,
      userName: comment.userId?.name || `User ${comment.userId?._id.toString().substring(0, 8)}`,
      userEmail: comment.userId?.email,
      courseId: comment.courseId?.courseId,
      courseName: comment.courseId?.title,
      createdAt: comment.createdAt,
    }));

    return NextResponse.json({
      comments: formattedComments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);

