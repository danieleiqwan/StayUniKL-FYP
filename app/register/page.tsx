'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Building2, Hexagon, ChevronLeft, User, IdCard, UserCircle, GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { validateNRIC } from '@/lib/validation';

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        nric: '',
        email: '',
        gender: 'Male', // Default
        password: '', // Mock password (not processed)
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [nricError, setNricError] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [shakingFields, setShakingFields] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const target = e.target as HTMLInputElement;
        const selectionStart = target.selectionStart;
        let finalValue = value;

        if (name === 'nric') {
            const cleaned = value.replace(/\D/g, '');
            const truncated = cleaned.slice(0, 12);
            if (truncated.length > 8) {
                finalValue = `${truncated.slice(0, 6)}-${truncated.slice(6, 8)}-${truncated.slice(8)}`;
            } else if (truncated.length > 6) {
                finalValue = `${truncated.slice(0, 6)}-${truncated.slice(6)}`;
            } else {
                finalValue = truncated;
            }
        }

        if (name === 'studentId') {
            finalValue = value.replace(/\D/g, '').slice(0, 11);
        }

        const newFormData = { ...formData, [name]: finalValue };

        if (name === 'nric') {
            const cleaned = finalValue.replace(/\D/g, '');
            if (cleaned.length > 0) {
                const lastDigit = parseInt(cleaned.slice(-1), 10);
                if (!isNaN(lastDigit)) {
                    newFormData.gender = lastDigit % 2 === 0 ? 'Female' : 'Male';
                }
            }
        }

        const oldLength = formData[name as keyof typeof formData]?.toString().length || 0;
        setFormData(newFormData);

        // Restore cursor position for NRIC formatting
        if (name === 'nric' && selectionStart !== null) {
            setTimeout(() => {
                const newLength = finalValue.length;
                const lengthDiff = newLength - oldLength;
                
                // Shift cursor based on how many characters were added (hyphens)
                const newPosition = selectionStart + (lengthDiff > 0 ? lengthDiff : 0);
                
                target.setSelectionRange(newPosition, newPosition);
            }, 0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setEmailError('');
        setNricError('');
        setValidationErrors([]);
        setShakingFields([]);

        const errors: string[] = [];
        const shake: string[] = [];

        if (formData.studentId.length < 8) {
            errors.push('studentId');
            shake.push('studentId');
        }

        const nricStatus = validateNRIC(formData.nric);
        if (!nricStatus.isValid) {
            errors.push('nric');
            shake.push('nric');
            setNricError(nricStatus.error || 'Invalid NRIC');
        }

        if (!formData.email.toLowerCase().endsWith('@unikl.edu.my')) {
            setEmailError('Only UniKL email addresses are allowed (@unikl.edu.my)');
            errors.push('email');
            shake.push('email');
        }

        if (formData.password !== formData.confirmPassword) {
            setPasswordError("Passwords do not match");
            errors.push('confirmPassword');
            shake.push('confirmPassword');
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            setShakingFields(shake);
            setTimeout(() => setShakingFields([]), 500);
            return;
        }

        setIsSubmitting(true);
        
        const success = await register(
            formData.name, 
            formData.studentId, 
            formData.nric, 
            formData.email, 
            formData.gender as 'Male' | 'Female'
        );

        if (!success) {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-wrapper font-sans selection:bg-[#F26C22] selection:text-white dark:bg-[#0a0f1c]">
            <div className="left-pattern"></div>
            
            {/* Left Side (White Area for Login Form) */}
            <div className="left-side">
                
                {/* Floating Navigation */}
                <div className="absolute top-8 left-8 sm:left-16 lg:left-24 z-50 flex items-center gap-3">
                    <Link href="/" className="group flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-xs font-black text-slate-600 dark:text-slate-400 hover:text-[#F26C22] hover:border-[#F26C22]/40 transition-all shadow-sm hover:shadow-md">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#F26C22]" />
                        Back to Home
                    </Link>
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="w-full max-w-xl mx-auto space-y-6 pt-16 pb-8">
                    {/* Header */}
                    <div className="space-y-8">
                        <div className="inline-block">
                            <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-white italic flex items-center">
                                <span className="bg-[#141235] dark:bg-white text-white dark:text-[#141235] px-3 py-1 rounded-xl mr-1 shadow-md">Stay</span>
                                <span className="text-[#F26C22] drop-shadow-sm">UniKL</span>
                            </h1>
                            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mt-3 flex items-center gap-1">
                                <Hexagon className="h-3 w-3 text-[#F26C22]" /> Accommodation Portal
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl sm:text-5xl font-black text-[#141235] dark:text-white tracking-tight leading-tight">
                                Join Us!
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Create your student account to get started
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(20,18,53,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 backdrop-blur-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F26C22] to-transparent opacity-50"></div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Student ID</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                                <GraduationCap className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="studentId"
                                                placeholder="5221..."
                                                required
                                                className={`block w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${validationErrors.includes('studentId') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} ${shakingFields.includes('studentId') ? 'animate-shake' : ''}`}
                                                value={formData.studentId}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">NRIC Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                                <IdCard className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="nric"
                                                placeholder="XXXXXX-XX-XXXX"
                                                required
                                                maxLength={14}
                                                className={`block w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${nricError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} ${shakingFields.includes('nric') ? 'animate-shake' : ''}`}
                                                value={formData.nric}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email (@unikl)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className={`block w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${emailError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gender</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 transition-colors">
                                            <UserCircle className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="gender"
                                            readOnly
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-slate-500 font-medium cursor-not-allowed"
                                            value={formData.gender}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        className="block w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#F26C22] transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        className={`block w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${passwordError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#F26C22] transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {nricError && <p className="text-[10px] font-bold text-red-500 mt-1">{nricError}</p>}
                                {emailError && <p className="text-[10px] font-bold text-red-500 mt-1">{emailError}</p>}
                                {passwordError && <p className="text-[10px] font-bold text-red-500 mt-1">{passwordError}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-gradient-to-r from-[#F26C22] via-[#ff8833] to-[#F26C22] hover:bg-gradient-to-l text-white rounded-xl font-black text-xs shadow-[0_8px_20px_rgba(242,108,34,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest bg-[length:200%_auto] mt-2"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Register Now'}
                            </button>

                            <div className="pt-2 text-center">
                                <p className="text-xs font-semibold text-slate-500">
                                    Already have an account? <Link href="/login" className="text-[#F26C22] hover:text-[#d65a16] font-bold transition-colors hover:underline">Sign in</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side (Curved Dark Blue Area for Image) */}
            <div className="right-side">
                <div className="right-pattern"></div>
                <img src="/mascot.png" className="hero-image" alt="UniKL Mascot" />
            </div>
        </div>
    );
}
