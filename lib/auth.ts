import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET is not set in environment variables. Falling back to insecure default for development.");
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET || 'stayunikl_development_only_secret_123456789');

export async function createToken(payload: { id: string; role: string; email: string }, rememberMe: boolean = false) {
    const expiresIn = rememberMe ? '30d' : '1d';
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { id: string; role: string; email: string };
    } catch (err) {
        return null;
    }
}

export async function isAdmin() {
    const user = await getAuthUser();
    return user?.role === 'admin' ? user : null;
}

export async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    return await verifyToken(token);
}

export async function setTokenCookie(token: string, rememberMe: boolean = false) {
    const cookieStore = await cookies();
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined; // 30 days or session cookie
    
    const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    };
    
    if (maxAge !== undefined) {
        cookieOptions.maxAge = maxAge;
    }
    
    cookieStore.set('token', token, cookieOptions);
}

export async function createPasswordResetToken(payload: { id: string; email: string; passwordHash: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(SECRET_KEY);
}

export async function verifyPasswordResetToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { id: string; email: string; passwordHash: string };
    } catch (err) {
        return null;
    }
}
