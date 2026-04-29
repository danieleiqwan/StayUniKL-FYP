import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET || 'stayunikl_development_only_secret_123456789');

// Simple Rate Limiter State (In-memory)
// Note: In a multi-server production environment, you would use Redis/Upstash instead.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(ip: string, path: string) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    
    // Define limits
    let limit = 20; // Default limit
    if (path.includes('/api/auth')) limit = 10; // Strict limit for login/register
    if (path.includes('/api/complaints')) limit = 50; // Increased limit for dashboard interactions
    
    const key = `${ip}:${path}`;
    const record = rateLimitMap.get(key);

    if (!record || (now - record.lastReset) > windowMs) {
        rateLimitMap.set(key, { count: 1, lastReset: now });
        return false;
    }

    if (record.count >= limit) return true;

    record.count++;
    return false;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Apply Rate Limiting to API routes
    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        if (isRateLimited(ip, pathname)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again in a minute.' },
                { status: 429 }
            );
        }
    }

    // 1. Define protected paths
    const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    const isDashboardPath = pathname.startsWith('/dashboard') || pathname.startsWith('/api/applications') || pathname.startsWith('/api/complaints') || pathname.startsWith('/api/court');
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');

    // 2. Allow if not a protected path
    if (!isAdminPath && !isDashboardPath && !isAuthPath) {
        return NextResponse.next();
    }

    // 3. User is trying to access Auth (Login/Register) while logged in
    if (isAuthPath && token) {
        try {
            const { payload }: any = await jwtVerify(token, SECRET_KEY);
            const redirectPath = payload.role === 'admin' ? '/admin' : '/dashboard';
            return NextResponse.redirect(new URL(redirectPath, request.url));
        } catch (e) {
            // Token invalid, allow login access after deleting cookie
            const response = NextResponse.next();
            response.cookies.delete('token');
            return response;
        }
    }

    // 4. Verify token for protected paths
    if (isAdminPath || isDashboardPath) {
        if (!token) {
            const redirectUrl = isAdminPath ? '/login?role=admin' : '/login';
            // If it's an API request, return 401 instead of redirecting
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        try {
            const { payload }: any = await jwtVerify(token, SECRET_KEY);
            
            // 5. Role-based check for admin paths
            if (isAdminPath && payload.role !== 'admin') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            return NextResponse.next();
        } catch (err) {
            // Token invalid or expired
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

// Global matcher for middleware efficiently
export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/api/admin/:path*',
        '/api/auth/:path*',
        '/api/applications/:path*',
        '/api/complaints/:path*',
        '/api/court/:path*',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password'
    ],
};
