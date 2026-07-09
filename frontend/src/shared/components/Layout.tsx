import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import HelpBot from './HelpBot/HelpBot';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <HelpBot />

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-100 text-neutral-600 py-10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-semibold">B</div>
                        <span className="text-lg font-semibold text-neutral-900">BookFair</span>
                        <span className="text-sm border-l border-neutral-100 pl-3 ml-1">© 2026</span>
                    </div>
                    <div className="flex gap-8 text-sm font-normal">
                        <a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-brand-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
