import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token') || '';
  const user = searchParams.get('user') || '{}';
  const redirect = searchParams.get('redirect') || '/';

  // Return an HTML page that stores token in localStorage then redirects
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Signing in...</title></head>
<body style="background:#0a0f1e;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
<p>Signing you in...</p>
<script>
  try {
    localStorage.setItem('authToken', ${JSON.stringify(token)});
    localStorage.setItem('userData', ${JSON.stringify(user)});
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
