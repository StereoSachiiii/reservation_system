import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { AnimatePresence, motion } from 'framer-motion';

const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    if (apiUrl.startsWith('/')) {
        const port = window.location.port ? `:${window.location.port}` : '';
        const root = apiUrl.replace(/\/api\/v1\/?$/, '');
        return `${window.location.protocol}//${window.location.hostname}${port}${root}/ws`;
    }
    return apiUrl.replace(/\/api\/v1\/?$/, '') + '/ws';
};

interface ActivityMessage {
    id: string;
    text: string;
}

export const LiveActivityTicker: React.FC = () => {
    const [messages, setMessages] = useState<ActivityMessage[]>([]);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(getSocketUrl()),
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            client.subscribe('/topic/public/activity', (message) => {
                if (message.body) {
                    const newMsg = {
                        id: Math.random().toString(36).substring(7),
                        text: message.body
                    };
                    setMessages(prev => [...prev, newMsg]);
                    
                    // Auto-remove after 5 seconds
                    setTimeout(() => {
                        setMessages(prev => prev.filter(m => m.id !== newMsg.id));
                    }, 5000);
                }
            });
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {messages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-white dark:bg-slate-800 shadow-lg rounded-full px-4 py-2 border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {msg.text}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
