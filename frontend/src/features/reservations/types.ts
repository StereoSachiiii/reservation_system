import { User } from '@/shared/types/user';
import { Stall } from '@/shared/types/stall';

export interface Reservation {
    id: number
    reservationId: number
    user: User
    stall?: Stall
    qrCode: string
    status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'CHECKED_IN' | 'PENDING_REFUND'
    emailSent: boolean
    createdAt: string
    event?: {
        id: number;
        name: string;
        venueName?: string;
    };
    stalls: string[];
    totalPriceCents?: number;
}

export interface ReservationRequest {
    userId: number;
    eventId: number;
    stallIds: number[];
}

