import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { requireAuth } from '@/lib/auth';
import { IUser } from '@/models/User';

const courseNames: Record<string, string> = {
  english: 'English Mastery Course',
  french: 'French Mastery Course',
  portuguese: 'Portuguese Mastery Course',
};

const courseLinks: Record<string, string> = {
  english: '/EnglishCourse',
  french: '/FrenchCourse',
  portuguese: '/PortugueseCourse',
};

const coursePrices: Record<string, string> = {
  english: '₹2,999',
  french: '₹3,299',
  portuguese: '₹3,599',
};

async function handleGet(req: NextRequest, user: IUser) {
  try {
    await connectDB();

    const enrollments = await Enrollment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = (enrollments as any[]).map((e) => ({
      id: e._id.toString(),
      courseId: e.courseId,
      courseName: courseNames[e.courseId] || e.courseId,
      courseLink: courseLinks[e.courseId] || '/',
      coursePrice: coursePrices[e.courseId] || '',
      status: e.status,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ enrollments: formatted });
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGet);
