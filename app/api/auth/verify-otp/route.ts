import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';
import { validateEmail } from '@/lib/validation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }
    if (!validateEmail(email.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json({ error: 'OTP must be a 6-digit number' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    // Find the latest valid (unused, not expired) OTP for this email
    const record = await OTP.findOne({
      email: normalizedEmail,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await OTP.findByIdAndUpdate(record._id, { used: true });
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(otp.trim(), record.hashedOtp);

    if (!isValid) {
      await OTP.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` : 'No attempts remaining. Please request a new OTP.'}` },
        { status: 400 }
      );
    }

    // Mark as used
    await OTP.findByIdAndUpdate(record._id, { used: true });

    // Issue a short-lived email-verified token (15 min) for the register step
    const verifiedToken = jwt.sign(
      { email: normalizedEmail, type: 'email-verified' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return NextResponse.json({ success: true, verifiedToken });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
