'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Building2, Hexagon, ChevronLeft, User, IdCard, UserCircle, GraduationCap, CalendarDays, CheckCircle, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { validateNRIC } from '@/lib/validation';

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        nric: '',
        email: '',
        gender: 'Male',
        password: '',
        confirmPassword: '',
        nationality: 'Local', // Local or International
        dob: '', // Required for International
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
        let finalValue = value;

        if (name === 'nationality') {
            setFormData(prev => ({ ...prev, nationality: value, nric: '', dob: '' }));
            setNricError('');
            return;
        }

        if (name === 'nric' && formData.nationality === 'Local') {
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

        if (name === 'nric' && formData.nationality === 'International') {
            finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        }

        if (name === 'studentId') {
            finalValue = value.replace(/\D/g, '').slice(0, 11);
        }

        setFormData(prev => {
            const next = { ...prev, [name]: finalValue };
            
            // Auto-detect gender for local students from NRIC
            if (name === 'nric' && prev.nationality === 'Local') {
                const cleaned = finalValue.replace(/\D/g, '');
                if (cleaned.length === 12) {
                    const lastDigit = parseInt(cleaned.slice(-1));
                    next.gender = lastDigit % 2 === 0 ? 'Female' : 'Male';
                }
            }
            
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);
        setShakingFields([]);
        setPasswordError('');
        setEmailError('');
        setNricError('');

        const errors: string[] = [];
        const shake: string[] = [];

        if (formData.studentId.length < 8) {
            errors.push('studentId');
            shake.push('studentId');
        }

        if (formData.nationality === 'Local') {
            const nricStatus = validateNRIC(formData.nric);
            if (!nricStatus.isValid) {
                errors.push('nric');
                shake.push('nric');
                setNricError(nricStatus.error || 'Invalid NRIC');
            }
        } else {
            if (!formData.nric || formData.nric.length < 5) {
                errors.push('nric');
                shake.push('nric');
                setNricError('Valid Passport Number required');
            }
            if (!formData.dob) {
                errors.push('dob');
                shake.push('dob');
            } else {
                const birthDate = new Date(formData.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                
                if (age < 18) {
                    setNricError('You must be at least 18 years old to register');
                    errors.push('dob');
                    shake.push('dob');
                }
            }
        }

        let finalEmail = formData.email.trim();
        if (finalEmail) {
            // Strip any accidentally pasted domain parts to ensure clean formatting
            finalEmail = finalEmail.split('@')[0] + '@s.unikl.edu.my';
        }

        if (!formData.email.trim()) {
            setEmailError('Please enter a valid student email');
            errors.push('email');
            shake.push('email');
        }

        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            setShakingFields(['password', 'confirmPassword']);
            return;
        }

        if (formData.password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            setShakingFields(['password']);
            return;
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
            finalEmail,
            formData.gender as 'Male' | 'Female',
            formData.password,
            formData.nationality,
            formData.dob
        );

        if (!success) {
            setIsSubmitting(false);
        }
    };

    let nricValidation: { isValid: boolean; age?: number; error?: string; dob?: Date } | null = null;
    if (formData.nationality === 'Local' && formData.nric.replace(/\D/g, '').length === 12) {
        nricValidation = validateNRIC(formData.nric);
    }

    return (
        <div className="page-wrapper font-sans selection:bg-[#F26C22] selection:text-white dark:bg-[#0a0f1c]">
            <div className="left-pattern"></div>
            
            <div className="left-side">
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
                                <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center border border-slate-200 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'nationality', value: 'Local' } } as any)}
                                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.nationality === 'Local' ? 'bg-white dark:bg-slate-800 text-[#F26C22] shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}
                                    >
                                        Local (NRIC)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'nationality', value: 'International' } } as any)}
                                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.nationality === 'International' ? 'bg-white dark:bg-slate-800 text-[#F26C22] shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}
                                    >
                                        International
                                    </button>
                                </div>

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

                                <div className="space-y-4">

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
                                            <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                {formData.nationality === 'Local' ? 'NRIC Number' : 'Passport Number'}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                                    <IdCard className="h-4 w-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="nric"
                                                    placeholder={formData.nationality === 'Local' ? "000000-00-0000" : "Enter Passport"}
                                                    required
                                                    className={`block w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${validationErrors.includes('nric') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} ${shakingFields.includes('nric') ? 'animate-shake' : ''}`}
                                                    value={formData.nric}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {nricError && <p className="text-[10px] font-bold text-red-500 mt-1">{nricError}</p>}
                                            {nricValidation && nricValidation.isValid && (
                                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in fade-in slide-in-from-top-1">
                                                    <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1.5">
                                                        <CheckCircle className="h-3.5 w-3.5" /> Please confirm derived details
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-200/60 dark:border-green-800/60">
                                                        <div>
                                                            <p className="text-[9px] font-black text-green-600/70 dark:text-green-400/70 uppercase tracking-wider">Date of Birth</p>
                                                            <p className="text-xs font-bold text-green-800 dark:text-green-300">
                                                                {nricValidation.dob ? nricValidation.dob.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-green-600/70 dark:text-green-400/70 uppercase tracking-wider">Derived Age</p>
                                                            <p className="text-xs font-bold text-green-800 dark:text-green-300">
                                                                {nricValidation.age} years old
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {nricValidation && !nricValidation.isValid && !nricError && (
                                                <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                    <AlertCircle className="h-3 w-3" /> {nricValidation.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Birth Date (Only for International) and Gender */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {formData.nationality === 'International' ? (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date of Birth</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                                        <CalendarDays className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        required
                                                        className={`block w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${validationErrors.includes('dob') ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} ${shakingFields.includes('dob') ? 'animate-shake' : ''}`}
                                                        value={formData.dob}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                                <span>Gender</span>
                                                {formData.nationality === 'Local' && (
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 normal-case tracking-normal">(Auto-detected)</span>
                                                )}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                                    <UserCircle className="h-4 w-4" />
                                                </div>
                                                <select
                                                    name="gender"
                                                    disabled={formData.nationality === 'Local'}
                                                    className={`block w-full pl-10 pr-8 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium appearance-none ${formData.nationality === 'Local' ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-80 cursor-not-allowed' : 'bg-[#f8fafc] dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 cursor-pointer'}`}
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            {/* Email Address */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Student Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        required
                                        placeholder="student123"
                                        className={`block w-full pl-10 pr-[105px] py-2.5 bg-[#f8fafc] dark:bg-[#0f172a] border rounded-xl text-xs focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium ${emailError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
                                        value={formData.email}
                                        onChange={(e) => {
                                            const val = e.target.value.split('@')[0];
                                            handleChange({ target: { name: 'email', value: val } } as any);
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">@s.unikl.edu.my</span>
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
