import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';

// GET /api/user/reviews
async function handleGet(req: NextRequest, user: any) {
  try {
    await connectDB();

    const reviews = await Review.find({ userId: user._id })
      .populate('courseId', 'courseId title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedReviews = reviews.map((review: any) => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      courseId: review.courseId?.courseId,
      courseName: review.courseId?.title,
      createdAt: review.createdAt,
    }));

    return NextResponse.json({
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGet);

