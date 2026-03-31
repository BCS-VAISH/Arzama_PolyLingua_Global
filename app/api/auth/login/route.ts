import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { validateEmail } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // Connect to database first
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your MongoDB connection string in .env.local',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }

    const { email, password } = await req.json();

    // Validation
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

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password is loaded
    if (!user.password) {
      console.error('Password not loaded for user:', user.email);
      return NextResponse.json(
        { error: 'Authentication error. Please try again.' },
        { status: 500 }
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
        token,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to login',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

