import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAdmin } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

// GET /api/admin/courses/[id] - Get single course
async function handleGet(req: NextRequest, user: any) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const courseId = url.pathname.split('/').pop();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: course._id.toString(),
      courseId: course.courseId,
      title: course.title,
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
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update course (accepts MongoDB _id or courseId slug)
async function handlePut(req: NextRequest, user: any) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const rawId = url.pathname.split('/').pop();

    if (!rawId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

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

    // Determine if rawId is a MongoDB ObjectId (24 hex chars) or a courseId slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(rawId);
    let course = isObjectId
      ? await Course.findById(rawId)
      : await Course.findOne({ courseId: rawId });

    // If not found by slug, create a new course record (upsert)
    if (!course && !isObjectId) {
      const COURSE_NAMES: Record<string, string> = {
        english: 'English Mastery',
        french: 'French Mastery',
        portuguese: 'Portuguese Mastery',
      };
      course = await Course.create({
        courseId: rawId,
        title: title || COURSE_NAMES[rawId] || rawId,
        description: description || 'Language course',
        price: Number(price) || 0,
        discount: Number(discount) || 0,
        category: category || 'Language',
        level: level || 'beginner',
        priceCents: Math.round((Number(price) || 0) * 100),
        currency: 'inr',
      });
      return NextResponse.json({
        id: course._id.toString(),
        courseId: course.courseId,
        title: course.title,
        price: course.price,
        discount: course.discount,
      });
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Validation
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (level && !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Level must be beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    // Update fields
    if (title) {
      course.title = sanitizeInput(title);
      // Update courseId if title changed
      const newCourseId = course.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check if new courseId conflicts with another course
      const existingCourse = await Course.findOne({
        courseId: newCourseId,
        _id: { $ne: course._id }
      });
      if (!existingCourse) {
        course.courseId = newCourseId;
      }
    }

    if (description) course.description = sanitizeInput(description);
    if (price !== undefined) {
      course.price = Number(price);
      course.priceCents = Math.round(Number(price) * 100);
    }
    if (discount !== undefined) course.discount = Number(discount);
    if (category) course.category = sanitizeInput(category);
    if (thumbnail !== undefined) course.thumbnail = thumbnail?.trim() || undefined;
    if (videoLink !== undefined) course.videoLink = videoLink?.trim() || undefined;
    if (duration !== undefined) course.duration = duration?.trim() || undefined;
    if (level) course.level = level;

    await course.save();

    return NextResponse.json({
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
      updatedAt: course.updatedAt,
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A course with this identifier already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete course
async function handleDelete(req: NextRequest, user: any) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const courseId = url.pathname.split('/').pop();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
export const PUT = requireAdmin(handlePut);
export const DELETE = requireAdmin(handleDelete);



