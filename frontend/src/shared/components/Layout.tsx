import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import HelpBot from './HelpBot/HelpBot';
import { LiveActivityTicker } from '@/apps/public/components/LiveActivityTicker';
import { CommandPalette } from './CommandPalette';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-900 font-sans transition-colors duration-200 text-slate-900 dark:text-slate-100">
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <HelpBot />
            <LiveActivityTicker />

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-800 text-neutral-600 dark:text-neutral-400 py-10 mt-auto transition-colors duration-200">
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
