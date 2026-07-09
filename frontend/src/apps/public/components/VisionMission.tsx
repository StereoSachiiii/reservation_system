function VisionMission() {
    return (
        <section className="bg-white py-12 px-8 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 text-center mb-10">
                <h2 className="text-xl font-extrabold text-slate-800 mb-3 uppercase tracking-wider">
                    Vision, Mission & Values
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-amber-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">

                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-300">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center mb-4 mx-auto font-black text-sm">
                        V
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 text-center">Our Vision</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed text-center">
                        To become the premier digital platform that simplifies and elevates the book fair experience for everyone.
                    </p>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-300">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center mb-4 mx-auto font-black text-sm">
                        M
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 text-center">Our Mission</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed text-center">
                        To provide a secure, transparent, and aesthetically pleasing reservation system for authors and stalls.
                    </p>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors duration-300">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center mb-4 mx-auto font-black text-sm">
                        C
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 text-center">Core Values</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed text-center">
                        Efficiency, transparency, innovation, and a relentless commitment to literary excellence.
                    </p>
                </div>

            </div>
        </section>
    )
}

export default VisionMission;
