import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput, validateComment } from '@/lib/validation';

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

    // Ensure course exists or create it
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

    // Fetch all comments for this course with user info
    const comments = await Comment.find({ courseId: course._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Format comments for response
    const formattedComments = comments.map((comment: any) => ({
      id: comment._id.toString(),
      content: comment.content,
      userName: comment.userId?.name || `User ${comment.userId?._id.toString().substring(0, 8)}`,
      userEmail: comment.userId?.email,
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

// POST /api/comments
async function handlePost(req: NextRequest, user: any) {
  try {
    await connectDB();

    const { courseId, content } = await req.json();

    // Validation
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

    // Ensure course exists or create it
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

    // Sanitize content
    const sanitizedContent = sanitizeInput(content);

    // Create comment
    const comment = await Comment.create({
      userId: user._id,
      courseId: course._id,
      content: sanitizedContent,
    });

    // Populate user info
    await comment.populate('userId', 'name email');

    return NextResponse.json(
      {
        id: comment._id.toString(),
        content: comment.content,
        userName: comment.userId?.name || `User ${user._id.toString().substring(0, 8)}`,
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

