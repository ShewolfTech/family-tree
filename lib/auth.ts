import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  // Try Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // Try cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (token) {
    return verifyToken(token);
  }

  return null;
}

export function generateResetToken(): string {
  return jwt.sign({ type: 'reset', timestamp: Date.now() }, JWT_SECRET, { expiresIn: '1h' });
}
