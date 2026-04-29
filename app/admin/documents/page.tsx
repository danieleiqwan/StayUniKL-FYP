'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminFilterBar, { FilterState } from '@/components/admin/AdminFilterBar';
import { useAuth } from '@/context/AuthContext';
import StudentDetailModal from '@/components/admin/StudentDetailModal';
import { Eye, FileText as FileIcon, MousePointerClick } from 'lucide-react';

export default function AdminDocumentPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/documents');
            const data = await res.json();
            if (data.documents) setDocuments(data.documents);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = !filters.search ||
                doc.user_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                doc.user_id.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || doc.status === filters.status;
            // doc.created_at is ISO string, filters.startDate is YYYY-MM-DD
            const matchesDate = (!filters.startDate || doc.created_at.split('T')[0] >= filters.startDate) &&
                (!filters.endDate || doc.created_at.split('T')[0] <= filters.endDate);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [documents, filters]);

    if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    const handleReview = async (status: 'Verified' | 'Rejected') => {
        if (!selectedDoc) return;
        const notes = status === 'Rejected' ? prompt('Enter reason for rejection:') : null;
        if (status === 'Rejected' && notes === null) return;

        await fetch('/api/documents', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: selectedDoc.id,
                status,
                adminNotes: notes
            })
        });

        setSelectedDoc(null);
        fetchDocuments();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Verification Queue</h1>
                        <p className="text-slate-500">Review and verify student submissions.</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Queue */}
                    <div className="lg:col-span-2">
                        <AdminFilterBar
                            onFilterChange={setFilters}
                            statusOptions={['Pending', 'Verified', 'Rejected']}
                            showGender={false}
                            showRoomType={false}
                        />
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                            {loading ? (
                                <div className="p-10 text-center text-slate-500">Loading queue...</div>
                            ) : documents.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">No documents in queue.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th className="px-6 py-3">Student</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredDocuments.map(doc => (
                                            <tr
                                                key={doc.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
                                                onClick={() => setSelectedDoc(doc)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{doc.user_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono uppercase">{doc.user_id}</div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedStudentId(doc.user_id);
                                                            }}
                                                            className="p-1 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                                                            title="View Full Profile"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{doc.type}</td>
                                                <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' :
                                                        doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#F26C22] font-medium hover:underline">Review</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Review Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sticky top-24">
                            <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Review Submission</h2>

                            {selectedDoc ? (
                                <div className="space-y-6">
                                    <div className="p-3 bg-slate-50 rounded-lg dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 uppercase">Document Information</p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedDoc.type}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedDoc.user_name} ({selectedDoc.user_id})</p>
                                    </div>

                                    <div className="aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400 overflow-hidden">
                                        {/* In a real app, this would be an <img> or <iframe> or PDF viewer */}
                                        <div className="text-center p-4">
                                            <FileIcon className="h-10 w-10 text-slate-300 mx-auto block mb-2" />
                                            <p className="text-xs">Document Preview Not Available in Mock</p>
                                            <p className="text-xs font-mono mt-2 truncate w-full px-2">{selectedDoc.file_url}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleReview('Verified')}
                                            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-sm"
                                        >
                                            Verify Document
                                        </button>
                                        <button
                                            onClick={() => handleReview('Rejected')}
                                            className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-100"
                                        >
                                            Reject with Reason
                                        </button>
                                    </div>

                                    {selectedDoc.admin_notes && (
                                        <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100 shadow-sm">
                                            <strong>Presious Rejection Note:</strong><br />
                                            {selectedDoc.admin_notes}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-400">
                                    <MousePointerClick className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm">Select a document from the queue to start reviewing.</p>
                                </div>
                            )}
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
