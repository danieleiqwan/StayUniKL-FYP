import React from 'react';
import { Hexagon } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    fullPage?: boolean;
}

export const LoadingSpinner = ({ message = "Loading...", fullPage = false }: LoadingSpinnerProps) => {
    const spinnerContent = (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center">
                {/* Main Spinning Ring */}
                <div className="w-16 h-16 border-[3px] border-slate-100 dark:border-slate-800/50 rounded-full"></div>
                
                {/* Gradient Accent Ring */}
                <div className="absolute w-16 h-16 border-[3px] border-transparent border-t-[#F26C22] border-r-[#F26C22]/30 rounded-full animate-spin"></div>
                
                {/* Inner Pulsing Ring */}
                <div className="absolute w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-full animate-pulse"></div>
                
                {/* Brand Icon Core */}
                <div className="absolute">
                    <Hexagon className="w-5 h-5 text-[#F26C22] animate-bounce" />
                </div>

                {/* Outer Glow Effect */}
                <div className="absolute w-16 h-16 rounded-full bg-[#F26C22]/5 blur-xl animate-pulse"></div>
            </div>
            
            {message && (
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black text-[#141235] dark:text-white uppercase tracking-[0.3em] ml-[0.3em]">
                        {message}
                    </p>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-[#F26C22] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-1 bg-[#F26C22] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-1 bg-[#F26C22] rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-[#0a0f1c]/90 backdrop-blur-xl">
                <div className="relative">
                    {/* Background Decorative Blur */}
                    <div className="absolute -inset-24 bg-[#F26C22]/10 blur-[100px] rounded-full opacity-50"></div>
                    {spinnerContent}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            {spinnerContent}
        </div>
    );
};
