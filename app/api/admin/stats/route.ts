import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Review from '@/models/Review';
import Comment from '@/models/Comment';
import Enrollment from '@/models/Enrollment';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

type LeanReview = { rating: number };
type LeanCourse = { courseId?: string; price?: number; discount?: number };
type LeanEnrollment = { courseId: string };

async function handleGet(_req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const [
      totalUsers,
      totalCourses,
      totalReviews,
      totalComments,
      reviews,
      paidEnrollments,
      allCourses,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Review.countDocuments(),
      Comment.countDocuments(),
      Review.find({}).select('rating').lean(),
      Enrollment.find({ status: { $in: ['PAID', 'ADMIN_GRANTED'] } }).lean(),
      Course.find({}).select('courseId price discount').lean(),
    ]);

    const averageRating =
      reviews.length > 0
        ? (reviews as LeanReview[]).reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const priceMap: Record<string, number> = {};
    (allCourses as LeanCourse[]).forEach((c) => {
      if (c.courseId) {
        priceMap[c.courseId] =
          (c.discount ?? 0) > 0
            ? Math.round((c.price ?? 0) * (1 - (c.discount ?? 0) / 100))
            : c.price ?? 0;
      }
    });

    const totalRevenue = (paidEnrollments as LeanEnrollment[]).reduce((sum, e) => {
      return sum + (priceMap[e.courseId] || 0);
    }, 0);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCourses,
        totalReviews,
        totalComments,
        averageRating: Number(averageRating.toFixed(1)),
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

export const GET = requireAdmin(handleGet);
