import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/useAuth';
import { Search, Home, Calendar, LayoutDashboard, Settings, HelpCircle, LogOut } from 'lucide-react';
import './CommandPalette.css';

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div className="relative w-full max-w-xl mx-4 sm:mx-0 overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <Command className="flex flex-col w-full h-full max-h-[60vh] overflow-hidden rounded-xl bg-white dark:bg-slate-900" label="Global Command Menu">
                    
                    <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800" cmdk-input-wrapper="">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <Command.Input 
                            autoFocus 
                            placeholder="Type a command or search..." 
                            className="flex w-full px-3 py-4 text-sm bg-transparent border-0 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400" 
                        />
                        <div className="flex items-center gap-1">
                            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">ESC</kbd>
                        </div>
                    </div>

                    <Command.List className="overflow-y-auto overflow-x-hidden max-h-[300px] p-2 scroll-smooth">
                        <Command.Empty className="py-6 text-sm text-center text-slate-500">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                            <Command.Item 
                                onSelect={() => runCommand(() => navigate('/home'))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                <span>Home</span>
                            </Command.Item>
                            <Command.Item 
                                onSelect={() => runCommand(() => navigate('/events'))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 transition-colors"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Upcoming Events</span>
                            </Command.Item>
                        </Command.Group>

                        {user?.role === 'VENDOR' && (
                            <Command.Group heading="Vendor Actions" className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                                <Command.Item 
                                    onSelect={() => runCommand(() => navigate('/vendor/dashboard'))}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 transition-colors"
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Vendor Dashboard</span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {user?.role === 'ADMIN' && (
                            <Command.Group heading="Admin Actions" className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                                <Command.Item 
                                    onSelect={() => runCommand(() => navigate('/admin/dashboard'))}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 transition-colors"
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Admin Dashboard</span>
                                </Command.Item>
                                <Command.Item 
                                    onSelect={() => runCommand(() => navigate('/admin/halls'))}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 transition-colors"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Hall Management</span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        <Command.Group heading="Support" className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                            <Command.Item 
                                onSelect={() => runCommand(() => window.open('mailto:support@bookfair.com'))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 transition-colors"
                            >
                                <HelpCircle className="mr-2 h-4 w-4" />
                                <span>Contact Support</span>
                            </Command.Item>
                        </Command.Group>

                        {user && (
                            <Command.Group heading="Account" className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                                <Command.Item 
                                    onSelect={() => runCommand(() => {
                                        logout();
                                        navigate('/login');
                                    })}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-red-50 dark:aria-selected:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </Command.Item>
                            </Command.Group>
                        )}
                    </Command.List>
                </Command>
            </div>
        </div>
    );
};
