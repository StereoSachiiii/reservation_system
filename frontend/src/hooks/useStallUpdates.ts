import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IFrame } from '@stomp/stompjs';

export interface StallUpdateMessage {
    stallId: number;
    reserved: boolean;
    occupiedBy: string | null;
    publisherCategory: string | null;
}

const SOCKET_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/ws` : 'http://localhost:8080/ws';

export const useStallUpdates = (onUpdate: (message: StallUpdateMessage) => void) => {
    const stompClient = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            debug: (str) => {
                if (import.meta.env.DEV) console.log('STOMP DEBUG:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame: IFrame) => {
            if (import.meta.env.DEV) console.log('STOMP Connected:', frame);

            client.subscribe('/topic/stalls', (message) => {
                if (message.body) {
                    const update: StallUpdateMessage = JSON.parse(message.body);
                    onUpdate(update);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error', frame.headers['message']);
            console.error('STOMP details', frame.body);
        };

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [onUpdate]);

    return stompClient.current;
};
