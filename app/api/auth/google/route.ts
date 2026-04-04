import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const searchParams = req.nextUrl.searchParams;
  const redirect = searchParams.get('redirect') || '/';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: redirect,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
