import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { validateEmail } from '@/lib/validation';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const OTP_EXPIRY_MINUTES = 10;
const MAX_SENDS_PER_HOUR = 3;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d1b3e;color:#fff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;text-align:center;">
        <h1 style="margin:0;font-size:26px;color:#fff;letter-spacing:-0.5px;">ARZAMA PolyLingua</h1>
        <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">Email Verification</p>
      </div>
      <div style="padding:36px 32px;text-align:center;">
        <p style="color:#93c5fd;font-size:15px;margin:0 0 24px;">Your one-time verification code is:</p>
        <div style="display:inline-block;background:rgba(37,99,235,0.2);border:2px solid rgba(59,130,246,0.5);border-radius:16px;padding:20px 40px;margin-bottom:24px;">
          <span style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:12px;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;margin:0;">This code expires in <strong style="color:#93c5fd;">${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <p style="color:#64748b;font-size:13px;margin:8px 0 0;">If you did not request this, you can safely ignore this email.</p>
      </div>
      <div style="padding:16px 32px;background:rgba(0,0,0,0.3);text-align:center;">
        <p style="margin:0;font-size:12px;color:#475569;">ARZAMA&apos;s PolyLingua Global · Do not share this code</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"ARZAMA PolyLingua" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} — Your verification code`,
    html,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!validateEmail(email.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    // Check email not already registered
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'This email is already registered. Please login instead.' }, { status: 409 });
    }

    // Rate limit: max 3 OTPs per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await OTP.countDocuments({ email: normalizedEmail, createdAt: { $gte: oneHourAgo } });
    if (recentCount >= MAX_SENDS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait before requesting again.' },
        { status: 429 }
      );
    }

    // Invalidate previous unused OTPs for this email
    await OTP.updateMany({ email: normalizedEmail, used: false }, { used: true });

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.create({ email: normalizedEmail, hashedOtp, expiresAt });

    // Send email
    await sendOTPEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true, message: `OTP sent to ${normalizedEmail}` });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
