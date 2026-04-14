import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput, validateComment } from '@/lib/validation';
import { IUser } from '@/models/User';

type PopulatedComment = {
  _id: { toString(): string };
  content: string;
  userId?: { name?: string; email?: string; _id: { toString(): string } } | null;
  createdAt: Date;
};

// GET /api/comments?courseId=...
async function handleGet(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId query parameter is required' },
        { status: 400 }
      );
    }

    let course = await Course.findOne({ courseId });
    if (!course) {
      const courseName =
        courseId === 'english'
          ? 'English Fluency Program'
          : courseId === 'french'
          ? 'French Language Journey'
          : 'Portuguese Mastery Course';

      course = await Course.create({
        courseId,
        title: courseName,
        description: 'Language course',
        price: 3599.00,
        category: 'language',
        level: 'beginner',
      });
    }

    const comments = await Comment.find({ courseId: course._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const formattedComments = (comments as PopulatedComment[]).map((comment) => ({
      id: comment._id.toString(),
      content: comment.content,
      userName: comment.userId?.name || `User ${comment.userId?._id.toString().substring(0, 8)}`,
      userEmail: comment.userId?.email,
      createdAt: comment.createdAt,
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments
async function handlePost(req: NextRequest, user: IUser) {
  try {
    await connectDB();

    const { courseId, content } = await req.json();

    if (!courseId || !content) {
      return NextResponse.json(
        { error: 'courseId and content are required' },
        { status: 400 }
      );
    }

    const commentValidation = validateComment(content);
    if (!commentValidation.valid) {
      return NextResponse.json(
        { error: commentValidation.error },
        { status: 400 }
      );
    }

    let course = await Course.findOne({ courseId });
    if (!course) {
      const courseName =
        courseId === 'english'
          ? 'English Fluency Program'
          : courseId === 'french'
          ? 'French Language Journey'
          : 'Portuguese Mastery Course';

      course = await Course.create({
        courseId,
        title: courseName,
        description: 'Language course',
        price: 3599.00,
        category: 'language',
        level: 'beginner',
      });
    }

    const sanitizedContent = sanitizeInput(content);

    const comment = await Comment.create({
      userId: user._id,
      courseId: course._id,
      content: sanitizedContent,
    });

    await comment.populate('userId', 'name email');
    const populated = comment.userId as unknown as { name?: string } | null;

    return NextResponse.json(
      {
        id: comment._id.toString(),
        content: comment.content,
        userName: populated?.name || `User ${user._id.toString().substring(0, 8)}`,
        createdAt: comment.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export const GET = handleGet;
export const POST = requireAuth(handlePost);
