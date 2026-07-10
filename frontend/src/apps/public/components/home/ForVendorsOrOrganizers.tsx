import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { Pill } from '@/shared/components/ui/Pill';
import { Button } from '@/shared/components/ui/Button';

export function ForVendorsOrOrganizers() {
  return (
    <section className="py-20 max-w-5xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 border border-neutral-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
          <Pill variant="brand">For Vendors</Pill>
          <h3 className="mt-5 text-2xl font-bold text-neutral-900 dark:text-white">Find your next event</h3>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Browse live fairs, reserve your stall on a real-time floor plan,
            and manage every booking from one dashboard.
          </p>
          <div className="mt-8">
            <Link to="/events">
              <Button variant="secondary" className="w-full sm:w-auto dark:bg-slate-800 dark:text-white dark:border-slate-700">Browse Events</Button>
            </Link>
          </div>
        </Card>
        
        <Card className="p-8 border border-neutral-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
          <Pill variant="neutral">For Organizers</Pill>
          <h3 className="mt-5 text-2xl font-bold text-neutral-900 dark:text-white">Run your event without the spreadsheet</h3>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            List your venue, manage stall inventory in real time, and let
            vendors book themselves in — no manual allocation.
          </p>
          <div className="mt-8">
            <a href="mailto:paulaabdul1209@gmail.com">
              <Button variant="secondary" className="w-full sm:w-auto dark:bg-slate-800 dark:text-white dark:border-slate-700">Contact Us to Host</Button>
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
}
