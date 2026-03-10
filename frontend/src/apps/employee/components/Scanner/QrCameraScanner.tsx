import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Keyboard, Loader2 } from 'lucide-react';

interface QrCameraScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(true);
    const containerId = 'qr-camera-reader';

    useEffect(() => {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        scanner.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            (decodedText: string) => {
                // Stop scanner immediately to prevent duplicate reads
                scanner.stop().then(() => {
                    scannerRef.current = null;
                    onScanSuccess(decodedText);
                }).catch(() => {
                    onScanSuccess(decodedText);
                });
            },
            () => {
                // Ignore non-match frames (called on every frame without a QR)
            }
        ).then(() => {
            setIsStarting(false);
        }).catch((err: unknown) => {
            setIsStarting(false);
            const errStr = err instanceof Error ? err.message : String(err);
            if (errStr.includes('NotAllowedError')) {
                setError('Camera permission denied. Please allow camera access and try again.');
            } else if (errStr.includes('NotFoundError')) {
                setError('No camera found on this device.');
            } else {
                setError('Could not start camera. Please use manual entry instead.');
            }
        });

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="space-y-6">
            {/* Viewfinder Container */}
            <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl">
                <div id={containerId} className="w-full aspect-square" />

                {/* Scanning overlay animation */}
                {!error && !isStarting && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[200px] h-[200px] relative">
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
                            {/* Scan line */}
                            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line" />
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isStarting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Calibrating Lens...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-6 text-center animate-in shake-in">
                    <p className="text-rose-700 font-black text-[10px] uppercase tracking-widest mb-2">Hardware Malfunction</p>
                    <p className="text-rose-600 text-xs font-medium">{error}</p>
                </div>
            )}

            {/* Instructions */}
            {!error && !isStarting && (
                <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                    Position QR within frame
                </p>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-4 text-slate-400 hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <Keyboard size={16} />
                Switch to Manual Entry
            </button>
        </div>
    );
};
