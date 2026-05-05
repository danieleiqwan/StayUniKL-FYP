'use client';

import { useState, useEffect } from 'react';
import { X, Search, CheckCircle, AlertCircle, User as UserIcon } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    student_id: string;
    email: string;
    profile_image: string;
    gender: string;
    latest_status: string | null;
    room_id: string | null;
}

interface AssignStudentToBedModalProps {
    roomId: string;
    roomLabel: string;
    roomType: string;
    roomGender: string;
    floorId: number;
    bedId: string;
    bedLabel: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignStudentToBedModal({
    roomId,
    roomLabel,
    roomType,
    roomGender,
    floorId,
    bedId,
    bedLabel,
    onClose,
    onSuccess
}: AssignStudentToBedModalProps) {
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/admin/students/all');
                const data = await res.json();
                if (data.success) {
                    // Filter students: Match gender and not currently assigned to a room
                    const eligibleStudents = data.students.filter((s: Student) => 
                        s.gender === roomGender && 
                        !['Approved', 'Checked in', 'Payment Pending', 'Approved - Assigned', 'Approved - Waitlist', 'Pending Review'].includes(s.latest_status || '')
                    );
                    setStudents(eligibleStudents);
                }
            } catch (error) {
                console.error('Failed to fetch students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [roomGender]);

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAssign = async () => {
        if (!selectedStudentId) return;

        setAssigning(true);
        try {
            const res = await fetch('/api/admin/assign-bed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudentId,
                    roomId,
                    bedId,
                    floorId,
                    roomType
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Successfully assigned to ${roomLabel} - Bed ${bedLabel}`);
                onSuccess();
            } else {
                alert(`Failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Assignment error:', error);
            alert('An error occurred while assigning the bed.');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Assign Student</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {roomLabel} • Bed {bedLabel}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search & List */}
                <div className="p-8 flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative mb-6 shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name, ID or email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-[#F26C22] focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 outline-none transition-all font-medium text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                <div className="h-8 w-8 border-4 border-slate-200 border-t-[#F26C22] rounded-full animate-spin mb-4"></div>
                                <p className="font-bold text-sm tracking-widest uppercase">Loading Students...</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-center">
                                <AlertCircle className="h-10 w-10 mb-3 text-slate-400" />
                                <p className="font-bold text-sm">No eligible students found.</p>
                                <p className="text-xs mt-1">Must be {roomGender} and not currently assigned to a room.</p>
                            </div>
                        ) : (
                            filteredStudents.map(student => (
                                <div 
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        selectedStudentId === student.id 
                                            ? 'border-[#F26C22] bg-orange-50/50 dark:bg-orange-900/20' 
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-900/50'
                                    }`}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
                                        {student.profile_image ? (
                                            <img src={student.profile_image} alt={student.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black truncate ${selectedStudentId === student.id ? 'text-[#F26C22]' : 'text-slate-900 dark:text-white'}`}>
                                            {student.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <p className="text-xs font-mono text-slate-500">{student.student_id}</p>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.gender}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                                            selectedStudentId === student.id 
                                                ? 'bg-[#F26C22] text-white' 
                                                : 'border-2 border-slate-300 dark:border-slate-700'
                                        }`}>
                                            {selectedStudentId === student.id && <CheckCircle className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
                    <p className="text-sm font-bold text-slate-500">
                        {selectedStudentId ? 'Ready to confirm assignment' : 'Please select a student'}
                    </p>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest">
                            Cancel
                        </button>
                        <button 
                            onClick={handleAssign}
                            disabled={!selectedStudentId || assigning}
                            className="px-8 py-3 bg-[#F26C22] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {assigning ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Assigning...
                                </>
                            ) : (
                                'Confirm Assignment'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
