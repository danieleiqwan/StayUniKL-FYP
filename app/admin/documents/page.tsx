'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle, XCircle, Clock, Search, Filter, ArrowLeft, Download, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDocumentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            router.push('/login');
            return;
        }
        fetchDocuments();
    }, [user, router]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/admin/documents');
            const data = await res.json();
            if (data.documents) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (id: string, status: 'Verified' | 'Rejected') => {
        if (status === 'Rejected' && !rejectionReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/admin/documents', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, rejectionReason: status === 'Rejected' ? rejectionReason : undefined })
            });

            if (res.ok) {
                setSelectedDoc(null);
                setRejectionReason('');
                fetchDocuments();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update document status');
            }
        } catch (error) {
            console.error('Update error', error);
            alert('An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchStatus = filterStatus === 'All' || doc.status === filterStatus;
        const matchType = filterType === 'All' || doc.type === filterType;
        const matchSearch = doc.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchType && matchSearch;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
            default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-10">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/admin')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Document <span className="text-[#F26C22]">Verification</span></h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Review and verify student uploads for application compliance.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-sm">
                            <Clock className="h-4 w-4 text-[#F26C22]" />
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {documents.filter(d => d.status === 'Pending').length} Pending Requests
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Search Student / File</label>
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F26C22] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Name, ID or filename..." 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F26C22]/20 focus:border-[#F26C22] transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                            <select 
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#F26C22]/20 focus:border-[#F26C22] transition-all"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending Review</option>
                                <option value="Verified">Verified</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Document Type</label>
                            <select 
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#F26C22]/20 focus:border-[#F26C22] transition-all"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Identification">Identification (IC/Passport)</option>
                                <option value="Academic">Academic Transcript</option>
                                <option value="Student ID">Student ID Card</option>
                                <option value="Supporting Document">Supporting Docs</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button 
                                onClick={() => { setSearchQuery(''); setFilterStatus('All'); setFilterType('All'); }}
                                className="h-[42px] w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#F26C22] hover:border-[#F26C22]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Filter className="h-3.5 w-3.5" /> Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Information</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submission</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-10 w-40 bg-slate-100 dark:bg-slate-800 rounded-xl"></div></td>
                                            <td className="px-8 py-6"><div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl"></div></td>
                                            <td className="px-8 py-6"><div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"></div></td>
                                            <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full"></div></td>
                                            <td className="px-8 py-6"><div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-base leading-tight">{doc.student_name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-500 font-medium mt-0.5 tracking-tight">{doc.student_id}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                                    <FileText className="h-5 w-5 text-[#F26C22]" />
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <div className="truncate font-bold text-slate-700 dark:text-slate-300 text-sm" title={doc.name}>{doc.name}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">File Upload</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(doc.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusStyle(doc.status))}>
                                                <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => setSelectedDoc(doc)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#F26C22] hover:text-[#F26C22] dark:hover:border-[#F26C22] dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Review
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="max-w-xs mx-auto flex flex-col items-center">
                                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-4">
                                                    <FileText className="h-10 w-10 text-slate-300" />
                                                </div>
                                                <p className="text-slate-900 dark:text-white font-bold">No Documents Found</p>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">We couldn't find any documents matching your current filter criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Review Modal */}
                {selectedDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-full overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-orange-50 dark:bg-orange-900/20 rounded-[1.5rem] flex items-center justify-center text-[#F26C22] ring-8 ring-orange-50/50 dark:ring-orange-900/10">
                                        <FileText className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Document <span className="text-[#F26C22]">Review</span></h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{selectedDoc.student_name} • {selectedDoc.student_id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedDoc(null)} 
                                    className="h-12 w-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-[1.25rem] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Preview */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Preview</h4>
                                            <div className="flex items-center gap-2">
                                                <a 
                                                    href={selectedDoc.file_url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[#F26C22] rounded-xl transition-all"
                                                    title="Open Full Screen"
                                                >
                                                    <Maximize2 className="h-4 w-4" />
                                                </a>
                                                <a 
                                                    href={selectedDoc.file_url} 
                                                    download 
                                                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[#F26C22] rounded-xl transition-all"
                                                    title="Download File"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="aspect-[3/4] bg-slate-50 dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner flex items-center justify-center relative group">
                                            {selectedDoc.file_url.toLowerCase().endsWith('.pdf') ? (
                                                <iframe src={selectedDoc.file_url} className="w-full h-full" title="PDF Preview" />
                                            ) : (
                                                <img src={selectedDoc.file_url} alt="Document Preview" className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Details & Actions */}
                                    <div className="flex flex-col h-full">
                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Metadata</h4>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-bold text-slate-500">Filename</span>
                                                        <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px]">{selectedDoc.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-bold text-slate-500">Category</span>
                                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedDoc.type}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-bold text-slate-500">Status</span>
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border", getStatusStyle(selectedDoc.status))}>
                                                            {selectedDoc.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedDoc.status === 'Pending' ? (
                                                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Decision Handling</h4>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Remarks <span className="text-slate-300 font-medium">(Optional for approval)</span></label>
                                                        <textarea 
                                                            className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#F26C22]/5 focus:border-[#F26C22] transition-all resize-none h-32 placeholder:text-slate-400 placeholder:font-normal"
                                                            placeholder="State the reason if rejecting this document..."
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={cn("p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-2 duration-500", selectedDoc.status === 'Verified' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/50')}>
                                                    <p className={cn("text-[10px] font-black uppercase tracking-widest", selectedDoc.status === 'Verified' ? 'text-emerald-600' : 'text-rose-600')}>Final Decision Status</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {selectedDoc.status === 'Verified' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                                                        <span className="font-black text-slate-900 dark:text-white">Document {selectedDoc.status}</span>
                                                    </div>
                                                    {selectedDoc.rejection_reason && (
                                                        <div className="mt-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-rose-100 dark:border-rose-800/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Internal Note / Reason</p>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic">"{selectedDoc.rejection_reason}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {selectedDoc.status === 'Pending' && (
                                            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <button 
                                                    disabled={isProcessing}
                                                    onClick={() => handleVerify(selectedDoc.id, 'Rejected')}
                                                    className="h-14 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                                >
                                                    Reject File
                                                </button>
                                                <button 
                                                    disabled={isProcessing}
                                                    onClick={() => handleVerify(selectedDoc.id, 'Verified')}
                                                    className="h-14 bg-[#F26C22] hover:bg-[#d65a16] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                                                >
                                                    {isProcessing ? (
                                                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        <><CheckCircle className="h-4 w-4" /> Verify Success</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}</style>
        </div>
    );
}
