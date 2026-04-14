import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

// DELETE /api/reviews/[id]
async function handleDelete(req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const reviewId = url.pathname.split('/').pop();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  return requireAdmin(handleDelete)(req);
}
