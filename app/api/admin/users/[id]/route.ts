import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Review from '@/models/Review';
import Comment from '@/models/Comment';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

// DELETE /api/admin/users/[id] - delete a user and all their data
async function handleDelete(
  req: NextRequest,
  adminUser: IUser,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToDelete.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user's enrollments, reviews, and comments
    await Enrollment.deleteMany({ userId: id });
    await Review.deleteMany({ userId: id });
    await Comment.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

// Next.js App Router dynamic route handlers need to wrap with requireAdmin differently
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return requireAdmin((r: NextRequest, user: IUser) =>
    handleDelete(r, user, context)
  )(req);
}
