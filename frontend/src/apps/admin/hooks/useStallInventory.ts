import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { StallTemplate, StallSize, StallCategory } from '@/shared/types/api';

export function useStallInventory(hallId: string | undefined) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sizeFilter, setSizeFilter] = useState('ALL');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [bulkPercentage, setBulkPercentage] = useState('');
    const [bulkForm, setBulkForm] = useState<{
        count: string;
        size: StallSize;
        category: StallCategory;
        basePriceCents: string;
    }>({
        count: '10',
        size: 'MEDIUM',
        category: 'RETAIL',
        basePriceCents: '100000'
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStall, setEditingStall] = useState<StallTemplate | null>(null);
    const [editForm, setEditForm] = useState<Partial<StallTemplate>>({});
    const [success, setSuccess] = useState('');
    const [localError, setLocalError] = useState('');

    // --- QUERIES ---

    const hallsQuery = useQuery({
        queryKey: ['admin-halls'],
        queryFn: adminApi.getAllHalls,
        enabled: !!hallId,
    });

    const stallsQuery = useQuery({
        queryKey: ['admin-stalls', hallId],
        queryFn: () => adminApi.getStallsByHall(Number(hallId)),
        enabled: !!hallId,
    });

    // --- MUTATIONS ---

    const bulkGenerateMutation = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (payload: Record<string, unknown>) => adminApi.bulkGenerateStalls(Number(hallId), payload as any),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-stalls', hallId] });
            setSuccess(`Generated ${variables.count} stalls successfully!`);
            setShowBulkModal(false);
        }
    });

    const priceAdjustMutation = useMutation({
        mutationFn: (pct: number) => adminApi.bulkPriceAdjust(Number(hallId), pct),
        onSuccess: (pct) => {
            queryClient.invalidateQueries({ queryKey: ['admin-stalls', hallId] });
            setSuccess(`All stall prices adjusted by ${pct}%.`);
            setShowPriceModal(false);
            setBulkPercentage('');
        }
    });

    const updateStallMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<StallTemplate> }) => 
            adminApi.updateStallTemplate(Number(hallId), id, data),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['admin-stalls', hallId] });
            setSuccess(`Stall ${updated.name} updated successfully.`);
            setShowEditModal(false);
        }
    });

    const toggleBlockMutation = useMutation({
        mutationFn: (stall: StallTemplate) => 
            adminApi.setStallBlocked(Number(hallId), stall.id, stall.isAvailable),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stalls', hallId] });
        }
    });

    // --- HANDLERS ---

    const handleBulkGenerate = () => {
        if (!bulkForm.count || !bulkForm.basePriceCents) { setLocalError('Count and price are required.'); return; }
        bulkGenerateMutation.mutate({
            count: parseInt(bulkForm.count),
            size: bulkForm.size,
            category: bulkForm.category,
            basePriceCents: parseInt(bulkForm.basePriceCents),
        });
    };

    const handleBulkPriceAdjust = () => {
        const pct = parseFloat(bulkPercentage);
        if (isNaN(pct)) { setLocalError('Enter a valid percentage.'); return; }
        priceAdjustMutation.mutate(pct);
    };

    const handleOpenEdit = (stall: StallTemplate) => {
        setEditingStall(stall);
        setEditForm({
            name: stall.name,
            category: stall.category,
            size: stall.size,
            sqFt: stall.sqFt,
            basePriceCents: stall.basePriceCents,
            imageUrl: stall.imageUrl || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!editingStall) return;
        updateStallMutation.mutate({ id: editingStall.id, data: editForm });
    };

    const handleToggleBlock = (stall: StallTemplate) => {
        toggleBlockMutation.mutate(stall);
    };

    const handleExportCsv = async () => {
        try {
            await adminApi.exportStallsCsv(Number(hallId));
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = err instanceof Error ? (err as any).response?.data?.message : 'Failed to export CSV.';
            setLocalError(message || 'Failed to export CSV.');
        }
    };

    // --- DERIVED STATE ---

    const hall = useMemo(() => hallsQuery.data?.find(h => h.id === Number(hallId)) || null, [hallsQuery.data, hallId]);
    const stalls = useMemo(() => stallsQuery.data || [], [stallsQuery.data]);

    const filteredStalls = useMemo(() => {
        return stalls.filter(s => {
            const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL'
                || (statusFilter === 'AVAILABLE' && s.isAvailable)
                || (statusFilter === 'BLOCKED' && !s.isAvailable);
            const matchesSize = sizeFilter === 'ALL' || s.size === sizeFilter;
            return matchesSearch && matchesStatus && matchesSize;
        });
    }, [stalls, searchTerm, statusFilter, sizeFilter]);

    const error = localError || 
                  (hallsQuery.error instanceof Error ? hallsQuery.error.message : '') ||
                  (stallsQuery.error instanceof Error ? stallsQuery.error.message : '') ||
                  (bulkGenerateMutation.error instanceof Error ? bulkGenerateMutation.error.message : '') ||
                  (priceAdjustMutation.error instanceof Error ? priceAdjustMutation.error.message : '') ||
                  (updateStallMutation.error instanceof Error ? updateStallMutation.error.message : '') ||
                  (toggleBlockMutation.error instanceof Error ? toggleBlockMutation.error.message : '');

    const loading = hallsQuery.isLoading || stallsQuery.isLoading;

    return {
        stalls, hall, loading, error, setError: setLocalError, success, setSuccess,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        sizeFilter, setSizeFilter,
        showBulkModal, setShowBulkModal,
        showPriceModal, setShowPriceModal,
        bulkPercentage, setBulkPercentage,
        bulkForm, setBulkForm,
        generating: bulkGenerateMutation.isPending,
        adjusting: priceAdjustMutation.isPending,
        showEditModal, setShowEditModal,
        editingStall, setEditingStall,
        editForm, setEditForm,
        savingEdit: updateStallMutation.isPending,
        filteredStalls,
        handleBulkGenerate,
        handleBulkPriceAdjust,
        handleOpenEdit,
        handleSaveEdit,
        handleToggleBlock,
        handleExportCsv
    };
}
