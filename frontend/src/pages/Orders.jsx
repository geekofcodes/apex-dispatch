import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { getOrders } from '../api/client';

export default function Orders({ onNavigate }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrders();
            setOrders(data);
        } catch (err) {
            setError('Failed to load orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTracking = (orderId) => {
        onNavigate('tracking', { orderId });
    };

    const SkeletonRow = () => (
        <Table.Row>
            <Table.Cell>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </Table.Cell>
            <Table.Cell>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </Table.Cell>
            <Table.Cell>
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            </Table.Cell>
            <Table.Cell>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            </Table.Cell>
            <Table.Cell>
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            </Table.Cell>
            <Table.Cell>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </Table.Cell>
        </Table.Row>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-2">View and manage all orders</p>
                </div>
                <Button onClick={() => onNavigate('create')}>
                    Create New Order
                </Button>
            </div>

            <Card noHover>
                {loading && (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Order ID</Table.HeaderCell>
                                <Table.HeaderCell>Item</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Courier</Table.HeaderCell>
                                <Table.HeaderCell>Created</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}
                        </tbody>
                    </Table>
                )}

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                        <Button onClick={fetchOrders} variant="secondary" className="mt-4">
                            Retry
                        </Button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📦</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Create your first order to get started.</p>
                        <Button onClick={() => onNavigate('create')}>
                            Create Order
                        </Button>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Order ID</Table.HeaderCell>
                                <Table.HeaderCell>Item</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Courier</Table.HeaderCell>
                                <Table.HeaderCell>Created</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <tbody>
                            {orders.map((order) => (
                                <Table.Row key={order.orderId}>
                                    <Table.Cell>
                                        <span className="font-mono text-xs">{order.orderId.slice(0, 8)}...</span>
                                    </Table.Cell>
                                    <Table.Cell>{order.item}</Table.Cell>
                                    <Table.Cell>
                                        <Badge status={order.status} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="font-mono text-xs">{order.courierId}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button
                                            onClick={() => handleViewTracking(order.orderId)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                                        >
                                            View Tracking
                                        </button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
