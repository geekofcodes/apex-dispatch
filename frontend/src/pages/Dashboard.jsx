import { useState, useEffect } from 'react';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import { getOrders } from '../api/client';
import { getEventMetrics } from '../api/eventBus';
import { getUserFromToken } from '../utils/auth';

export default function Dashboard({ onNavigate }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [metricsError, setMetricsError] = useState('');

    const user = getUserFromToken();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchOrders();
        if (isAdmin) {
            fetchMetrics();
        }
    }, [isAdmin]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrders();
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            setMetricsLoading(true);
            setMetricsError('');
            const data = await getEventMetrics();
            setMetrics(data);
        } catch (err) {
            console.error('Failed to fetch metrics:', err);
            setMetricsError('Failed to load metrics');
        } finally {
            setMetricsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome to ApexDispatch</h1>
                <p className="text-gray-600 mt-2">Manage your orders and track deliveries in real-time</p>
            </div>

            {/* Admin Metrics */}
            {isAdmin && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Metrics</h2>
                    {metricsError ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {metricsError}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Total Events"
                                value={metrics?.totalEvents || 0}
                                loading={metricsLoading}
                                color="indigo"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                            />
                            <MetricCard
                                title="Failed Deliveries"
                                value={metrics?.failedEvents || 0}
                                loading={metricsLoading}
                                color="red"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                            <MetricCard
                                title="DLQ Count"
                                value={metrics?.dlqCount || 0}
                                loading={metricsLoading}
                                color="yellow"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                }
                            />
                            <MetricCard
                                title="Avg Attempts"
                                value={metrics?.avgAttempts || 0}
                                loading={metricsLoading}
                                color="blue"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                }
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Total Orders">
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-12 bg-slate-200 rounded w-24"></div>
                        </div>
                    ) : (
                        <div className="text-4xl font-bold text-indigo-600">{orders.length}</div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Orders in system</p>
                </Card>

                <Card title="Quick Actions">
                    <div className="space-y-3">
                        <button
                            onClick={() => onNavigate('create')}
                            className="w-full text-left px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                            <div className="font-medium">Create New Order</div>
                            <div className="text-sm text-indigo-600">Start a new delivery</div>
                        </button>
                        <button
                            onClick={() => onNavigate('orders')}
                            className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <div className="font-medium">View All Orders</div>
                            <div className="text-sm text-gray-600">Browse order history</div>
                        </button>
                    </div>
                </Card>

                <Card title="System Status">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">API Gateway</span>
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">Online</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Order Service</span>
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">Online</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Tracking Service</span>
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">Online</span>
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="About">
                <p className="text-gray-600 text-sm leading-relaxed">
                    ApexDispatch is a modern order management and courier dispatch system built with microservices architecture.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">Version 1.0.0</div>
                </div>
            </Card>
        </div>
    );
}
