import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { useHelpBot } from './useHelpBot';
import './HelpBot.css';

const HelpBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, askQuestion, isLoading, isOnline } = useHelpBot();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim() || !isOnline) return;
        askQuestion(input);
        setInput('');
    };

    return (
        <div className="help-bot-container">
            {!isOpen && (
                <button
                    className="help-bot-fab group relative"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open support chat"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <MessageCircle size={24} className="relative" />
                </button>
            )}

            {isOpen && (
                <div className="help-bot-window flex flex-col shadow-2xl border border-slate-100 rounded-3xl overflow-hidden bg-white animate-in slide-in-from-bottom-5 duration-300">
                    <div className="help-bot-header p-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Bot size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Bookfair AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="help-bot-messages flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                    <div className={`text-[10px] mt-1.5 opacity-60 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-50">
                        <div className="relative flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 pr-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                type="text"
                                placeholder={isOnline ? "Ask a question..." : "Bot is currently offline"}
                                disabled={!isOnline}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2 text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim() || !isOnline}
                                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpBot;
