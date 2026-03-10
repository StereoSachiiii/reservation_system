import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/shared/api/vendorApi';

export function useVendorDashboard() {
    const queryClient = useQueryClient();

    // Cancellation state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedResId, setSelectedResId] = useState<number | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    // --- QUERIES ---

    const reservationsQuery = useQuery({
        queryKey: ['vendor-reservations'],
        queryFn: vendorApi.getMyReservations,
    });

    const limitsQuery = useQuery({
        queryKey: ['vendor-limits'],
        queryFn: () => vendorApi.getAvailableCount(),
    });

    // --- MUTATIONS ---

    const cancelMutation = useMutation({
        mutationFn: (id: number) => vendorApi.cancelReservation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['vendor-limits'] });
            setShowCancelModal(false);
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = err instanceof Error ? (err as any).response?.data?.message : 'Cancellation failed';
            setLocalError(message || 'Cancellation failed');
        }
    });

    const refundRequestMutation = useMutation({
        mutationFn: (id: number) => vendorApi.requestRefund(id, 'Vendor requested refund from dashboard'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['vendor-limits'] });
            setShowCancelModal(false);
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = err instanceof Error ? (err as any).response?.data?.message : 'Refund request failed';
            setLocalError(message || 'Refund request failed');
        }
    });

    const handleCancelRequest = (id: number) => {
        setSelectedResId(id);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        if (!selectedResId) return;
        const res = (reservationsQuery.data || []).find(r => r.id === selectedResId);
        if (!res) return;

        if (res.status === 'PAID') {
            refundRequestMutation.mutate(selectedResId);
        } else {
            cancelMutation.mutate(selectedResId);
        }
    };

    const loading = reservationsQuery.isLoading || limitsQuery.isLoading;
    const error = localError || 
                  (reservationsQuery.error instanceof Error ? reservationsQuery.error.message : null) ||
                  (limitsQuery.error instanceof Error ? limitsQuery.error.message : null);

    const reservations = reservationsQuery.data || [];
    const limits = limitsQuery.data || { limit: 0, used: 0, remaining: 0 };
    const selectedRes = reservations.find(r => r.id === selectedResId);

    return {
        reservations,
        limits,
        selectedRes,
        showCancelModal,
        setShowCancelModal,
        error,
        setLocalError,
        loading,
        handleCancelRequest,
        handleConfirmCancel,
        isCancelling: cancelMutation.isPending || refundRequestMutation.isPending
    };
}
