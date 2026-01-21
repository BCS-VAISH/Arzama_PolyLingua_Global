import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/register
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Create or update user (upsert by email)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name?.trim() || undefined,
      },
      create: {
        email,
        name: name?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error registering user', error);
    
    // Handle unique constraint violation (email already exists)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 },
    );
  }
}

