import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(req: NextRequest): Promise<IUser | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookie
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const trimmed = cookie.trim();
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx);
            const value = trimmed.substring(eqIdx + 1);
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);
        token = cookies['auth-token'] || null;
      }
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await User.findById(decoded.userId).select('+password');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function requireAuth(handler: (req: NextRequest, user: IUser) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(req, user);
  };
}

export function requireAdmin(handler: (req: NextRequest, user: IUser) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(req, user);
  };
}

