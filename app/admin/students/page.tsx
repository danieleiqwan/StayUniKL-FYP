'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import LiveClock from '@/components/admin/LiveClock';
import StudentDetailModal from '@/components/admin/StudentDetailModal';
import { 
    Search, Filter, User, Mail, Phone, MoreHorizontal, 
    ChevronLeft, ChevronRight, Eye, Users, Building, FileBarChart,
    ArrowUpDown, Download, Plus
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

            return matchesSearch && matchesStatus && matchesResidency;
        });
    }, [students, searchQuery, statusFilter, residencyFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
            <Navbar />
            
            <div className="container mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 bg-[#F26C22] rounded-lg flex items-center justify-center text-white">
                                <Users className="h-4 w-4" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Admin Dashboard: All Students Directory</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium ml-11">Manage student records, assignments, and reports.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <LiveClock />
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F26C22] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search by Name, ID, or Room..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold w-72 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#F26C22] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mb-8 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit shadow-sm">
                    {[
                        { id: 'students', label: 'Students', icon: Users },
                        { id: 'rooms', label: 'Facility Room', icon: Building },
                        { id: 'reports', label: 'Reports', icon: FileBarChart },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/30' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#F26C22] min-w-[140px]"
                            >
                                <option>All</option>
                                <option>Active</option>
                                <option>Checked Out</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residency History</label>
                            <select 
                                value={residencyFilter}
                                onChange={(e) => setResidencyFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#F26C22] min-w-[140px]"
                            >
                                <option>All</option>
                                <option>Current Staying</option>
                                <option>Past Staying</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                            <Download className="h-4 w-4" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Info</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-8 py-6"><Skeleton className="h-10 w-40" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-10 w-40" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-6 w-24" /></td>
                                            <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shadow-sm">
                                                        <img 
                                                            src={s.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} 
                                                            alt={s.name} 
                                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{s.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.student_id || 'ID N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <Phone className="h-3 w-3 text-slate-300" /> {s.phone_number || 'N/A'}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-400 flex items-center gap-2 italic lowercase">
                                                        <Mail className="h-3 w-3 text-slate-300" /> {s.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {getStatusBadge(s.latest_status)}
                                                {s.room_id && (
                                                    <p className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-widest">Room: {s.room_id}</p>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setSelectedStudentId(s.id)}
                                                        className="px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center italic text-slate-400">No students found matches your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900 dark:text-white">{(currentPage-1)*itemsPerPage + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage*itemsPerPage, filteredStudents.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredStudents.length}</span> students
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 disabled:opacity-50 hover:border-[#F26C22] transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`h-8 w-8 rounded-lg text-xs font-black transition-all ${
                                        currentPage === i + 1 
                                        ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/30' 
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-[#F26C22]'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 disabled:opacity-50 hover:border-[#F26C22] transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
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
