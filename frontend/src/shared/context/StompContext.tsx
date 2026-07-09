import { createContext, useContext, MutableRefObject } from 'react';
import { Client } from '@stomp/stompjs';

export const StompContext = createContext<MutableRefObject<Client | null> | null>(null);
export const useStomp = () => useContext(StompContext);
