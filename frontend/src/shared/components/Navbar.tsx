import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/useAuth';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { NAV_COPY } from '@/copy/nav.copy';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path
            ? "text-neutral-900 dark:text-white font-semibold"
            : "text-neutral-600 dark:text-neutral-300 font-normal hover:text-neutral-900 dark:hover:text-white transition-colors duration-200";
    };

    return (
        <nav className="h-16 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
                {/* Logo & Brand */}
                <div className="flex items-center gap-8">
                    <Link to="/home" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            B
                        </div>
                        <span className="font-semibold text-lg text-neutral-900 dark:text-white tracking-tight">
                            BookFair
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6 text-sm">
                        <Link to="/home" className={isActive('/home')}>
                            {NAV_COPY.home}
                        </Link>

                        {user?.role === 'VENDOR' && (
                            <Link to="/vendor/dashboard" className={isActive('/vendor/dashboard')}>
                                {NAV_COPY.dashboard}
                            </Link>
                        )}
                        {user?.role === 'EMPLOYEE' && (
                            <Link to="/employee" className={isActive('/employee')}>
                                {NAV_COPY.portal}
                            </Link>
                        )}
                        {user?.role === 'ADMIN' && (
                            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
                                {NAV_COPY.console}
                            </Link>
                        )}

                        <Link to="/events" className={isActive('/events')}>
                            {NAV_COPY.events}
                        </Link>
                    </div>
                </div>

                {/* User Profile / Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {user ? (
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="hidden sm:flex items-center gap-3 relative group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold text-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-neutral-900 leading-none">{user.username}</span>
                                </div>

                                {/* Action Dropdown */}
                                <div className="absolute top-full pt-2 right-0 hidden group-hover:block z-50 min-w-[180px]">
                                    <div className="bg-white border border-neutral-100 shadow-card rounded-md p-2">
                                        {user.role === 'VENDOR' && (
                                            <>
                                                <Link to="/vendor/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-normal text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 rounded-sm">
                                                    {NAV_COPY.editProfile}
                                                </Link>
                                                <Link to="/vendor/documents" className="flex items-center gap-3 px-4 py-2 text-sm font-normal text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 rounded-sm">
                                                    {NAV_COPY.documents}
                                                </Link>
                                            </>
                                        )}
                                        {user.role === 'ADMIN' && (
                                            <Link to="/admin/vendor-documents" className="flex items-center gap-3 px-4 py-2 text-sm font-normal text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 rounded-sm">
                                                {NAV_COPY.vendorDocuments}
                                            </Link>
                                        )}
                                        <div className="h-px bg-neutral-100 my-1" />
                                        <button
                                            onClick={() => logout()}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-normal text-red-600 hover:bg-red-50 rounded-sm"
                                        >
                                            {NAV_COPY.logout}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-neutral-600 font-semibold hover:text-brand-600 transition-colors text-sm">
                                {NAV_COPY.login}
                            </Link>
                            <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-md shadow-card transition-colors">
                                {NAV_COPY.signUp}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
