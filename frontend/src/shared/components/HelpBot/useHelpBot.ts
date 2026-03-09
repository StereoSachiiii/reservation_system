import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { vendorApi } from '../../api/vendorApi';


//Message for the RAG service
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'system';
    timestamp: Date;
}

export const useHelpBot = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! I'm the Bookfair Assistant. How can I help you today? You can ask me about stall pricing, the designer, or event rules.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);

    // Polling for availability
    const { data: availability } = useQuery({
        queryKey: ['helpBotAvailability'],
        queryFn: vendorApi.helpBotAvailability,
        refetchInterval: 30000,
        staleTime: 10000,
    });

    const isOnline = availability?.online ?? false;

    const mutation = useMutation({
        mutationFn: (query: string) => vendorApi.askQuestion(query),
        onSuccess: (data) => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.answer,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        },
        onError: () => {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having a technical glitch. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    });

    const addMessage = (text: string, sender: 'user' | 'bot' | 'system') => {
        const newMsg: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMsg]);
        return newMsg;
    };

    const askQuestion = async (text: string) => {
        if (!text.trim() || mutation.isPending || !isOnline) return;

        addMessage(text, 'user');
        mutation.mutate(text);
    };

    return {
        messages,
        askQuestion,
        isLoading: mutation.isPending,
        isOnline,
        error: mutation.error
    };
};
