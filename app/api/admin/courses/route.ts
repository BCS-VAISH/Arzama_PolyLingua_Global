import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';
import { IUser } from '@/models/User';

type LeanCourse = {
  _id: { toString(): string };
  courseId: string;
  title?: string;
  name?: string;
  description: string;
  price?: number;
  priceCents?: number;
  discount?: number;
  category: string;
  thumbnail?: string;
  videoLink?: string;
  duration?: string;
  level: string;
  createdAt: Date;
  updatedAt: Date;
};

// GET /api/admin/courses - Get all courses
async function handleGet(_req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const courses = await Course.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedCourses = (courses as LeanCourse[]).map((course) => ({
      id: course._id.toString(),
      courseId: course.courseId,
      title: course.title || course.name,
      description: course.description,
      price: course.price || (course.priceCents ? course.priceCents / 100 : 0),
      discount: course.discount || 0,
      category: course.category,
      thumbnail: course.thumbnail,
      videoLink: course.videoLink,
      duration: course.duration,
      level: course.level,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json({
      courses: formattedCourses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course
async function handlePost(req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const {
      title,
      description,
      price,
      discount,
      category,
      thumbnail,
      videoLink,
      duration,
      level,
    } = await req.json();

    if (!title || !description || price === undefined || !category || !level) {
      return NextResponse.json(
        { error: 'Title, description, price, category, and level are required' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    if (discount && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Level must be beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedCategory = sanitizeInput(category);

    const courseId = sanitizedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this title already exists' },
        { status: 409 }
      );
    }

    const course = await Course.create({
      courseId,
      title: sanitizedTitle,
      description: sanitizedDescription,
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      category: sanitizedCategory,
      thumbnail: thumbnail?.trim() || undefined,
      videoLink: videoLink?.trim() || undefined,
      duration: duration?.trim() || undefined,
      level,
      priceCents: Math.round(Number(price) * 100),
      currency: 'inr',
    });

    return NextResponse.json(
      {
        id: course._id.toString(),
        courseId: course.courseId,
        title: course.title,
        description: course.description,
        price: course.price,
        discount: course.discount,
        category: course.category,
        thumbnail: course.thumbnail,
        videoLink: course.videoLink,
        duration: course.duration,
        level: course.level,
        createdAt: course.createdAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'A course with this identifier already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
export const POST = requireAdmin(handlePost);
