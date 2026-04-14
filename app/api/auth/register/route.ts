import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/validation';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    try {
      await connectDB();
    } catch (dbError: unknown) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        {
          error: 'Database connection failed. Please check your MongoDB connection string in .env.local',
          details: process.env.NODE_ENV === 'development'
            ? (dbError instanceof Error ? dbError.message : String(dbError))
            : undefined,
        },
        { status: 500 }
      );
    }

    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const sanitizedName = name ? sanitizeInput(name) : undefined;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    try {
      user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: sanitizedName,
        role: 'user',
      });
    } catch (createError: unknown) {
      console.error('User creation error:', createError);
      if (
        (createError as { code?: number }).code === 11000 ||
        (createError instanceof Error && createError.message?.includes('duplicate'))
      ) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      throw createError;
    }

    const token = generateToken(user);

    const userData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

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
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to register user',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}
