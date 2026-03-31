import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const courseId = searchParams.get('courseId');

  if (!userId || !courseId) {
    return NextResponse.json({ enrolled: false, status: null });
  }

  const enrollment = await Enrollment.findOne({
    userId,
    courseId,
  });

  if (!enrollment) {
    return NextResponse.json({ enrolled: false, status: null });
  }

  const isActive =
    enrollment.status === 'PAID' || enrollment.status === 'ADMIN_GRANTED';

  return NextResponse.json({
    enrolled: isActive,
    status: enrollment.status,
  });
}
