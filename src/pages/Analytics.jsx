import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getAnalytics } from '../services/api';
import { TrendingUp, FileText, DollarSign, Users } from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
};

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAnalytics()
            .then(res => setData(res.data))
            .catch(() => setError('Failed to load analytics data.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>
    );

    if (!data || data.totalInvoices === 0) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400 dark:text-gray-500">
            <TrendingUp className="w-12 h-12 opacity-30" />
            <p className="text-lg font-medium">No invoice data yet</p>
            <p className="text-sm">Create some invoices to see analytics here.</p>
        </div>
    );

    // Line chart — Revenue over time
    const lineData = {
        labels: data.revenueOverTime.labels,
        datasets: [{
            label: 'Revenue (USD)',
            data: data.revenueOverTime.data,
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#6366F1',
            pointRadius: 4,
            tension: 0.4,
            fill: true
        }]
    };

    // Doughnut chart — Status breakdown
    const { paid, pending, overdue } = data.statusBreakdown;
    const doughnutData = {
        labels: ['Paid', 'Pending', 'Overdue'],
        datasets: [{
            data: [paid, pending, overdue],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            borderColor: ['#059669', '#D97706', '#DC2626'],
            borderWidth: 1.5,
            hoverOffset: 6
        }]
    };

    // Bar chart — Top 5 clients
    const barData = {
        labels: data.top5Clients.map(c => c.name),
        datasets: [{
            label: 'Revenue (USD)',
            data: data.top5Clients.map(c => c.revenue),
            backgroundColor: [
                'rgba(99,102,241,0.85)',
                'rgba(139,92,246,0.85)',
                'rgba(59,130,246,0.85)',
                'rgba(16,185,129,0.85)',
                'rgba(245,158,11,0.85)'
            ],
            borderRadius: 8,
            borderSkipped: false
        }]
    };

    const lineOptions = {
        ...chartDefaults,
        plugins: {
            ...chartDefaults.plugins,
            tooltip: {
                callbacks: {
                    label: ctx => ` $${ctx.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
            y: {
                grid: { color: 'rgba(156,163,175,0.1)' },
                ticks: { color: '#9CA3AF', callback: v => `$${v.toLocaleString()}` }
            }
        }
    };

    const barOptions = {
        ...chartDefaults,
        plugins: {
            ...chartDefaults.plugins,
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString()}` } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
            y: {
                grid: { color: 'rgba(156,163,175,0.1)' },
                ticks: { color: '#9CA3AF', callback: v => `$${v.toLocaleString()}` }
            }
        }
    };

    const doughnutOptions = {
        ...chartDefaults,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#6B7280', padding: 16, usePointStyle: true }
            }
        },
        cutout: '68%'
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revenue insights and invoice performance</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`$${data.totalRevenue.toLocaleString()}`}
                    sub="All time"
                    color="bg-indigo-500"
                />
                <StatCard
                    icon={FileText}
                    label="Total Invoices"
                    value={data.totalInvoices}
                    sub={`${data.statusBreakdown.paid} paid`}
                    color="bg-violet-500"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Invoice Value"
                    value={`$${data.avgInvoiceValue.toLocaleString()}`}
                    sub="Per invoice"
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Users}
                    label="Top Client"
                    value={data.top5Clients[0]?.name || '—'}
                    sub={data.top5Clients[0] ? `$${data.top5Clients[0].revenue.toLocaleString()}` : ''}
                    color="bg-emerald-500"
                />
            </div>

            {/* Charts Row 1 — Line chart full width */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Revenue Over Time</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Monthly revenue in USD</p>
                <div className="h-64">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>

            {/* Charts Row 2 — Bar + Doughnut side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bar chart — 3/5 width */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Top 5 Clients by Revenue</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Total invoiced amount per client</p>
                    <div className="h-64">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* Doughnut chart — 2/5 width */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Payment Status</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Breakdown of invoice statuses</p>
                    <div className="h-64">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    {/* Status summary pills */}
                    <div className="flex justify-center gap-4 mt-4">
                        {[
                            { label: 'Paid', count: paid, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                            { label: 'Pending', count: pending, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                            { label: 'Overdue', count: overdue, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
                        ].map(({ label, count, color }) => (
                            <span key={label} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                                {label}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
