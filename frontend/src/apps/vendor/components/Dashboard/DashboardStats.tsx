import { Layout, Calendar, CheckCircle2 } from 'lucide-react';
import { StatCard } from './StatCard';

interface DashboardStatsProps {
    limit: number;
    used: number;
    remaining: number;
}

export const DashboardStats = ({ limit, used, remaining }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tour-stats">
            <StatCard 
                label="Stall Limit" 
                value={limit} 
                suffix="Per Event" 
                icon={<Layout size={20} />} 
                accent="neutral" 
            />
            <StatCard 
                label="Active Bookings" 
                value={used} 
                suffix="Allocated" 
                icon={<Calendar size={20} />} 
                accent="brand" 
            />
            <StatCard 
                label="Remaining Slots" 
                value={remaining} 
                suffix="Available" 
                icon={<CheckCircle2 size={20} />} 
                accent={remaining === 0 ? "neutral" : "success"} 
            />
        </div>
    );
};
