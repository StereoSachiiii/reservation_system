import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface DashboardHeaderProps {
    businessName?: string;
    username: string;
    canBook: boolean;
    onBookClick: () => void;
}

export const DashboardHeader = ({ businessName, username, canBook, onBookClick }: DashboardHeaderProps) => {
    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                    Command Center
                </p>
                <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-sm text-neutral-500">
                    Welcome back, <span className="font-medium text-neutral-700">{businessName || username}</span>
                </p>
            </div>

            <div className="tour-book-button">
                <Button 
                    variant="primary" 
                    onClick={onBookClick} 
                    disabled={!canBook}
                    icon={canBook ? <Plus size={16} /> : undefined}
                >
                    {canBook ? 'Book New Stall' : 'Limit Reached'}
                </Button>
            </div>
        </header>
    );
};
