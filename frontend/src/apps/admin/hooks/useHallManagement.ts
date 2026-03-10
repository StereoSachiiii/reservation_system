import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { Hall, Event, Venue, Building } from '@/shared/types/api';

export type ViewMode = 'EVENTS' | 'VENUES' | 'BUILDINGS' | 'HALLS';

export function useHallManagement() {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>('EVENTS');
    const [filterQuery, setFilterQuery] = useState('');

    // Selection states
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingHall, setEditingHall] = useState<Hall | null>(null);
    const [success, setSuccess] = useState('');
    const [localError, setLocalError] = useState('');

    // --- QUERIES ---

    const eventsQuery = useQuery({
        queryKey: ['admin-events'],
        queryFn: adminApi.getAllEvents,
    });

    const venuesQuery = useQuery({
        queryKey: ['admin-venues'],
        queryFn: adminApi.getAllVenues,
        enabled: viewMode === 'VENUES' || !!selectedEvent,
    });

    const buildingsQuery = useQuery({
        queryKey: ['admin-buildings', selectedVenue?.id],
        queryFn: () => adminApi.getBuildingsByVenue(selectedVenue!.id),
        enabled: !!selectedVenue,
    });

    const hallsQuery = useQuery({
        queryKey: ['admin-halls-by-building', selectedBuilding?.id],
        queryFn: () => adminApi.getHallsByBuilding(selectedBuilding!.id),
        enabled: !!selectedBuilding,
    });

    // --- PERSISTENCE ---

    useEffect(() => {
        const saved = sessionStorage.getItem('admin_hall_state');
        if (saved) {
            const { event, venue, building, mode } = JSON.parse(saved);
            if (event) setSelectedEvent(event);
            if (venue) setSelectedVenue(venue);
            if (building) setSelectedBuilding(building);
            if (mode) setViewMode(mode);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('admin_hall_state', JSON.stringify({
            event: selectedEvent,
            venue: selectedVenue,
            building: selectedBuilding,
            mode: viewMode
        }));
    }, [selectedEvent, selectedVenue, selectedBuilding, viewMode]);

    // --- MUTATIONS ---

    const saveHallMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) => {
            if (editingHall) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return adminApi.updateHall(editingHall.id, payload as any);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return adminApi.createHall(payload as any);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-halls-by-building', selectedBuilding?.id] });
            setSuccess(editingHall ? `Hall "${data.name}" updated.` : `Hall "${data.name}" created.`);
            setShowModal(false);
        }
    });

    const hallStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: 'PUBLISHED' | 'ARCHIVED' }) => 
            adminApi.changeHallStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-halls-by-building', selectedBuilding?.id] });
            setSuccess(variables.status === 'ARCHIVED' ? 'Hall archived.' : 'Hall published.');
        }
    });

    // --- HANDLERS ---

    const handleSelectEvent = (event: Event) => {
        setSelectedEvent(event);
        if (event.venueId) {
            // Pre-select venue if available
            const venue = venuesQuery.data?.find(v => v.id === event.venueId);
            if (venue) {
                setSelectedVenue(venue);
                setViewMode('BUILDINGS');
                return;
            }
        }
        setViewMode('VENUES');
    };

    const handleSelectVenue = (venue: Venue) => {
        setSelectedVenue(venue);
        setViewMode('BUILDINGS');
    };

    const handleSelectBuilding = (building: Building) => {
        setSelectedBuilding(building);
        setViewMode('HALLS');
    };

    const resetToEvents = () => {
        setViewMode('EVENTS');
        setSelectedEvent(null);
        setSelectedVenue(null);
        setSelectedBuilding(null);
    };

    const goBack = () => {
        if (viewMode === 'VENUES') {
            setViewMode('EVENTS');
            setSelectedEvent(null);
        } else if (viewMode === 'BUILDINGS') {
            if (selectedEvent?.venueId) {
                setViewMode('EVENTS');
                setSelectedEvent(null);
                setSelectedVenue(null);
            } else {
                setViewMode('VENUES');
                setSelectedVenue(null);
            }
        } else if (viewMode === 'HALLS') {
            setViewMode('BUILDINGS');
            setSelectedBuilding(null);
        }
    };

    const handleSave = async (data: Record<string, string>) => {
        if (!selectedBuilding) return;
        const payload = {
            ...data,
            buildingId: selectedBuilding.id,
            totalSqFt: parseFloat(data.totalSqFt) || 0,
            capacity: parseInt(data.capacity) || 0,
            floorLevel: parseInt(data.floorLevel) || 1,
            expectedFootfall: parseInt(data.expectedFootfall) || 0,
            distanceFromEntrance: parseFloat(data.distanceFromEntrance) || 0,
            distanceFromParking: parseFloat(data.distanceFromParking) || 0,
            mainCategory: data.mainCategory || undefined,
            status: editingHall?.status || 'DRAFT'
        };
        saveHallMutation.mutate(payload);
    };

    const handleArchive = (hall: Hall) => {
        if (!window.confirm(`Archive "${hall.name}"?`)) return;
        hallStatusMutation.mutate({ id: hall.id, status: 'ARCHIVED' });
    };

    const handlePublish = (hall: Hall) => {
        if (!confirm(`Publish hall "${hall.name}"? It will become visible to vendors.`)) return;
        hallStatusMutation.mutate({ id: hall.id, status: 'PUBLISHED' });
    };

    // --- DERIVED ---

    const filteredEvents = useMemo(() => (eventsQuery.data || []).filter(e => e.name.toLowerCase().includes(filterQuery.toLowerCase())), [eventsQuery.data, filterQuery]);
    const filteredVenues = useMemo(() => (venuesQuery.data || []).filter(v => v.name.toLowerCase().includes(filterQuery.toLowerCase())), [venuesQuery.data, filterQuery]);
    const filteredBuildings = useMemo(() => (buildingsQuery.data || []).filter(b => b.name.toLowerCase().includes(filterQuery.toLowerCase())), [buildingsQuery.data, filterQuery]);
    const filteredHalls = useMemo(() => (hallsQuery.data || []).filter(h => h.name.toLowerCase().includes(filterQuery.toLowerCase()) && h.status !== 'ARCHIVED'), [hallsQuery.data, filterQuery]);

    const loading = eventsQuery.isLoading || venuesQuery.isLoading || buildingsQuery.isLoading || hallsQuery.isLoading;
    const error = localError || 
                  (eventsQuery.error instanceof Error ? eventsQuery.error.message : '') ||
                  (venuesQuery.error instanceof Error ? venuesQuery.error.message : '') ||
                  (buildingsQuery.error instanceof Error ? buildingsQuery.error.message : '') ||
                  (hallsQuery.error instanceof Error ? hallsQuery.error.message : '') ||
                  (saveHallMutation.error instanceof Error ? saveHallMutation.error.message : '') ||
                  (hallStatusMutation.error instanceof Error ? hallStatusMutation.error.message : '');

    return {
        viewMode, setViewMode,
        events: eventsQuery.data || [],
        venues: venuesQuery.data || [],
        buildings: buildingsQuery.data || [],
        halls: hallsQuery.data || [],
        filteredEvents, filteredVenues, filteredBuildings, filteredHalls,
        selectedEvent, selectedVenue, selectedBuilding,
        loading, error, setError: setLocalError, success, setSuccess, filterQuery, setFilterQuery,
        showModal, setShowModal, editingHall, setEditingHall, saving: saveHallMutation.isPending,
        handleSelectEvent, handleSelectVenue, handleSelectBuilding,
        goBack, resetToEvents, handleSave, handleArchive, handlePublish
    };
}
