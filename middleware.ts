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
    if (path.includes('/api/auth/login') || path.includes('/api/auth/register')) {
        limit = 5; // Strict limit to prevent brute force
    } else if (path.includes('/api/auth')) {
        limit = 10; // Generic auth limit
    }
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
    const isSuperAdminPath = (pathname.startsWith('/superadmin') || pathname.startsWith('/api/superadmin')) && 
                             !pathname.includes('/api/superadmin/bootstrap') && 
                             !pathname.includes('/api/superadmin/migrate');
    const isAdminPath = (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && !isSuperAdminPath;
    const isDashboardPath = pathname.startsWith('/dashboard') || pathname.startsWith('/api/applications') || pathname.startsWith('/api/complaints') || pathname.startsWith('/api/court');
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');

    // 2. Allow if not a protected path
    if (!isSuperAdminPath && !isAdminPath && !isDashboardPath && !isAuthPath) {
        return NextResponse.next();
    }

    // 3. User is trying to access Auth (Login/Register) while logged in
    if (isAuthPath && token) {
        try {
            const { payload }: any = await jwtVerify(token, SECRET_KEY);
            let redirectPath = '/dashboard';
            if (payload.role === 'superadmin') redirectPath = '/superadmin';
            else if (payload.role === 'admin') redirectPath = '/admin';
            return NextResponse.redirect(new URL(redirectPath, request.url));
        } catch (e) {
            // Token invalid, allow login access after deleting cookie
            const response = NextResponse.next();
            response.cookies.delete('token');
            return response;
        }
    }

    // 4. Verify token for protected paths
    if (isSuperAdminPath || isAdminPath || isDashboardPath) {
        if (!token) {
            let redirectUrl = '/login';
            if (isSuperAdminPath) redirectUrl = '/login?role=admin';
            else if (isAdminPath) redirectUrl = '/login?role=admin';
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        try {
            const { payload }: any = await jwtVerify(token, SECRET_KEY);

            // 5a. Superadmin-only route guard
            if (isSuperAdminPath && payload.role !== 'superadmin') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
                }
                // Redirect admin to their own dashboard, students to dashboard
                const fallback = payload.role === 'admin' ? '/admin' : '/dashboard';
                return NextResponse.redirect(new URL(fallback, request.url));
            }

            // 5b. Admin-level route guard (superadmin can also access admin routes)
            if (isAdminPath && payload.role !== 'admin' && payload.role !== 'superadmin') {
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
        '/superadmin/:path*',
        '/admin/:path*',
        '/dashboard/:path*',
        '/api/superadmin/:path*',
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
