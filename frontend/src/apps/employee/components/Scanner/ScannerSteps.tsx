import React, { useState } from 'react';
import { QrCameraScanner } from './QrCameraScanner';
import { ScannerResult } from '@/shared/types/api';
import { Search, Camera, CornerDownRight, CheckCircle2, AlertCircle, Trash2, ShieldAlert, Check } from 'lucide-react';

interface ScannerInputProps {
    qrInput: string;
    setQrInput: (val: string) => void;
    handleLookup: (e: React.FormEvent) => void;
    loading: boolean;
    directLookup: (qrOrId: string) => void;
}

interface ScannerResultCardProps {
    result: ScannerResult;
    handleAdmit: () => void;
    handleOverride: () => void;
    handleClear: () => void;
    admitLoading: boolean;
    overrideLoading: boolean;
}

export const ScannerInput = ({ qrInput, setQrInput, handleLookup, loading, directLookup }: ScannerInputProps) => {
    const [cameraMode, setCameraMode] = useState(false);

    const handleScanSuccess = (decodedText: string) => {
        setCameraMode(false);
        directLookup(decodedText);
    };

    if (cameraMode) {
        return (
            <div className="mb-10 animate-in fade-in zoom-in-95 duration-300">
                <QrCameraScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={() => setCameraMode(false)}
                />
            </div>
        );
    }

    return (
        <form onSubmit={handleLookup} className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-5">
                <div className="relative group">
                    <input
                        type="text"
                        autoFocus
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="Scan or Enter ID"
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xl focus:border-slate-900 focus:bg-white focus:ring-0 transition-all text-center tracking-widest placeholder:tracking-normal placeholder:font-sans"
                    />
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-slate-900 transition-colors">
                        <Search size={22} />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading || !qrInput}
                    className="w-full py-5 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    {loading ? 'Processing...' : (
                        <>
                            LOOKUP RESERVATION
                            <CornerDownRight size={14} />
                        </>
                    )}
                </button>
                <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <button
                    type="button"
                    onClick={() => setCameraMode(true)}
                    className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <Camera size={16} />
                    Open Camera Lens
                </button>
            </div>
        </form>
    );
};

export const ScannerResultCard = ({
    result,
    handleAdmit,
    handleOverride,
    handleClear,
    admitLoading,
    overrideLoading
}: ScannerResultCardProps) => (
    <div className="space-y-8 mb-10 animate-in fade-in zoom-in-95 duration-500">
        <div className={`rounded-[2rem] p-8 border-2 transition-all shadow-sm ${result.valid
            ? 'bg-emerald-50/30 border-emerald-100'
            : 'bg-rose-50/30 border-rose-100'
            }`}>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Business</h3>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{result.businessName}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${result.valid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {result.valid ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Stall Ref</h3>
                        <p className="text-base font-black text-slate-900">{result.stallName}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Security Status</h3>
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${result.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                            {result.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            {result.valid && (
                <button
                    onClick={handleAdmit}
                    disabled={admitLoading}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-emerald-100 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    {admitLoading ? 'Processing Access...' : (
                        <>
                            AUTHORIZE ADMISSION
                            <Check size={16} strokeWidth={3} />
                        </>
                    )}
                </button>
            )}
            {!result.valid && (
                <button
                    onClick={handleOverride}
                    disabled={overrideLoading}
                    className="w-full py-5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-rose-100 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    {overrideLoading ? 'Bypassing...' : (
                        <>
                            FORCE OVERRIDE
                            <ShieldAlert size={16} />
                        </>
                    )}
                </button>
            )}
            <button
                onClick={handleClear}
                className="w-full py-4 text-slate-400 hover:text-slate-900 border-2 border-transparent hover:border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
                <Trash2 size={14} className="group-hover:text-rose-500 transition-colors" />
                Dismiss Entry
            </button>
        </div>
    </div>
);
