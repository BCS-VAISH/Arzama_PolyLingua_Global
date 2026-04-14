import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

type LeanCourse = {
  _id: { toString(): string };
  courseId: string;
  title?: string;
  name?: string;
  description: string;
  level: string;
  price?: number;
  discount?: number;
};

// Public endpoint — returns all courses or filtered by ?category=
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const query = category ? { category } : {};
    const courses = await Course.find(query).lean();

    const formatted = (courses as LeanCourse[]).map((c) => ({
      id: c._id.toString(),
      courseId: c.courseId,
      title: c.title || c.name,
      description: c.description,
      level: c.level,
      price: c.price || 0,
      discount: c.discount || 0,
      finalPrice: (c.discount ?? 0) > 0
        ? Math.round((c.price ?? 0) * (1 - (c.discount ?? 0) / 100))
        : (c.price || 0),
    }));

    return NextResponse.json({ courses: formatted });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
