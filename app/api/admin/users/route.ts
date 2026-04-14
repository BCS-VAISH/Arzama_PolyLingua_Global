import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

type LeanUser = {
  _id: { toString(): string };
  email: string;
  name?: string;
  role: string;
  createdAt: Date;
};

// GET /api/admin/users
async function handleGet(_req: NextRequest, _user: IUser) {
  try {
    await connectDB();

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = (users as LeanUser[]).map((u) => ({
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
