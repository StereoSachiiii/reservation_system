import React from 'react';
import { Card } from '@/shared/components/ui/Card';

interface StatCardProps {
    label: string;
    value: number;
    suffix: string;
    icon: React.ReactNode;
    accent?: 'neutral' | 'brand' | 'success';
}

export function StatCard({ label, value, suffix, icon, accent = 'neutral' }: StatCardProps) {
    const accentStyles = {
        neutral: 'bg-neutral-100 text-neutral-600',
        brand: 'bg-brand-50 text-brand-600',
        success: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <Card className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    {label}
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900">
                    {value}
                    <span className="ml-1 text-sm font-normal text-neutral-400">{suffix}</span>
                </p>
            </div>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accentStyles[accent]}`}>
                {icon}
            </div>
        </Card>
    );
}
