import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

// Public endpoint — returns all courses with current prices
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).lean();

    const formatted = courses.map((c: any) => ({
      id: c._id.toString(),
      courseId: c.courseId,
      title: c.title || c.name,
      price: c.price || 0,
      discount: c.discount || 0,
      finalPrice: c.discount > 0
        ? Math.round(c.price * (1 - c.discount / 100))
        : (c.price || 0),
    }));

    return NextResponse.json({ courses: formatted });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
