'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'student' | 'admin' | null;

interface User {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    gender: 'Male' | 'Female';
    studentId?: string; // Distinct from internal ID or NRIC
    phoneNumber?: string;
    parentPhoneNumber?: string;
    password?: string;
    profileImage?: string;
    courtNoShows?: number;
    courtBanUntil?: string | null;
}

interface AuthContextType {
    user: User | null;
    login: (role: 'student' | 'admin', email?: string, password?: string, rememberMe?: boolean) => void;
    register: (name: string, studentId: string, nric: string, email: string, gender: 'Male' | 'Female', password: string, nationality: string, dob?: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Load user from local storage or cloud session on mount
    useEffect(() => {
        const stored = localStorage.getItem('stayunikl_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }

        // Always perform a silent sync with the database to ensure data is fresh
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setUser(data.user);
                    localStorage.setItem('stayunikl_user', JSON.stringify(data.user));
                }
            })
            .catch(err => console.error('Silent session sync failed:', err));
    }, []);

    const login = async (role: 'student' | 'admin', email?: string, password?: string, rememberMe: boolean = false) => {
        if (!email) {
            alert("Email is required for login");
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role, rememberMe })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Login failed');
                return;
            }

            setUser(data.user);
            localStorage.setItem('stayunikl_user', JSON.stringify(data.user)); // Keep session locally

            if (role === 'student') router.push('/dashboard');
            else router.push('/admin');

        } catch (error) {
            console.error(error);
            alert("An error occurred during login");
        }
    };

    const register = async (name: string, studentId: string, nric: string, email: string, gender: 'Male' | 'Female', password: string, nationality: string, dob?: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, studentId, nric, email, gender, password, nationality, dob, role: 'student' })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Registration failed');
                return false;
            }

            setUser(data.user);
            localStorage.setItem('stayunikl_user', JSON.stringify(data.user));
            router.push('/dashboard');
            return true;

        } catch (error) {
            console.error(error);
            alert("An error occurred during registration");
            return false;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout sync failed:', err);
        }
        
        setUser(null);
        localStorage.removeItem('stayunikl_user');
        router.push('/');
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        
        // If image is being updated, sync with DB
        if (updates.profileImage) {
            try {
                const res = await fetch('/api/profile/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        profileImage: updates.profileImage
                    })
                });
                
                if (!res.ok) {
                    const status = res.status;
                    let errorData;
                    try {
                        errorData = await res.json();
                    } catch (e) {
                        errorData = await res.text();
                    }
                    console.error(`DB Sync failed (Status ${status}):`, errorData);
                } else {
                    const data = await res.json();
                    if (data.imageUrl) {
                        // Use the actual Cloudinary URL instead of base64
                        updatedUser.profileImage = data.imageUrl;
                    }
                }
            } catch (err) {
                console.error('Network error during profile sync:', err);
            }
        }

        setUser(updatedUser);
        localStorage.setItem('stayunikl_user', JSON.stringify(updatedUser)); // Update current session

        // Update in mock DB (localStorage users array) if it exists
        const storedUsers = localStorage.getItem('stayunikl_users');
        if (storedUsers) {
            const allUsers: User[] = JSON.parse(storedUsers);
            const updatedAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
            localStorage.setItem('stayunikl_users', JSON.stringify(updatedAllUsers));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
