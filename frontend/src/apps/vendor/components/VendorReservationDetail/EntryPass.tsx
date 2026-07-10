import QRCode from 'react-qr-code';
import { Download } from 'lucide-react';

interface EntryPassProps {
    qrCode: string | undefined;
    isCancelled: boolean;
    onShowFullscreen: () => void;
    onDownloadTicket: () => void;
}

export const EntryPass = ({ qrCode, isCancelled, onShowFullscreen, onDownloadTicket }: EntryPassProps) => {
    return (
        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/10 flex flex-col md:flex-row relative">
            {/* Left side: Content & Download */}
            <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                        Official Entry Pass
                    </h3>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                    Show this pass at the vendor entrance
                </h2>
                
                <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-md">
                    To prevent delays on the day of the event, please download this ticket and present the QR code to the venue staff for priority access to your stall.
                </p>

                {!isCancelled ? (
                    <button 
                        onClick={onDownloadTicket}
                        className="self-start px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-brand-500/30 flex items-center gap-3 active:scale-[0.98]"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF Ticket
                    </button>
                ) : (
                    <div className="text-red-500 font-black uppercase tracking-widest bg-red-500/10 self-start px-6 py-3 rounded-xl border border-red-500/20">
                        This pass is cancelled
                    </div>
                )}
            </div>

            {/* Right side: QR Code (with dashed separation) */}
            <div className="bg-white flex flex-col items-center justify-center p-12 md:p-16 border-t-[3px] md:border-t-0 md:border-l-[3px] border-dashed border-slate-200 relative w-full md:w-auto">
                <div
                    className={`p-6 bg-white rounded-3xl ${isCancelled ? 'opacity-30' : 'cursor-pointer hover:scale-105 transition-transform drop-shadow-2xl'}`}
                    onClick={() => !isCancelled && onShowFullscreen()}
                >
                    {qrCode ? (
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "220px" }}
                            value={qrCode}
                            fgColor="#000000"
                        />
                    ) : (
                        <div className="w-[220px] h-[220px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            No Entry Code
                        </div>
                    )}
                </div>

                <p className={`mt-8 font-mono text-lg font-bold tracking-widest ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {qrCode?.split('-').pop() || 'NO-ID'}
                </p>
            </div>
        </div>
    );
};
