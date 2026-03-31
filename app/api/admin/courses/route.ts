import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

// GET /api/admin/courses - Get all courses
async function handleGet(req: NextRequest, user: any) {
  try {
    await connectDB();

    const courses = await Course.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedCourses = courses.map((course: any) => ({
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
async function handlePost(req: NextRequest, user: any) {
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

    // Validation
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

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedCategory = sanitizeInput(category);

    // Generate courseId from title
    const courseId = sanitizedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if courseId already exists
    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this title already exists' },
        { status: 409 }
      );
    }

    // Create course
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
      priceCents: Math.round(Number(price) * 100), // For backward compatibility
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
  } catch (error: any) {
    console.error('Error creating course:', error);
    
    if (error.code === 11000) {
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



