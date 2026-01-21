import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reviews?courseId=...
export async function GET(req: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { error: 'Database connection not configured. Please set DATABASE_URL in .env.local' },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId query parameter is required' },
        { status: 400 },
      );
    }

    // Ensure course exists
    const course = await prisma.course.upsert({
      where: { courseId: courseId },
      update: {},
      create: {
        courseId: courseId,
        name:
          courseId === 'english'
            ? 'English Fluency Program'
            : courseId === 'french'
            ? 'French Language Journey'
            : 'Portuguese Mastery Course',
        description: 'Language course',
        priceCents: 359900,
        currency: 'inr',
      },
    });

    // Fetch all reviews for this course with user info
    const reviews = await prisma.review.findMany({
      where: { courseId: course.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average rating and total count
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Format reviews for response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userName: review.user.name || `User ${review.user.id.substring(0, 8)}`,
      userEmail: review.user.email,
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error) {
    console.error('Error fetching reviews', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 },
    );
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const { courseId, userId, rating, comment } = await req.json();

    // Validation
    if (!courseId || !userId || !rating || !comment) {
      return NextResponse.json(
        { error: 'courseId, userId, rating, and comment are required' },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 },
      );
    }

    // Ensure course exists
    const course = await prisma.course.upsert({
      where: { courseId: courseId },
      update: {},
      create: {
        courseId: courseId,
        name:
          courseId === 'english'
            ? 'English Fluency Program'
            : courseId === 'french'
            ? 'French Language Journey'
            : 'Portuguese Mastery Course',
        description: 'Language course',
        priceCents: 359900,
        currency: 'inr',
      },
    });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 },
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        courseId: course.id,
        rating,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.user.name || `User ${user.id.substring(0, 8)}`,
        createdAt: review.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating review', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 },
    );
  }
}

