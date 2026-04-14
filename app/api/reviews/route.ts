import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput, validateComment, validateRating } from '@/lib/validation';
import { IUser } from '@/models/User';

type PopulatedReview = {
  _id: { toString(): string };
  rating: number;
  comment: string;
  userId?: { name?: string; email?: string; _id: { toString(): string } } | null;
  createdAt: Date;
};

// GET /api/reviews?courseId=...
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

    const reviews = await Review.find({ courseId: course._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? (reviews as PopulatedReview[]).reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const formattedReviews = (reviews as PopulatedReview[]).map((review) => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      userName: review.userId?.name || `User ${review.userId?._id.toString().substring(0, 8)}`,
      userEmail: review.userId?.email,
      createdAt: review.createdAt,
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews
async function handlePost(req: NextRequest, user: IUser) {
  try {
    await connectDB();

    const { courseId, rating, comment } = await req.json();

    if (!courseId || !rating || !comment) {
      return NextResponse.json(
        { error: 'courseId, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (!validateRating(rating)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const commentValidation = validateComment(comment);
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

    const existingReview = await Review.findOne({
      userId: user._id,
      courseId: course._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this course' },
        { status: 409 }
      );
    }

    const sanitizedComment = sanitizeInput(comment);

    const review = await Review.create({
      userId: user._id,
      courseId: course._id,
      rating,
      comment: sanitizedComment,
    });

    await review.populate('userId', 'name email');
    const populated = review.userId as unknown as { name?: string } | null;

    return NextResponse.json(
      {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        userName: populated?.name || `User ${user._id.toString().substring(0, 8)}`,
        createdAt: review.createdAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating review:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this course' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export const GET = handleGet;
export const POST = requireAuth(handlePost);
