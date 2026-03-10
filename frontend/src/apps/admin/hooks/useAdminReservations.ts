import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { Reservation } from '@/shared/types/api';

export function useAdminReservations() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING_PAYMENT' | 'CANCELLED' | 'PENDING_REFUND'>('ALL');
    
    // UI Specific State
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [paymentModal, setPaymentModal] = useState<Reservation | null>(null);
    const [cancelModal, setCancelModal] = useState<Reservation | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [refundModal, setRefundModal] = useState<Reservation | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [vendorDocsModal, setVendorDocsModal] = useState<Reservation | null>(null);
    const [page, setPage] = useState(0);
    const pageSize = 10;

    // ─── QUERIES ──────────────────────────────────────────────────

    const reservationsQuery = useQuery({
        queryKey: ['admin-reservations'],
        queryFn: adminApi.getAllReservations,
    });

    // ─── MUTATIONS ────────────────────────────────────────────────

    const confirmPaymentMutation = useMutation({
        mutationFn: adminApi.confirmPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setPaymentModal(null);
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => 
            adminApi.cancelReservation(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setCancelModal(null);
            setCancelReason('');
        },
    });

    const refundMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => 
            adminApi.refundReservation(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setRefundModal(null);
            setRefundReason('');
        },
    });

    // ─── EFFECTS ──────────────────────────────────────────────────

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm, statusFilter]);

    // ─── HANDLERS ─────────────────────────────────────────────────

    const executeConfirmPayment = async () => {
        if (!paymentModal) return;
        confirmPaymentMutation.mutate(paymentModal.id);
    };

    const executeCancel = async () => {
        if (!cancelModal) return;
        cancelMutation.mutate({ 
            id: cancelModal.id, 
            reason: cancelReason || 'Admin cancelled' 
        });
    };

    const executeRefundApprove = async () => {
        if (!refundModal) return;
        refundMutation.mutate({ 
            id: refundModal.id, 
            reason: refundReason || 'Refund Approved by Admin' 
        });
    };

    const handleExport = async () => {
        try {
            await adminApi.exportReservationsCsv();
        } catch {
            alert('Failed to export CSV.');
        }
    };

    const handleAction = (e: React.MouseEvent, type: 'PAYMENT' | 'CANCEL' | 'REFUND' | 'DOCS', res: Reservation) => {
        e.stopPropagation();
        switch (type) {
            case 'PAYMENT': setPaymentModal(res); break;
            case 'CANCEL': setCancelModal(res); setCancelReason(''); break;
            case 'REFUND': setRefundModal(res); setRefundReason(''); break;
            case 'DOCS': setVendorDocsModal(res); break;
        }
    };

    // ─── DERIVED STATE ───────────────────────────────────────────

    const reservations = reservationsQuery.data || [];
    
    const filteredReservations = useMemo(() => {
        const data = reservationsQuery.data || [];
        if (!Array.isArray(data)) return [];
        return data.filter(res => {
            const username = res.user?.username || '';
            const qrCode = res.qrCode || '';
            const fallbackId = `RES-${res.id}`;
            const matchesSearch =
                username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                qrCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                fallbackId.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [reservationsQuery.data, debouncedSearchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredReservations.length / pageSize);
    const paginatedReservations = filteredReservations.slice(page * pageSize, (page + 1) * pageSize);

    const error = reservationsQuery.error instanceof Error ? reservationsQuery.error.message : 
                  confirmPaymentMutation.error instanceof Error ? confirmPaymentMutation.error.message :
                  cancelMutation.error instanceof Error ? cancelMutation.error.message :
                  refundMutation.error instanceof Error ? refundMutation.error.message : '';

    return {
        reservations,
        loading: reservationsQuery.isLoading,
        error,
        setError: () => {}, // Compatibility with old API if needed
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        actionLoading: confirmPaymentMutation.isPending || cancelMutation.isPending || refundMutation.isPending,
        paymentModal, setPaymentModal,
        cancelModal, setCancelModal, cancelReason, setCancelReason,
        refundModal, setRefundModal, refundReason, setRefundReason,
        vendorDocsModal, setVendorDocsModal,
        page, setPage, totalPages,
        paginatedReservations,
        executeConfirmPayment, executeCancel, executeRefundApprove,
        handleExport, handleAction
    };
}
