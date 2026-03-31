import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users
async function handleGet(req: NextRequest, user: any) {
  try {
    await connectDB();

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      users: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);

