import { Layout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

export const ReservationEmptyState = () => {
    const navigate = useNavigate();

    return (
        <Card className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <Layout size={20} className="text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">No reservations yet</h3>
            <p className="mt-1 text-sm text-neutral-500 max-w-sm">
                Secure your spot at the next event and start reaching more readers.
            </p>
            <Button 
                variant="primary" 
                className="mt-5" 
                onClick={() => navigate('/events')} 
                icon={<ArrowRight size={16} />}
            >
                Start Booking
            </Button>
        </Card>
    );
};
