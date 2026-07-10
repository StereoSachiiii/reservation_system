import { useNavigate } from 'react-router-dom';
import { useVendorProfile } from '../hooks/useVendorProfile';
import { Sparkles, ArrowLeft, Save, Building2 } from 'lucide-react';

export const VendorProfilePage = () => {
    const navigate = useNavigate();
    const {
        formData,
        setFormData,
        isLoading,
        isUpdating,
        success,
        error,
        handleSubmit
    } = useVendorProfile();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 pb-32">
            {/* Edge-to-Edge Hero Header */}
            <header className="pt-24 pb-16 px-8 md:px-16 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-slate-100">
                <div>
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 mb-4 block flex items-center gap-3">
                        <Building2 size={16} /> Identity Management
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6">
                        Business Profile
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Control how your publishing house is represented to the public and organizers across the Bookfair ecosystem.
                    </p>
                </div>
            </header>

            <main className="px-8 md:px-16 max-w-6xl mx-auto mt-16">
                {success && (
                    <div className="mb-12 bg-emerald-50 text-emerald-900 p-8 flex items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-500 rounded-2xl">
                        <div className="bg-emerald-600 text-white p-3 rounded-xl shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl tracking-tight mb-1">Identity Synchronized</h3>
                            <p className="font-medium text-emerald-800/80">Your profile modifications have been successfully propagated across the global network.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-12 bg-rose-50 text-rose-900 p-8 rounded-2xl border-l-4 border-rose-600 font-bold text-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-16 max-w-4xl">
                    
                    {/* Typography-Driven Fields */}
                    <div className="space-y-12">
                        {/* Business Name */}
                        <div className="group">
                            <label className="text-base font-bold text-slate-700 mb-3 block group-focus-within:text-indigo-600 transition-colors">
                                Registered Business Name
                            </label>
                            <input
                                className="w-full text-4xl md:text-5xl font-black text-slate-900 bg-transparent border-b-4 border-slate-200 py-4 focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-300"
                                value={formData.businessName}
                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="e.g., Penguin Random House"
                                required
                            />
                        </div>

                        {/* Contact & Address Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="group">
                                <label className="text-base font-bold text-slate-700 mb-3 block group-focus-within:text-indigo-600 transition-colors">
                                    Primary Contact Number
                                </label>
                                <input
                                    className="w-full text-2xl font-black text-slate-900 bg-transparent border-b-4 border-slate-200 py-4 focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-300"
                                    value={formData.contactNumber}
                                    onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            
                            <div className="group">
                                <label className="text-base font-bold text-slate-700 mb-3 block group-focus-within:text-indigo-600 transition-colors">
                                    Physical Address / Headquarters
                                </label>
                                <input
                                    className="w-full text-2xl font-black text-slate-900 bg-transparent border-b-4 border-slate-200 py-4 focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-300"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Publisher's Row, NY"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="group">
                            <label className="text-base font-bold text-slate-700 mb-3 block group-focus-within:text-indigo-600 transition-colors">
                                Organization Manifesto / Description
                            </label>
                            <textarea
                                className="w-full text-xl font-medium leading-relaxed text-slate-900 bg-slate-50 p-8 rounded-3xl border-2 border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all h-48 resize-none placeholder:text-slate-400"
                                value={formData.businessDescription}
                                onChange={e => setFormData({ ...formData, businessDescription: e.target.value })}
                                placeholder="Detail your organization's history, mission, and the genres you champion..."
                            />
                        </div>

                        {/* Logo URL */}
                        <div className="group">
                            <label className="text-base font-bold text-slate-700 mb-3 block group-focus-within:text-indigo-600 transition-colors">
                                Visual Brand Identity (Logo URL)
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    className="w-full text-lg font-bold text-slate-900 bg-transparent border-b-4 border-slate-200 py-4 focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-300"
                                    value={formData.logoUrl}
                                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                                    placeholder="https://your-domain.com/logo.png"
                                />
                                {formData.logoUrl && (
                                    <img 
                                        src={formData.logoUrl} 
                                        alt="Logo Preview" 
                                        className="absolute right-0 w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                        onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-8 pt-16 border-t-2 border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/vendor/dashboard')}
                            className="w-full md:w-auto px-8 py-5 text-slate-600 font-bold text-base hover:text-slate-900 transition-colors flex items-center justify-center gap-3"
                        >
                            <ArrowLeft size={18} />
                            Return to Dashboard
                        </button>
                        
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3 rounded-2xl"
                        >
                            {isUpdating ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {isUpdating ? 'Synchronizing...' : 'Commit Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};
