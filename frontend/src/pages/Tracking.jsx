import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getTracking } from '../api/client';

export default function Tracking({ orderId, onNavigate }) {
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (orderId) {
            fetchTracking();
        }
    }, [orderId]);

    const fetchTracking = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTracking(orderId);
            setTracking(data);
        } catch (err) {
            setError('Failed to load tracking information');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const SkeletonTimeline = () => (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-400">Current Status:</span>
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            </div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                            {i < 2 && <div className="w-0.5 h-12 bg-slate-200"></div>}
                        </div>
                        <div className="flex-1 pb-8">
                            <div className="h-6 bg-slate-200 rounded-full w-20 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!orderId) {
        return (
            <div className="max-w-2xl">
                <Card>
                    <div className="text-center py-12">
                        <p className="text-gray-600">No order selected</p>
                        <Button onClick={() => onNavigate('orders')} className="mt-4">
                            View Orders
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
                    <p className="text-gray-600 mt-2 font-mono text-sm">{orderId}</p>
                </div>
                <Button variant="secondary" onClick={() => onNavigate('orders')}>
                    Back to Orders
                </Button>
            </div>

            <Card>
                {loading && <SkeletonTimeline />}

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                        <Button onClick={fetchTracking} variant="secondary" className="mt-4">
                            Retry
                        </Button>
                    </div>
                )}

                {!loading && !error && !tracking && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📍</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tracking data available</h3>
                        <p className="text-gray-600 mb-6">No tracking data available for this order.</p>
                        <Button onClick={() => onNavigate('orders')}>
                            Back to Orders
                        </Button>
                    </div>
                )}

                {!loading && !error && tracking && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <span className="text-gray-600">Current Status:</span>
                            <Badge status={tracking.status} />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
                            <div className="space-y-4">
                                {tracking.history && tracking.history.map((status, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full ${index === tracking.history.length - 1
                                                ? 'bg-indigo-600'
                                                : 'bg-gray-300'
                                                }`}></div>
                                            {index < tracking.history.length - 1 && (
                                                <div className="w-0.5 h-12 bg-gray-300"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <div className="flex items-center gap-3">
                                                <Badge status={status} />
                                                {index === tracking.history.length - 1 && (
                                                    <span className="text-xs text-indigo-600 font-medium">Current</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Status updated to {status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
