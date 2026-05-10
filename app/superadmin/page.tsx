'use client';

import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminHomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center space-y-6">
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 16px 48px rgba(245,158,11,0.2)' }}>
                <ShieldAlert className="h-10 w-10 text-black" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Governance Terminal</h1>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Full dashboard overview is coming in Phase 4. For now, use Staff Management to manage administrative accounts.
                </p>
            </div>
            <Link href="/superadmin/staff"
                className="px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider text-black transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}>
                Go to Staff Management →
            </Link>
        </div>
    );
}
