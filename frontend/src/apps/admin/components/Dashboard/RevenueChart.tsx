import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/shared/utils/format';
import { TrendingUp, BarChart3 } from 'lucide-react';

// Generates 30 days of realistic-looking mock timeseries data
const generateMockData = () => {
  const data = [];
  let baseValue = 50000;
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    // Add some random noise and an upward trend
    const noise = (Math.random() - 0.4) * 20000;
    baseValue = Math.max(10000, baseValue + noise + 2000); // Trend upwards slightly
    
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(baseValue),
      bookings: Math.floor(baseValue / 5000) + Math.floor(Math.random() * 5)
    });
  }
  return data;
};

export const RevenueChart = () => {
  const data = useMemo(() => generateMockData(), []);

  // Compute total for the header
  const total30Days = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Revenue & Volume (30 Days)
            </h2>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(total30Days)}
            </h3>
            <span className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +14.2%
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{totalBookings} total stalls reserved</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-slate-200, #e2e8f0)" opacity={0.5} className="dark:opacity-10" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                color: '#fff',
              }}
              itemStyle={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}
              labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
              formatter={(value: number, name: string) => [
                name === 'revenue' ? formatCurrency(value) : value, 
                name === 'revenue' ? 'Revenue' : 'Bookings'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
