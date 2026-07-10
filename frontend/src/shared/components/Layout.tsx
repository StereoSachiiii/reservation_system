import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import HelpBot from './HelpBot/HelpBot';
import { LiveActivityTicker } from '@/apps/public/components/LiveActivityTicker';

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
            <footer className="bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-800 pt-12 pb-8 mt-auto transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-semibold">B</div>
                            <span className="text-lg font-semibold text-neutral-900 dark:text-white">BookFair</span>
                        </div>
                        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                            The all-in-one platform for booking and managing book fair stalls.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><Link to="/events" className="hover:text-brand-600 transition-colors">Browse Events</Link></li>
                            <li><Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link></li>
                            <li><Link to="/pricing" className="hover:text-brand-600 transition-colors">Pricing</Link></li>
                            <li><Link to="/contact" className="hover:text-brand-600 transition-colors">For Organizers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><Link to="/about" className="hover:text-brand-600 transition-colors">About</Link></li>
                            <li><Link to="/contact" className="hover:text-brand-600 transition-colors">Contact</Link></li>
                            <li><Link to="/careers" className="hover:text-brand-600 transition-colors">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><Link to="/privacy-policy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/tos" className="hover:text-brand-600 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-neutral-100 dark:border-slate-800 text-xs text-neutral-400 dark:text-neutral-500">
                    © 2026 BookFair. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
