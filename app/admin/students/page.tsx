'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LiveClock from '@/components/admin/LiveClock';
import StudentDetailModal from '@/components/admin/StudentDetailModal';
import { 
    Search, Filter, User, Mail, Phone, MoreHorizontal, 
    ChevronLeft, ChevronRight, Eye, Users, Building, 
    ArrowUpDown, Download, Plus, CheckCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentsDirectoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [residencyFilter, setResidencyFilter] = useState('All');
    const [floorFilter, setFloorFilter] = useState('All Floors');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (user?.role !== 'admin') {
            router.push('/login');
            return;
        }

        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/admin/students/all');
                const data = await res.json();
                if (data.success) {
                    setStudents(data.students);
                }
            } catch (err) {
                console.error('Failed to fetch students:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [user, router]);

    // Filtering Logic
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = !searchQuery || 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                s.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.room_id?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || 
                (statusFilter === 'Active' && s.latest_status === 'Checked in') ||
                (statusFilter === 'Checked Out' && s.latest_status === 'Checked out');
            
            const matchesResidency = residencyFilter === 'All' || 
                (residencyFilter === 'Current Staying' && s.latest_status === 'Checked in') ||
                (residencyFilter === 'Past Staying' && s.latest_status === 'Checked out');

            const matchesFloor = floorFilter === 'All Floors' || 
                (s.room_id && s.room_id.toString().startsWith(floorFilter.replace('Floor ', '')));

            return matchesSearch && matchesStatus && matchesResidency && matchesFloor;
        });
    }, [students, searchQuery, statusFilter, residencyFilter, floorFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const calculateAge = (s: any) => {
        if (s.birth_date) {
            const birthDate = new Date(s.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            return `${age} Yrs`;
        }
        
        if (s.nationality === 'Local' && s.nric) {
            const cleanNric = s.nric.replace(/\D/g, '');
            if (cleanNric.length >= 6) {
                const yy = parseInt(cleanNric.substring(0, 2));
                const mm = parseInt(cleanNric.substring(2, 4)) - 1;
                const dd = parseInt(cleanNric.substring(4, 6));
                
                const currentYear = new Date().getFullYear();
                const currentShort = currentYear % 100;
                const birthYear = yy <= currentShort ? 2000 + yy : 1900 + yy;
                
                const birthDate = new Date(birthYear, mm, dd);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                return `${age} Yrs`;
            }
        }
        return 'N/A';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Checked in':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">Current Resident</span>;
            case 'Checked out':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">Checked Out</span>;
            case 'Approved':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">Room Assigned</span>;
            case 'Pending':
            case 'Payment Pending':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">Pending Application</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wider">No Application</span>;
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="max-w-[1400px] mx-auto px-10 py-12 space-y-10">
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Student Management</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage and monitor all student records in one place.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#F26C22] hover:bg-[#d65a16] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                        <Plus className="h-4 w-4" /> Add New Student
                    </button>
                </div>

                {/* ── KPI Stats Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Students" 
                        value={students.length} 
                        sub="All time" 
                        icon={<Users className="h-6 w-6" />} 
                        bg="bg-[#8E54E9]" 
                    />
                    <StatCard 
                        title="Active Students" 
                        value={students.filter(s => s.latest_status === 'Checked in').length} 
                        sub="Currently active" 
                        icon={<User className="h-6 w-6" />} 
                        bg="bg-[#2DCE89]" 
                    />
                    <StatCard 
                        title="With Subscriptions" 
                        value={students.filter(s => s.latest_status === 'Checked in' || s.latest_status === 'Approved').length} 
                        sub="Have active subscriptions" 
                        icon={<Download className="h-6 w-6" />} 
                        bg="bg-[#11CDEF]" 
                    />
                    <StatCard 
                        title="New This Month" 
                        value={students.filter(s => {
                            const date = new Date(s.created_at);
                            const now = new Date();
                            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length} 
                        sub="This month" 
                        icon={<Plus className="h-6 w-6" />} 
                        bg="bg-[#FB6340]" 
                    />
                </div>

                {/* ── Filters Section ── */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Students</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F26C22] transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-[#F26C22] transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-[#F26C22] transition-all"
                            >
                                <option value="All">All Students</option>
                                <option value="Active">Active</option>
                                <option value="Checked Out">Inactive</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor</label>
                            <select 
                                value={floorFilter}
                                onChange={(e) => setFloorFilter(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-[#F26C22] transition-all"
                            >
                                <option>All Floors</option>
                                {[1, 2, 3, 4, 5, 6, 7].map(f => (
                                    <option key={f}>Floor {f}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Table Section ── */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Students ({filteredStudents.length})</h3>
                        <span className="text-xs text-slate-400 font-bold">Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredStudents.length)} of {filteredStudents.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age/Gender</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriptions</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-8 py-6"><Skeleton className="h-12 w-48 rounded-2xl" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-10 w-40" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-6 w-20" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-6 w-20" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-full" /></td>
                                            <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 ml-auto rounded-xl" /></td>
                                        </tr>
                                    ))
                                ) : paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shadow-sm flex items-center justify-center font-black text-slate-400 text-lg uppercase">
                                                        {s.profile_image ? (
                                                            <img src={s.profile_image} alt={s.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            s.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{s.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 lowercase italic">{s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.phone_number || 'N/A'}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Location {s.room_id ? `Room ${s.room_id}` : 'N/A'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{calculateAge(s)}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{s.gender || 'Unknown'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                    {s.latest_status === 'Checked in' ? '1 Active' : '0 Active'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 space-y-1.5">
                                                <div className="flex flex-col gap-1">
                                                    {s.latest_status === 'Checked in' ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-widest w-fit">Active</span>
                                                    ) : (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 uppercase tracking-widest w-fit">Inactive</span>
                                                    )}
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase tracking-widest w-fit">Unverified</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setSelectedStudentId(s.id)}
                                                        className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-[#F26C22] transition-all border border-slate-100 dark:border-slate-800"
                                                    >
                                                        <Eye className="h-4.5 w-4.5" />
                                                    </button>
                                                    <button className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-slate-400 hover:text-emerald-600 transition-all border border-slate-100 dark:border-slate-800">
                                                        <CheckCircle className="h-4.5 w-4.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center italic text-slate-400">No students found matches your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900 dark:text-white">{(currentPage-1)*itemsPerPage + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage*itemsPerPage, filteredStudents.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredStudents.length}</span> students
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-9 w-9 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 disabled:opacity-50 hover:border-[#F26C22] hover:text-[#F26C22] transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                                        currentPage === i + 1 
                                        ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/30' 
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-[#F26C22] hover:text-[#F26C22]'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 w-9 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 disabled:opacity-50 hover:border-[#F26C22] hover:text-[#F26C22] transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

            {/* Student Detail Modal */}
            <StudentDetailModal 
                studentId={selectedStudentId} 
                onClose={() => setSelectedStudentId(null)} 
            />
        </div>
    );
}

function StatCard({ title, value, sub, icon, bg }: any) {
    return (
        <div className={`${bg} rounded-3xl p-6 text-white shadow-lg overflow-hidden relative group transition-all hover:scale-[1.02]`}>
            <div className="relative z-10">
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{title}</p>
                <div className="flex items-end justify-between mt-4">
                    <div>
                        <p className="text-4xl font-black">{value}</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase mt-1 tracking-widest">{sub}</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        </div>
    );
}
