import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/';
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=google_token_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();
    if (!userInfoRes.ok || !googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_user_failed`);
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.id,
        name: googleUser.name || googleUser.email.split('@')[0],
        role: 'user',
      });
    } else if (!user.googleId) {
      user.googleId = googleUser.id;
      await user.save();
    }

    const token = generateToken(user);

    const userData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Redirect to client — pass only non-sensitive userData (NOT the token)
    // Auth is handled by the httpOnly cookie set below; token never goes in the URL
    const redirectUrl = new URL(`${baseUrl}/api/auth/google/complete`);
    redirectUrl.searchParams.set('user', JSON.stringify(userData));
    redirectUrl.searchParams.set('redirect', state);

    const response = NextResponse.redirect(redirectUrl.toString());

    // Also set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_error`);
  }
}
