import { useParams, Link } from 'react-router-dom';
import {
    Plus,
    ArrowLeft,
    Download,
    AlertCircle,
    TrendingUp,
    X,
    CheckCircle2
} from 'lucide-react';

import { LoadingState } from '@/shared/components/LoadingState';
import { StallFilters } from '../components/StallInventory/StallFilters';
import { StallTable } from '../components/StallInventory/StallTable';
import { BulkGenerateModal } from '../components/StallInventory/BulkGenerateModal';
import { BulkPriceModal } from '../components/StallInventory/BulkPriceModal';
import { StallEditModal } from '../components/StallInventory/StallEditModal';
import { useStallInventory } from '../hooks/useStallInventory';

const STALL_SIZES = ['SMALL', 'MEDIUM', 'LARGE'];
const STALL_CATEGORIES = ['RETAIL', 'FOOD', 'SPONSOR', 'ANCHOR'];
const STATUS_FILTERS = ['ALL', 'AVAILABLE', 'BLOCKED'];

export default function StallInventory() {
    const { id: hallId } = useParams<{ id: string }>();
    const {
        stalls, hall, loading, error, success, setSuccess,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        sizeFilter, setSizeFilter,
        showBulkModal, setShowBulkModal,
        showPriceModal, setShowPriceModal,
        bulkPercentage, setBulkPercentage,
        bulkForm, setBulkForm,
        generating, adjusting,
        showEditModal, setShowEditModal,
        editingStall,
        editForm, setEditForm,
        savingEdit,
        filteredStalls,
        handleBulkGenerate,
        handleBulkPriceAdjust,
        handleOpenEdit,
        handleSaveEdit,
        handleToggleBlock,
        handleExportCsv
    } = useStallInventory(hallId);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'FOOD': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'SPONSOR': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'ANCHOR': return 'text-purple-600 bg-purple-50 border-purple-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    if (loading) return <LoadingState message="Loading Inventory..." fullPage />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Link to="/admin/halls" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase hover:text-gray-700 transition-colors mb-3">
                        <ArrowLeft size={12} /> Back to Halls
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {hall?.name || 'Hall'} <span className="text-gray-400">— Stall Inventory</span>
                    </h1>
                    <p className="text-gray-500 font-semibold uppercase text-[10px] mt-2">
                        {stalls.length} Stalls Total
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold text-[10px] uppercase hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                    <button
                        onClick={() => setShowPriceModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-indigo-600 font-bold text-[10px] uppercase hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        <TrendingUp size={14} /> Bulk Price %
                    </button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <Plus size={14} /> Bulk Generate
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={14} /> {success}
                    <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: stalls.length, color: 'text-gray-900' },
                    { label: 'Available', value: stalls.filter(s => s.isAvailable).length, color: 'text-green-600' },
                    { label: 'Blocked', value: stalls.filter(s => !s.isAvailable).length, color: 'text-rose-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <StallFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                sizeFilter={sizeFilter}
                onSizeChange={setSizeFilter}
                statusOptions={STATUS_FILTERS}
                sizeOptions={STALL_SIZES}
            />

            <StallTable
                stalls={filteredStalls}
                onEdit={handleOpenEdit}
                onToggleBlock={handleToggleBlock}
                getCategoryColor={getCategoryColor}
            />

            <BulkGenerateModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                bulkForm={bulkForm}
                onFormChange={setBulkForm}
                onConfirm={handleBulkGenerate}
                isLoading={generating}
                sizeOptions={STALL_SIZES}
                categoryOptions={STALL_CATEGORIES}
            />

            <BulkPriceModal
                isOpen={showPriceModal}
                onClose={() => setShowPriceModal(false)}
                percentage={bulkPercentage}
                onPercentageChange={setBulkPercentage}
                onConfirm={handleBulkPriceAdjust}
                isLoading={adjusting}
            />

            <StallEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                stall={editingStall}
                form={editForm}
                onFormChange={setEditForm}
                onSave={handleSaveEdit}
                isLoading={savingEdit}
                sizeOptions={STALL_SIZES}
                categoryOptions={STALL_CATEGORIES}
            />
        </div>
    );
}
