import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { requireAdmin } from '@/lib/auth';
import { IUser } from '@/models/User';

async function handleGet(_req: NextRequest, _user: IUser) {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      contacts: contacts.map(c => ({
        id: c._id.toString(),
        fullname: c.fullname,
        email: c.email,
        message: c.message,
        status: c.status,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}

async function handlePatch(req: NextRequest, _user: IUser) {
  try {
    await connectDB();
    const { id, status } = await req.json();
    if (!id || !['new', 'read', 'replied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    await Contact.findByIdAndUpdate(id, { status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update query' }, { status: 500 });
  }
}

async function handleDelete(req: NextRequest, _user: IUser) {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete query' }, { status: 500 });
  }
}

export const GET = requireAdmin(handleGet);
export const PATCH = requireAdmin(handlePatch);
export const DELETE = requireAdmin(handleDelete);
