import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/validation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, verifiedToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!verifiedToken) {
      return NextResponse.json({ error: 'Email verification required. Please verify your email first.' }, { status: 400 });
    }

    // Verify the email-verified token
    let tokenPayload: { email: string; type: string } | null = null;
    try {
      tokenPayload = jwt.verify(verifiedToken, JWT_SECRET) as { email: string; type: string };
    } catch {
      return NextResponse.json({ error: 'Verification token expired. Please restart the registration.' }, { status: 400 });
    }

    if (tokenPayload.type !== 'email-verified') {
      return NextResponse.json({ error: 'Invalid verification token.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (tokenPayload.email !== normalizedEmail) {
      return NextResponse.json({ error: 'Email mismatch. Please restart the registration.' }, { status: 400 });
    }

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    try {
      await connectDB();
    } catch (dbError: unknown) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed.' }, { status: 500 });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 409 });
    }

    const sanitizedName = name?.trim() ? sanitizeInput(name.trim()) : undefined;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        name: sanitizedName,
        role: 'user',
      });
    } catch (createError: unknown) {
      if (
        (createError as { code?: number }).code === 11000 ||
        (createError instanceof Error && createError.message?.includes('duplicate'))
      ) {
        return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
      }
      throw createError;
    }

    const token = generateToken(user);
    const userData = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };

    const response = NextResponse.json(
      { message: 'Registration successful', user: userData, token },
      { status: 201 }
    );
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error('Error registering user:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to register. Please try again.' }, { status: 500 });
  }
}
