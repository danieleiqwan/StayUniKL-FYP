'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
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
        if (!user || user.role !== 'admin') {
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
            case 'Verified': return 'bg-emerald-100 text-emerald-800';
            case 'Rejected': return 'bg-rose-100 text-rose-800';
            default: return 'bg-amber-100 text-amber-800';
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold">Loading documents...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Document Verification</h1>
                    <p className="text-slate-500 mt-1">Review and verify student uploaded documents.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search student or file..." 
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="py-2 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <select 
                        className="py-2 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Identification">Identification</option>
                        <option value="Academic">Academic</option>
                        <option value="Student ID">Student ID</option>
                        <option value="Supporting Document">Supporting Document</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date Uploaded</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{doc.student_name}</div>
                                        <div className="text-xs text-slate-500">{doc.student_id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span className="truncate font-medium text-slate-700" title={doc.name}>{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{doc.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusStyle(doc.status))}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedDoc(doc)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            <Eye className="h-3.5 w-3.5" /> Review
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No documents found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Review Document</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedDoc.student_name} ({selectedDoc.student_id})</p>
                            </div>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedDoc.name}</p>
                                        <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{selectedDoc.type}</p>
                                    </div>
                                </div>
                                <a 
                                    href={selectedDoc.file_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                                >
                                    View Full Screen
                                </a>
                            </div>

                            {/* Embed preview if possible (PDF/Image) */}
                            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                {selectedDoc.file_url.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={selectedDoc.file_url} className="w-full h-full" title="PDF Preview" />
                                ) : (
                                    <img src={selectedDoc.file_url} alt="Document Preview" className="w-full h-full object-contain" />
                                )}
                            </div>

                            {selectedDoc.status === 'Pending' && (
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Rejection Reason (Optional for approval)</label>
                                    <textarea 
                                        className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none h-24"
                                        placeholder="If rejecting, please explain why..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedDoc.status !== 'Pending' && (
                                <div className={cn("p-4 rounded-xl", selectedDoc.status === 'Verified' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800')}>
                                    <p className="font-bold text-sm">Currently {selectedDoc.status}</p>
                                    {selectedDoc.rejection_reason && (
                                        <p className="text-xs mt-1">Reason: {selectedDoc.rejection_reason}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedDoc.status === 'Pending' && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button 
                                    disabled={isProcessing}
                                    onClick={() => handleVerify(selectedDoc.id, 'Rejected')}
                                    className="px-6 py-2.5 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
                                >
                                    Reject
                                </button>
                                <button 
                                    disabled={isProcessing}
                                    onClick={() => handleVerify(selectedDoc.id, 'Verified')}
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" /> Verify Document
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
