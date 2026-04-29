'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
    Wrench, Plus, ImagePlus, X, AlertCircle, Clock, CheckCircle2, BedDouble, ChevronRight
} from 'lucide-react';

export default function ComplaintsPage() {
    const { user } = useAuth();
    const { myComplaints, createComplaint, myApplication } = useData();
    const isCheckedIn = myApplication?.status === 'Checked in';

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    // Image upload state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        setUploadError(null);

        const remaining = 3 - imageFiles.length;
        if (remaining <= 0) { setUploadError('Maximum 3 images allowed.'); return; }
        const toAdd = selected.slice(0, remaining);

        const invalid = toAdd.find(f => !['image/jpeg', 'image/jpg', 'image/png'].includes(f.type));
        if (invalid) { setUploadError('Only JPG and PNG files are allowed.'); return; }
        const tooBig = toAdd.find(f => f.size > 5 * 1024 * 1024);
        if (tooBig) { setUploadError(`Files cannot exceed 5MB.`); return; }

        const newFiles = [...imageFiles, ...toAdd];
        setImageFiles(newFiles);
        const newPreviews = toAdd.map(f => URL.createObjectURL(f));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [imageFiles]);

    const removeImage = (idx: number) => {
        URL.revokeObjectURL(imagePreviews[idx]);
        setImageFiles(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleComplaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUploadError(null);
        try {
            let uploadedPaths: string[] = [];
            if (imageFiles.length > 0) {
                const fd = new FormData();
                imageFiles.forEach(f => fd.append('images', f));
                const uploadRes = await fetch('/api/upload-complaint-images', { method: 'POST', body: fd });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    setUploadError(uploadData.error || 'Image upload failed.');
                    setIsSubmitting(false);
                    return;
                }
                uploadedPaths = uploadData.paths;
            }
            await createComplaint(complaintForm.title, complaintForm.description, uploadedPaths);
            setComplaintForm({ title: '', description: '' });
            setImageFiles([]);
            imagePreviews.forEach(p => URL.revokeObjectURL(p));
            setImagePreviews([]);
            setIsFormOpen(false);
        } catch (err) {
            setUploadError('Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    const getStatusTextAndColor = (status: string) => {
        if (status === 'Resolved') return { text: 'Resolved', tagColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', boxColor: 'bg-emerald-50 dark:bg-emerald-900/20' };
        if (status === 'In Progress') return { text: 'In Progress', tagColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', boxColor: 'bg-blue-50 dark:bg-blue-900/20' };
        return { text: 'Pending', tagColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', boxColor: 'bg-red-50 dark:bg-red-900/20' };
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Facilities Complaints</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Report and track maintenance issues in your accommodation.</p>
                </div>
                {!isFormOpen && (
                    isCheckedIn ? (
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="flex items-center gap-2 bg-[#F26C22] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#d65a16] transition-all text-sm"
                        >
                            <Plus className="h-5 w-5" /> Report Issue
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30 text-sm font-semibold max-w-sm text-center transition-colors">
                            <AlertCircle className="h-5 w-5 shrink-0" /> Only active tenants can submit facilities complaints.
                        </div>
                    )
                )}
            </div>

            {/* Submission Form */}
            {isFormOpen && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[#F26C22]/20 dark:border-orange-900/30 p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 transition-colors">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Maintenance Request</h2>
                        <button onClick={() => setIsFormOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleComplaintSubmit} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Issue Title</label>
                            <input
                                type="text"
                                required
                                value={complaintForm.title}
                                onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })}
                                placeholder="e.g., Broken Fan in Room 101"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:border-[#F26C22] dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detailed Description</label>
                            <textarea
                                required
                                value={complaintForm.description}
                                onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                                placeholder="Please describe the issue, its location, and when it started..."
                                rows={4}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:border-[#F26C22] dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-white resize-none"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Attach Photos <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(Optional)</span></label>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">{imageFiles.length}/3 Uploaded</span>
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

                            {uploadError && (
                                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
                                    <AlertCircle className="h-4 w-4" /> {uploadError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((src, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 aspect-square shadow-sm bg-slate-50 dark:bg-slate-800/50">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {imageFiles.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-[#F26C22] dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                                    >
                                        <div className="bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 p-2 rounded-lg text-slate-400 group-hover:text-[#F26C22] dark:group-hover:text-orange-400 transition-colors">
                                            <ImagePlus className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-[#F26C22] dark:group-hover:text-orange-400 transition-colors">Add Photo</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-[#F26C22] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#d65a16] disabled:opacity-50 transition-all shadow-md shadow-orange-500/10">
                                {isSubmitting ? (
                                    <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Submitting</>
                                ) : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {['All', 'Pending', 'Arranged Appointment', 'Resolved'].map((filter) => {
                    const count = filter === 'All' 
                        ? myComplaints.length 
                        : myComplaints.filter(c => {
                            if (filter === 'Pending') return c.status === 'Pending' && !c.technicianAppointment;
                            if (filter === 'Arranged Appointment') return !!c.technicianAppointment && c.status !== 'Resolved';
                            if (filter === 'Resolved') return c.status === 'Resolved';
                            return false;
                        }).length;

                    return (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-3 border transition-colors ${
                                activeFilter === filter 
                                ? 'bg-[#F26C22] text-white border-[#F26C22] shadow-lg shadow-orange-500/20' 
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/50'
                            }`}
                        >
                            {filter}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] transition-colors ${
                                activeFilter === filter ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Complaints List grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(myComplaints.filter(c => {
                    if (activeFilter === 'All') return true;
                    if (activeFilter === 'Pending') return c.status === 'Pending' && !c.technicianAppointment;
                    if (activeFilter === 'Arranged Appointment') return !!c.technicianAppointment && c.status !== 'Resolved';
                    if (activeFilter === 'Resolved') return c.status === 'Resolved';
                    return true;
                })).length > 0 ? (myComplaints.filter(c => {
                    if (activeFilter === 'All') return true;
                    if (activeFilter === 'Pending') return c.status === 'Pending' && !c.technicianAppointment;
                    if (activeFilter === 'Arranged Appointment') return !!c.technicianAppointment && c.status !== 'Resolved';
                    if (activeFilter === 'Resolved') return c.status === 'Resolved';
                    return true;
                })).map(complaint => {
                    const status = getStatusTextAndColor(complaint.status);
                    const isAc = complaint.title.toLowerCase().includes('ac') || complaint.title.toLowerCase().includes('air');
                    const Icon = isAc ? BedDouble : Wrench;

                    return (
                        <div key={complaint.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
                            <div className="flex gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${status.boxColor}`}>
                                    <Icon className={`h-6 w-6 ${status.text === 'Pending' ? 'text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white transition-colors">{complaint.title}</h3>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${status.tagColor}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-3">ID {complaint.id.split('-')[0].toUpperCase()} • {new Date(complaint.date).toLocaleDateString()}</p>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-4 transition-colors">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {complaint.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Footer Info Area */}
                            <div className="mt-auto pl-16">
                                {complaint.technicianAppointment ? (
                                    <div className="flex items-center gap-2 text-[#F26C22] dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg text-sm font-semibold border border-orange-100 dark:border-orange-900/30 transition-colors">
                                        <Clock className="h-4 w-4 text-[#F26C22] dark:text-orange-400" />
                                        Appointment: {new Date(complaint.technicianAppointment).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium transition-colors">
                                        <Clock className="h-4 w-4" />
                                        Awaiting assignment
                                    </div>
                                )}

                                {/* Attached Images thumbnails if any */}
                                {(complaint as any).images?.length > 0 && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                        {(complaint as any).images.map((src: string, i: number) => (
                                            <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-[#F26C22] dark:hover:ring-orange-500 transition-all">
                                                <img src={src} alt="Attached" className="h-full w-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-1 lg:col-span-2 text-center p-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] transition-colors">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Ongoing Issues</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your space is looking good. Need something fixed? Report it anytime.</p>
                        {isCheckedIn && (
                            <button onClick={() => setIsFormOpen(true)} className="mt-6 text-[#F26C22] dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/20 px-6 py-2.5 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all">
                                Report an Issue
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
