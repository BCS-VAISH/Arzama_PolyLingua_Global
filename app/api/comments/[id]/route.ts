import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

// DELETE /api/comments/[id]
async function handleDelete(req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const { id } = await req.json();
    const url = new URL(req.url);
    const commentId = url.pathname.split('/').pop();

    const targetId = id || commentId;

    if (!targetId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(targetId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    await Comment.findByIdAndDelete(targetId);

    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const commentId = url.pathname.split('/').pop();

  const modifiedReq = new NextRequest(req.url, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify({ id: commentId }),
  });

  return requireAdmin(handleDelete)(modifiedReq);
}
