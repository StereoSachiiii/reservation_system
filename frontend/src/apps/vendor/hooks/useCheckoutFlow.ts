import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { paymentApi } from '@/shared/api/paymentApi';

interface UseCheckoutFlowProps {
    reservationId: number;
    paymentMethod: 'SELECT' | 'ONLINE' | 'CASH';
    setPaymentMethod: (method: 'SELECT' | 'ONLINE' | 'CASH') => void;
}

export function useCheckoutFlow({
    reservationId,
    paymentMethod,
    setPaymentMethod,
}: UseCheckoutFlowProps) {
    const [isSuccess, setIsSuccess] = useState(false);
    const [manualClientSecret, setManualClientSecret] = useState<string | null>(null);
    const [manualError, setManualError] = useState<string | null>(null);

    const intentMutation = useMutation({
        mutationKey: ['payment-intent', reservationId],
        mutationFn: () => paymentApi.createPaymentIntent(reservationId),
    });

    const handleSelectMethod = (method: 'ONLINE' | 'CASH') => {
        setManualError(null);
        if (method === 'CASH') {
            setPaymentMethod('CASH');
            setManualClientSecret('CASH_INIT');
        } else {
            setPaymentMethod('ONLINE');
            if (!intentMutation.data?.clientSecret) {
                intentMutation.mutate();
            }
        }
    };

    const resetSelection = () => {
        setPaymentMethod('SELECT');
        setManualClientSecret(null);
        setManualError(null);
        intentMutation.reset();
    };

    const clientSecret = paymentMethod === 'CASH' ? manualClientSecret : intentMutation.data?.clientSecret || null;
    const intentError = manualError || (intentMutation.error instanceof Error ? intentMutation.error.message : null);

    return {
        clientSecret,
        intentError,
        isSuccess,
        setIsSuccess,
        handleSelectMethod,
        resetSelection,
        setIntentError: setManualError,
        loadingIntent: intentMutation.isPending
    };
}
