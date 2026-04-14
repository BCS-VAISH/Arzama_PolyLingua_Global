import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

type PopulatedReview = {
  _id: { toString(): string };
  rating: number;
  comment: string;
  userId?: { name?: string; email?: string; _id: { toString(): string } } | null;
  courseId?: { courseId?: string; title?: string } | null;
  createdAt: Date;
};

// GET /api/admin/reviews
async function handleGet(_req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const reviews = await Review.find({})
      .populate('userId', 'name email')
      .populate('courseId', 'courseId title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedReviews = (reviews as PopulatedReview[]).map((review) => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      userName: review.userId?.name || `User ${review.userId?._id.toString().substring(0, 8)}`,
      userEmail: review.userId?.email,
      courseId: review.courseId?.courseId,
      courseName: review.courseId?.title,
      createdAt: review.createdAt,
    }));

    return NextResponse.json({
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
