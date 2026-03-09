import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const LoadingDisplay = () => {
    return (
        <div className="animate-pulse p-4">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
    );
};

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const {
        data: notifications = [],
        isPending: notificationsPending,
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 60000,
        staleTime: 30000,
        enabled: !!user,
    });

    const {
        data: unreadCount = 0,
        isPending: unreadPending,
    } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationApi.getUnreadCount,
        refetchInterval: 60000,
        staleTime: 30000,
        enabled: !!user,
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const isPending = notificationsPending || unreadPending;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 flex items-center justify-center"
                aria-label="Toggle notifications"
            >
                <Bell size={20} fill={unreadCount > 0 ? "currentColor" : "none"} className={unreadCount > 0 ? "text-blue-600 animate-swing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-100">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-scale-in">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-black text-slate-900 text-sm tracking-tight">Notifications</h3>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-full">{unreadCount} Unread</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {isPending ? (
                            <LoadingDisplay />
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <span className="text-3xl block mb-2">🎈</span>
                                <p className="text-xs font-bold">All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.read && handleMarkAsRead(n.id)}
                                        className={`p-5 transition-colors cursor-pointer hover:bg-slate-50 relative group ${!n.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                                        <div className="flex gap-3 text-left">
                                            <span className="text-lg flex-shrink-0">
                                                {n.type === 'SUCCESS' ? '✅' : n.type === 'WARNING' ? '⚠️' : n.type === 'URGENT' ? '🚨' : 'ℹ️'}
                                            </span>
                                            <div className="flex-1">
                                                <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                                <span className="text-[10px] text-slate-400 font-medium mt-2 block italic">
                                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
                        <Link
                            to={user?.role === 'ADMIN' ? '/admin/audit-logs' : (user?.role === 'VENDOR' ? '/home' : '/employee/dashboard')}
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                        >
                            View All History
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
