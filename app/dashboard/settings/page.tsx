'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    User, Lock, Bell, Mail, ShieldCheck,
    CheckCircle2, ChevronRight, AlertCircle, Save,
    Settings as SettingsIcon, LogOut, Moon, Globe, Palette
} from 'lucide-react';

export default function SettingsHub() {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [accountForm, setAccountForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [alertsForm, setAlertsForm] = useState({
        alertBooking: user?.alertBooking !== false, // Default to true if undefined
        alertMaintenance: user?.alertMaintenance !== false,
        alertAnnouncement: user?.alertAnnouncement !== false,
    });

    if (!user) return null;

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMsg(null);
        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountForm)
            });
            const data = await res.json();
            if (data.success) {
                updateProfile({ name: accountForm.name, email: accountForm.email });
                setMsg({ type: 'success', text: 'Account information updated!' });
            } else {
                setMsg({ type: 'error', text: data.error || 'Update failed.' });
            }
        } catch (err) {
            console.error('Update error:', err);
            setMsg({ type: 'error', text: 'Failed to process update. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            setMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setIsSaving(true);
        setMsg(null);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordForm)
            });
            const data = await res.json();
            if (data.success) {
                setMsg({ type: 'success', text: 'Password updated successfully!' });
                setPasswordForm({ current: '', new: '', confirm: '' });
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to change password.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error processing request.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAlertsSubmit = async () => {
        setIsSaving(true);
        setMsg(null);
        try {
            const res = await fetch('/api/profile/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertsForm)
            });
            const data = await res.json();
            if (data.success) {
                updateProfile({ 
                    alertBooking: alertsForm.alertBooking,
                    alertMaintenance: alertsForm.alertMaintenance,
                    alertAnnouncement: alertsForm.alertAnnouncement
                });
                setMsg({ type: 'success', text: 'Communication preferences updated!' });
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to update preferences.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error saving preferences.' });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Edit Identity', icon: User, desc: 'Update your official name and contact email' },
        { id: 'security', label: 'Security & Access', icon: Lock, desc: 'Manage your password and active sessions' },
        { id: 'alerts', label: 'Communication', icon: Bell, desc: 'Configure how you receive hostel updates' },
        { id: 'app', label: 'App Preferences', icon: Palette, desc: 'Theme, language and accessibility' },
    ];

    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || SettingsIcon;

    return (
        <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">System Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Centralized controls for your StayUniKL account.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Control Sidebar */}
                <aside className="lg:w-72 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-8 transition-colors">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActiveTab = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setMsg(null); }}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mb-1 group transition-colors ${isActiveTab ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xl shadow-slate-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActiveTab ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors'}`} />
                                    <div className="text-left">
                                        <p className="text-sm font-bold leading-none">{tab.label}</p>
                                    </div>
                                    {isActiveTab && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Settings Panel */}
                <main className="flex-1 min-h-[600px]">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center transition-colors">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-white transition-colors">
                                        <ActiveIcon className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase transition-colors">
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h2>
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 font-medium text-sm transition-colors">{tabs.find(t => t.id === activeTab)?.desc}</p>
                            </div>
                        </div>

                        <div className="p-10">

                            {/* Account Identity Section (EDITABLE) */}
                            {activeTab === 'account' && (
                                <form onSubmit={handleAccountSubmit} className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Update Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={accountForm.name}
                                                onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Update Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={accountForm.email}
                                                onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-[#F26C22] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/10 hover:bg-slate-900 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                                    >
                                        {isSaving ? 'Processing...' : <><Save className="h-4 w-4" /> Save Profile Changes</>}
                                    </button>
                                </form>
                            )}

                            {/* Security & Access Section */}
                            {activeTab === 'security' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordForm.current}
                                                onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">New Secure Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordForm.new}
                                                onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordForm.confirm}
                                                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-slate-900 dark:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-100 dark:shadow-none hover:bg-[#F26C22] transition-all"
                                    >
                                        Update Access Credentials
                                    </button>
                                </form>
                            )}

                            {/* Alerts Section (Notifications) */}
                            {activeTab === 'alerts' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl group hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white text-sm mb-1 transition-colors">Booking Alerts</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">Notify me when my court bookings are reviewed</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={alertsForm.alertBooking} onChange={(e) => setAlertsForm({...alertsForm, alertBooking: e.target.checked})} />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F26C22]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl group hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white text-sm mb-1 transition-colors">Maintenance Updates</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">Alerts for my ongoing facility complaints</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={alertsForm.alertMaintenance} onChange={(e) => setAlertsForm({...alertsForm, alertMaintenance: e.target.checked})} />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F26C22]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl group hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white text-sm mb-1 transition-colors">General Announcements</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">Critical alerts from the management office</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={alertsForm.alertAnnouncement} onChange={(e) => setAlertsForm({...alertsForm, alertAnnouncement: e.target.checked})} />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F26C22]"></div>
                                            </label>
                                        </div>
                                    </div>
                                    <button onClick={handleAlertsSubmit} disabled={isSaving} className="bg-[#F26C22] text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-[#d65a16] transition-all disabled:opacity-50">
                                        {isSaving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            )}

                            {/* App Preferences */}
                            {activeTab === 'app' && (
                                <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Theme Engine</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-[#F26C22] rounded-2xl text-[#F26C22] dark:text-orange-400 font-bold text-sm shadow-xl shadow-orange-50 dark:shadow-none transition-all">
                                                    <Palette className="h-4 w-4" /> Light
                                                </button>
                                                <button className="flex items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
                                                    <Moon className="h-4 w-4" /> Dark
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Regional Language</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none appearance-none transition-all">
                                                    <option>English (US)</option>
                                                    <option>Bahasa Melayu</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Message Footer */}
                            {msg && (
                                <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-xs transition-all ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                                    {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
