import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

type LeanEnrollment = {
  _id: { toString(): string };
  userId: { toString(): string };
  courseId: string;
  status: string;
  createdAt: Date;
};

type LeanUser = { name?: string; email?: string } | null;

const courseNames: Record<string, string> = {
  english: 'English Mastery Course',
  french: 'French Mastery Course',
  portuguese: 'Portuguese Mastery Course',
};

// GET /api/admin/enrollments - list all enrollments with user info
async function handleGet(__req: NextRequest, _adminUser: IUser) {
  try {
    await connectDB();

    const enrollments = await Enrollment.find({})
      .sort({ createdAt: -1 })
      .lean();

    const withUsers = await Promise.all(
      (enrollments as LeanEnrollment[]).map(async (e) => {
        const user = (await User.findById(e.userId).select('name email').lean()) as LeanUser;
        return {
          id: e._id.toString(),
          userId: e.userId.toString(),
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || 'Unknown',
          courseId: e.courseId,
          courseName: courseNames[e.courseId] || e.courseId,
          status: e.status,
          createdAt: e.createdAt,
        };
      })
    );

    return NextResponse.json({ enrollments: withUsers });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// POST /api/admin/enrollments - update enrollment status
async function handlePost(req: NextRequest, _adminUser: IUser) {
  try {
    await connectDB();

    const { enrollmentId, status } = await req.json();

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { error: 'enrollmentId and status are required' },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true }
    );

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
  }
}

// PATCH /api/admin/enrollments - manually grant access
async function handlePatch(req: NextRequest, _adminUser: IUser) {
  try {
    await connectDB();

    const { userId, courseId } = await req.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      );
    }

    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) {
      existing.status = 'ADMIN_GRANTED';
      await existing.save();
    } else {
      await Enrollment.create({ userId, courseId, status: 'ADMIN_GRANTED' });
    }

    return NextResponse.json({ success: true, message: 'Access granted successfully' });
  } catch (error) {
    console.error('Error granting access:', error);
    return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
  }
}

export const GET = requireAdmin(handleGet);
export const POST = requireAdmin(handlePost);
export const PATCH = requireAdmin(handlePatch);
