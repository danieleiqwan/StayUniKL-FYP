'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, ScanLine, UserCheck, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminCheckinPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return <div className="p-10 text-center">Access Denied. Admins only.</div>;
    }

    return (
        <div className="max-w-[1400px] mx-auto px-10 py-12 space-y-10">
                
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-3">
                        <ScanLine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        QR Check-in Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Generate secure tokens or scan to check students in automatically.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8 max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'generate' 
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <QrCode className="h-4 w-4" /> Generate QR
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'scan' 
                            ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <ScanLine className="h-4 w-4" /> Scan QR
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-10 min-h-[500px]">
                    {activeTab === 'generate' ? <GeneratorMode /> : <ScannerMode />}
                </div>

        </div>
    );
}

// ----------------------------------------------------------------------
// GENERATOR MODE
// ----------------------------------------------------------------------
function GeneratorMode() {
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<any>(null);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                // Fetch all applications, but we usually want to search or list approved ones
                // To display quickly, we will fetch applications and filter out 'Approved' only
                const res = await fetch('/api/applications');
                const data = await res.json();
                if (data.applications) {
                    // 1. Group by student to see if they already have a 'Checked in' status
                    const studentStatusMap: Record<string, string> = {};
                    data.applications.forEach((a: any) => {
                        const sid = a.studentId;
                        // If they are already checked in anywhere, that takes priority
                        if (a.status === 'Checked in') {
                            studentStatusMap[sid] = 'Checked in';
                        } else if (!studentStatusMap[sid]) {
                            studentStatusMap[sid] = a.status;
                        }
                    });

                    // 2. Only show 'Approved' if the student isn't already 'Checked in'
                    const approved = data.applications.filter((a: any) => 
                        a.status === 'Approved' && studentStatusMap[a.studentId] !== 'Checked in'
                    );
                    setApplications(approved);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const filteredApps = applications.filter(a => 
        a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.roomId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGenerate = async (app: any) => {
        setGenerating(true);
        setGeneratedToken(null);
        setSelectedApp(app);
        try {
            const res = await fetch('/api/admin/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: app.id })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedToken(data.token);
            } else {
                alert(`Error: ${data.error}`);
                setSelectedApp(null);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate token");
            setSelectedApp(null);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Loading approved applications...</div>;

    if (generatedToken && selectedApp) {
        return (
            <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mb-8 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4" /> Secure Token Generated
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 w-[250px] h-[250px] flex items-center justify-center">
                    <QRCode value={generatedToken} size={200} />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-1">{selectedApp.studentName}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">ID: {selectedApp.studentId}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                        Room {selectedApp.roomId}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                        Bed {selectedApp.bedId}
                    </span>
                </div>

                <div className="mt-10">
                    <button 
                        onClick={() => { setGeneratedToken(null); setSelectedApp(null); }}
                        className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        ← Back to List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search by student name, ID, or room..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredApps.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        No approved check-ins found.
                    </div>
                ) : (
                    filteredApps.map(app => (
                        <div key={app.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                            <div className="flex-1 min-w-0 mb-3 sm:mb-0 text-center sm:text-left">
                                <p className="font-bold text-slate-900 dark:text-white truncate">{app.studentName}</p>
                                <p className="text-xs text-slate-500 font-medium">ID: {app.studentId} • Room: {app.roomId} • Bed: {app.bedId}</p>
                            </div>
                            <button
                                onClick={() => handleGenerate(app)}
                                disabled={generating}
                                className="w-full sm:w-auto px-5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-800/50"
                            >
                                {generating && selectedApp?.id === app.id ? (
                                    <span className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <QrCode className="h-4 w-4" />
                                )}
                                Generate
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// SCANNER MODE
// ----------------------------------------------------------------------
function ScannerMode() {
    const [scanType, setScanType] = useState<'room' | 'room_checkout' | 'court'>('room');
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; student?: any } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    
    // We strictly use state to guard against rapid double-fires.
    const isProcessingRef = useRef(false);

    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;
        let isCameraActive = false;
        
        const timer = setTimeout(async () => {
            html5QrCode = new Html5Qrcode("qr-reader");
            
            try {
                // Request camera directly and start scanning
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanFailure
                );
                isCameraActive = true;
                setIsScanning(true);
            } catch (err) {
                console.error("Camera permission denied or error:", err);
                setScanResult({ success: false, message: "Camera access denied. Please enable camera permissions in your browser settings." });
            }
        }, 300);

        async function onScanSuccess(decodedText: string) {
            // Prevent multiple requests if we are already processing
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;
            
            try {
                let endpoint = '';
                if (scanType === 'room') {
                    endpoint = '/api/admin/checkin';
                } else if (scanType === 'room_checkout') {
                    endpoint = '/api/admin/checkout';
                } else {
                    endpoint = '/api/admin/court-checkin';
                }

                const res = await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: decodedText })
                });
                
                const data = await res.json();
                
                if (data.requiresConfirmation) {
                    // Admin warning for early check-in
                    const confirmed = window.confirm(data.message);
                    if (confirmed) {
                        const forceRes = await fetch(endpoint, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: decodedText, forceEarlyCheckin: true })
                        });
                        const forceData = await forceRes.json();
                        
                        if (forceData.success) {
                            setScanResult({ success: true, message: forceData.message, student: forceData.student });
                        } else {
                            setScanResult({ success: false, message: forceData.error });
                        }
                    } else {
                        setScanResult({ success: false, message: "Early check-in cancelled by Administrator." });
                    }
                } else if (data.success) {
                    setScanResult({ success: true, message: data.message, student: data.student });
                } else {
                    setScanResult({ success: false, message: data.error });
                }
            } catch (err) {
                console.error(err);
                setScanResult({ success: false, message: 'Network error communicating with server.' });
            } finally {
                // Keep the result visible momentarily before allowing another scan
                setTimeout(() => {
                    setScanResult(null);
                    isProcessingRef.current = false;
                }, 3000);
            }
        }

        function onScanFailure(error: any) {
            // Continuously fires while finding nothing, ignore.
        }

        return () => {
            clearTimeout(timer);
            if (html5QrCode && isCameraActive) {
                html5QrCode.stop().then(() => {
                    html5QrCode?.clear();
                }).catch(e => console.error("Failed to stop scanner", e));
            }
        };
    }, [scanType]); // Re-initialize camera hook when scanType changes to ensure endpoint binding is correct

    return (
        <div className="flex flex-col items-center">
            
            {/* Scan Type Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 w-full max-w-md">
                <button
                    onClick={() => setScanType('room')}
                    className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${scanType === 'room' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Room Check-in
                </button>
                <button
                    onClick={() => setScanType('room_checkout')}
                    className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${scanType === 'room_checkout' ? 'bg-white dark:bg-slate-900 text-[#F26C22] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Room Check-out
                </button>
                <button
                    onClick={() => setScanType('court')}
                    className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${scanType === 'court' ? 'bg-[#F26C22] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Court Check-in
                </button>
            </div>

            {/* Camera Preview Box */}
            <div className="w-full max-w-md relative rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-900 min-h-[300px] flex items-center justify-center">
                <div id="qr-reader" className="w-full h-full" />
                
                {!isScanning && !scanResult && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                         <span className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
                         <p className="text-sm font-bold animate-pulse">Requesting Camera...</p>
                     </div>
                )}
                
                {/* Result Overlay */}
                {scanResult && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200 z-10">
                        {scanResult.success ? (
                            <>
                                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce">
                                    <UserCheck className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    {scanType === 'room_checkout' ? 'Check-out Complete!' : 'Check-in Complete!'}
                                </h3>
                                <p className="text-green-300 font-medium">{scanResult.student?.name}</p>
                                {scanType === 'room' ? (
                                    <p className="text-green-400/70 text-sm mt-1">Room {scanResult.student?.room} • Bed {scanResult.student?.bed}</p>
                                ) : scanType === 'room_checkout' ? (
                                    <p className="text-green-400/70 text-sm mt-1">Room {scanResult.student?.room} • Bed {scanResult.student?.bed} is now Available</p>
                                ) : (
                                    <p className="text-green-400/70 text-sm mt-1">{scanResult.student?.sport} Court • {scanResult.student?.timeSlot}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                                    <AlertCircle className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Scan Failed</h3>
                                <p className="text-red-300 font-medium px-4">{scanResult.message}</p>
                            </>
                        )}
                        <div className="absolute bottom-6 w-full flex justify-center">
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" /> Resuming automatically...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
                <p className="font-bold flex items-center justify-center gap-2 mb-1">
                    <ScanLine className="h-4 w-4" /> Present QR Code
                </p>
                <p className="text-sm">
                    {scanType === 'room_checkout' 
                        ? "Scan a student's check-out QR token or Virtual ID Card to check them out of their room assignment instantly."
                        : "Scan a generated check-in token to instantly authenticate & review the student's status."
                    }
                </p>
            </div>
            
        </div>
    );
}
