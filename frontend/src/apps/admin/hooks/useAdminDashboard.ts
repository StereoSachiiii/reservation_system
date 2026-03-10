import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { Event, SystemHealth } from '@/shared/types/api';

export function useAdminDashboard() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVENTS'>('OVERVIEW');

    // Event Management Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [eventData, setEventData] = useState<Partial<Event>>({
        name: '',
        location: 'BMICH',
        status: 'UPCOMING',
        startDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
        endDate: new Date().toISOString().split('T')[0] + 'T23:59:59'
    });

    // ─── QUERIES ──────────────────────────────────────────────────

    const healthQuery = useQuery({
        queryKey: ['admin-health'],
        queryFn: async () => {
            try {
                return await adminApi.getHealth();
            } catch {
                return {
                    database: 'DOWN',
                    paymentGateway: 'DOWN',
                    mailService: 'DOWN',
                    uptimeSeconds: 0,
                    usedMemoryBytes: 0,
                    totalMemoryBytes: 0,
                    maxMemoryBytes: 0,
                    activeThreads: 0,
                    latencyMs: 0
                } as SystemHealth;
            }
        },
        refetchInterval: 30000 // Refresh health every 30s
    });

    const auditLogsQuery = useQuery({
        queryKey: ['admin-audit-logs', 'RESERVATION'],
        queryFn: () => adminApi.getAuditLogs('RESERVATION', 0),
    });

    const eventsQuery = useQuery({
        queryKey: ['admin-events'],
        queryFn: adminApi.getAllEvents,
    });

    const statsQuery = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminApi.getDashboardStats,
    });

    // ─── MUTATIONS ────────────────────────────────────────────────

    const createEventMutation = useMutation({
        mutationFn: adminApi.createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setShowCreateModal(false);
            setEventData({
                name: '', location: 'BMICH', status: 'UPCOMING',
                startDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
                endDate: new Date().toISOString().split('T')[0] + 'T23:59:59'
            });
        },
        onError: (e: Error) => alert(e.message)
    });

    const deleteEventMutation = useMutation({
        mutationFn: adminApi.deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (e: Error) => alert(e.message)
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: 'UPCOMING' | 'OPEN' | 'CLOSED' }) =>
            adminApi.changeEventStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
        },
        onError: (e: Error) => alert(e.message)
    });

    const updateEventMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Event> }) =>
            adminApi.updateEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setShowEditModal(false);
        },
        onError: (e: Error) => alert(e.message)
    });

    // ─── HANDLERS ─────────────────────────────────────────────────

    const handleCreateEvent = () => {
        const payload = { ...eventData };
        if (payload.startDate && payload.startDate.length === 10) payload.startDate += 'T00:00:00';
        if (payload.endDate && payload.endDate.length === 10) payload.endDate += 'T23:59:59';
        createEventMutation.mutate(payload);
    };

    const handleDeleteEvent = (id: number) => {
        if (confirm('Are you sure? This will delete the event and all stalls.')) {
            deleteEventMutation.mutate(id);
        }
    };

    const handleUpdateEventStatus = (id: number, status: 'UPCOMING' | 'OPEN' | 'CLOSED') => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleStartEdit = (event: Event) => {
        setEventData({
            ...event,
            startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] + 'T00:00:00' : undefined,
            endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] + 'T23:59:59' : undefined
        });
        setShowEditModal(true);
    };

    const handleUpdateEvent = () => {
        if (!eventData.id) return;
        const payload = { ...eventData };
        if (payload.startDate && payload.startDate.length === 10) payload.startDate += 'T00:00:00';
        if (payload.endDate && payload.endDate.length === 10) payload.endDate += 'T23:59:59';
        updateEventMutation.mutate({ id: eventData.id, data: payload });
    };

    const loading = healthQuery.isLoading || auditLogsQuery.isLoading || eventsQuery.isLoading || statsQuery.isLoading;

    return {
        activeTab, setActiveTab,
        health: healthQuery.data || null,
        auditLogs: auditLogsQuery.data || null,
        events: eventsQuery.data || [],
        stats: statsQuery.data || null,
        loading,
        showCreateModal, setShowCreateModal,
        showEditModal, setShowEditModal,
        eventData, setEventData,
        loadInitialData: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-health'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        handleCreateEvent,
        handleDeleteEvent,
        handleUpdateEventStatus,
        handleStartEdit,
        handleUpdateEvent
    };
}
