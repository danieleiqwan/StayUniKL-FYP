'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { FileText, Upload, Trash2, CheckCircle, AlertCircle, Clock, Eye, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export default function DocumentsHub() {
    const { user } = useAuth();
    const { myDocuments, refreshData } = useData();
    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedType, setSelectedType] = useState('Identification');

    const docTypes = ['Identification', 'Academic', 'Student ID', 'Supporting Document'];

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        setUploadSuccess('');

        if (!ALLOWED_TYPES.includes(file.type)) {
            setUploadError('Invalid file type. Only JPG, PNG, and PDF are allowed.');
            return;
        }

        if (file.size > MAX_SIZE) {
            setUploadError('File exceeds the 10MB size limit.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', selectedType);

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            
            if (!res.ok) {
                setUploadError(data.error || 'Failed to upload document.');
            } else {
                setUploadSuccess('Document uploaded successfully.');
                refreshData();
            }
        } catch (err: any) {
            setUploadError('An error occurred during upload.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        try {
            const res = await fetch(`/api/documents?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (res.ok) {
                refreshData();
            } else {
                alert(data.error || 'Failed to delete document');
            }
        } catch (err) {
            console.error('Delete error', err);
            alert('An error occurred');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Verified': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'Rejected': return <AlertCircle className="h-4 w-4 text-rose-500" />;
            default: return <Clock className="h-4 w-4 text-amber-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'Rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
            default: return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Document Center</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your official documents securely.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-black mb-4">Upload Document</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Document Type</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold outline-none"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    {docTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleUploadClick}
                                disabled={isUploading}
                                className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <Upload className={cn("h-8 w-8 text-slate-400", isUploading && "animate-bounce")} />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {isUploading ? 'Uploading...' : 'Click to select file'}
                                </span>
                                <span className="text-xs font-medium text-slate-400">PDF, JPG, PNG (Max 10MB)</span>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/jpeg, image/png, application/pdf"
                                onChange={handleFileChange}
                            />

                            {uploadError && <p className="text-xs text-rose-500 font-medium">{uploadError}</p>}
                            {uploadSuccess && <p className="text-xs text-emerald-500 font-medium">{uploadSuccess}</p>}
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-black mb-6">Your Documents</h2>

                        {myDocuments && myDocuments.length > 0 ? (
                            <div className="space-y-4">
                                {myDocuments.map((doc: any) => (
                                    <div key={doc.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                                                <FileIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1" title={doc.name}>
                                                    {doc.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{doc.type}</span>
                                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-2">
                                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusStyle(doc.status))}>
                                                {getStatusIcon(doc.status)}
                                                {doc.status}
                                            </div>
                                            <div className="flex gap-2">
                                                <a 
                                                    href={doc.file_url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                                {doc.status !== 'Verified' && (
                                                    <button 
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                <FileText className="h-12 w-12 mb-3 opacity-20" />
                                <p className="font-bold">No documents uploaded yet</p>
                                <p className="text-sm mt-1">Upload required documents to complete your profile.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
