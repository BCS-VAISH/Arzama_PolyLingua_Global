import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const { searchParams } = req.nextUrl;
  // Token is NOT passed in URL — auth is via httpOnly cookie set in callback
  // Only store non-sensitive user profile data in localStorage for UI
  const user = searchParams.get('user') || '{}';
  const redirect = searchParams.get('redirect') || '/';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Signing in...</title></head>
<body style="background:#0a0f1e;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
<p>Signing you in...</p>
<script>
  try {
    localStorage.setItem('userData', ${JSON.stringify(user)});
    // authToken intentionally not stored — httpOnly cookie handles auth
  } catch(e) {}
  window.location.href = ${JSON.stringify(redirect === '/' ? baseUrl + '/' : redirect)};
</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
