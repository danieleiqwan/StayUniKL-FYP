'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    QrCode, FileText, Camera, UploadCloud, X, CheckCircle2, 
    AlertCircle, Loader2, Save, User as UserIcon, Building, MapPin, 
    GraduationCap, Paperclip 
} from 'lucide-react';

export default function CreateInvoicePage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [fetchingStudent, setFetchingStudent] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    
    // Form State
    const [invoiceType, setInvoiceType] = useState('Hostel Damage Fine');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleScan = async (result: any, error: any) => {
        if (result && result.text) {
            setIsScanning(false);
            setScanError(null);
            try {
                const data = JSON.parse(result.text);
                if (data.studentId) {
                    fetchStudentDetails(data.studentId);
                } else {
                    setScanError("Invalid QR Code: Missing student identification.");
                }
            } catch (e) {
                setScanError("Invalid QR format. Please scan a valid StayUniKL Virtual ID.");
            }
        }
        if (error && !result) {
            if (error?.message && !error.message.includes("No MultiFormat Readers")) {
                console.warn(error);
            }
        }
    };

    const fetchStudentDetails = async (studentId: string) => {
        setFetchingStudent(true);
        setMsg(null);
        try {
            const res = await fetch('/api/finances/student-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            });
            const data = await res.json();
            if (data.success) {
                setStudentData(data.student);
                setMsg({ type: 'success', text: 'Student verified successfully via QR.' });
            } else {
                setMsg({ type: 'error', text: data.error || 'Student not found.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setFetchingStudent(false);
        }
    };

    const handleFile = (file: File) => {
        setEvidenceFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setEvidencePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setEvidencePreview(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => {
        setEvidenceFile(null);
        setEvidencePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentData) {
            setMsg({ type: 'error', text: 'Please scan a student QR code first.' });
            return;
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setMsg({ type: 'error', text: 'Please enter a valid amount.' });
            return;
        }
        if (!dueDate) {
            setMsg({ type: 'error', text: 'Please select a due date.' });
            return;
        }

        setSubmitting(true);
        setMsg(null);

        try {
            // Upload evidence to Cloudinary via a dedicated upload route if needed,
            // or just post directly via form-data in Phase 3 actual implementation.
            const formData = new FormData();
            formData.append('studentId', studentData.id);
            formData.append('type', invoiceType);
            formData.append('amount', amount);
            formData.append('dueDate', dueDate);
            formData.append('description', description);
            if (evidenceFile) {
                formData.append('evidence', evidenceFile);
            }

            // Creating the invoice
            const res = await fetch('/api/finances/invoices', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                setMsg({ type: 'success', text: 'Invoice generated successfully and sent to student.' });
                // Reset form
                setStudentData(null);
                setAmount('');
                setDueDate('');
                setDescription('');
                removeFile();
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to generate invoice.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to generate invoice.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Generate Invoice</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm ml-1">
                    Smart billing module. Scan student QR to auto-fill details and attach evidence.
                </p>
            </div>

            {msg && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                    {msg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Student Identification */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden relative">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Student Identification</h2>
                        
                        {!studentData ? (
                            <div className="text-center py-8">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                    <QrCode className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-black mb-2">No Student Selected</h3>
                                <p className="text-sm text-slate-500 mb-6">Scan a student's Virtual ID to load their billing profile.</p>
                                
                                <button 
                                    onClick={() => setIsScanning(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <Camera className="h-5 w-5" /> Scan Student QR
                                </button>
                                
                                {fetchingStudent && (
                                    <div className="mt-4 flex items-center justify-center text-indigo-500 text-sm font-bold">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying ID...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <UserIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white">{studentData.name}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{studentData.studentId}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 text-sm font-medium">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="truncate">{studentData.course}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>{studentData.campus}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                        <Building className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>{studentData.residency}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setStudentData(null)}
                                    className="w-full py-3 mt-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Scan Different Student
                                </button>
                            </div>
                        )}
                        
                        {/* Decorative Background for Student Card */}
                        {studentData && (
                            <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        )}
                    </div>
                </div>

                {/* Right Column: Invoice Details */}
                <div className="lg:col-span-7">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Invoice Details</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Invoice Category & Type *</label>
                                <select 
                                    value={invoiceType} 
                                    onChange={e => setInvoiceType(e.target.value)}
                                    disabled={!studentData || submitting}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 disabled:opacity-50"
                                >
                                    <optgroup label="Financial">
                                        <option value="Hostel Fee">Hostel Fee</option>
                                        <option value="Installment Payment">Installment Payment</option>
                                        <option value="Late Payment">Late Payment Penalty</option>
                                    </optgroup>
                                    <optgroup label="Disciplinary">
                                        <option value="Hostel Damage Fine">Hostel Damage Fine</option>
                                        <option value="Facility Misuse">Facility Misuse Fine</option>
                                        <option value="Cleaning Penalty">Cleaning Penalty</option>
                                        <option value="Other Administrative Charges">Other Administrative Charges</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Amount (RM) *</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        required 
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        disabled={!studentData || submitting}
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Due Date *</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        disabled={!studentData || submitting}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description & Remarks *</label>
                                <textarea 
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    disabled={!studentData || submitting}
                                    placeholder="Provide detailed context for this charge..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-medium text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 resize-none disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Evidence Attachment</label>
                                <div 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                                        !studentData ? 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 opacity-50' : 
                                        isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]' : 
                                        evidenceFile ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10' : 
                                        'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                                    }`}
                                >
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        disabled={!studentData || submitting}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                        accept="image/*,.pdf"
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none relative z-0">
                                        {evidenceFile ? (
                                            <div className="flex flex-col items-center w-full">
                                                {evidencePreview ? (
                                                    <div className="h-24 w-auto max-w-full rounded-xl overflow-hidden mb-3 shadow-sm">
                                                        <img src={evidencePreview} alt="Preview" className="h-full w-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                                        <Paperclip className="h-6 w-6" />
                                                    </div>
                                                )}
                                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-full px-4">{evidenceFile.name}</p>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); removeFile(); }}
                                                    className="mt-2 text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg pointer-events-auto"
                                                >
                                                    Remove File
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                                                    <UploadCloud className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {isDragging ? 'Drop file here!' : 'Drag & Drop or Click to Upload'}
                                                </p>
                                                <p className="text-xs font-medium text-slate-500">Supports Images (JPG, PNG) & PDF</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={!studentData || submitting}
                                    className="flex items-center gap-2 bg-indigo-500 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    {submitting ? 'Processing...' : 'Generate Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

                                {/* Form Code unchanged, Scanner Code updated */}
            {/* QR Scanner Modal */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white">Scan Student ID</h3>
                                <p className="text-xs font-medium text-slate-500 mt-1">Position the QR code within the frame</p>
                            </div>
                            <button onClick={() => { setIsScanning(false); setScanError(null); }} className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-black relative aspect-square">
                            <ScannerComponent onResult={handleScan} />
                            {/* Scanning Overlay Reticle */}
                            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                                <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg"></div>
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg -ml-1 -mt-1"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg -mr-1 -mt-1"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg -ml-1 -mb-1"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg -mr-1 -mb-1"></div>
                            </div>
                        </div>
                        {scanError && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold text-center flex items-center justify-center gap-2">
                                <AlertCircle className="h-4 w-4" /> {scanError}
                            </div>
                        )}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Waiting for QR Code...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScannerComponent({ onResult }: { onResult: (text: string) => void }) {
    const { Html5Qrcode } = require('html5-qrcode');
    const isProcessingRef = useRef(false);

    useEffect(() => {
        let html5QrCode: any = null;
        let isCameraActive = false;
        
        const timer = setTimeout(async () => {
            html5QrCode = new Html5Qrcode("finance-qr-reader");
            try {
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    { 
                        fps: 10, 
                        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                            const qrboxSize = Math.floor(minEdge * 0.85); // 85% of viewport
                            return { width: qrboxSize, height: qrboxSize };
                        }
                    },
                    (decodedText: string) => {
                        if (isProcessingRef.current) return;
                        isProcessingRef.current = true;
                        onResult(decodedText);
                    },
                    () => {} // ignore warnings
                );
                isCameraActive = true;
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (html5QrCode && isCameraActive) {
                html5QrCode.stop().then(() => html5QrCode?.clear()).catch((e: any) => console.error(e));
            }
        };
    }, [onResult]);

    return <div id="finance-qr-reader" className="w-full h-full" />;
}
