import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { createOrder } from '../api/client';

export default function CreateOrder({ onNavigate }) {
    const [item, setItem] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!item.trim()) return;

        try {
            setLoading(true);
            setError(null);
            const data = await createOrder(item);
            setResult(data);
            setItem('');
        } catch (err) {
            setError('Failed to create order. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnother = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
                <p className="text-gray-600 mt-2">Enter item details to create a new delivery order</p>
            </div>

            <Card>
                {!result ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-2">
                                Item Description
                            </label>
                            <input
                                type="text"
                                id="item"
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                placeholder="e.g., Electronics Package, Documents, Food Delivery"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button type="submit" disabled={loading || !item.trim()}>
                                {loading ? 'Creating Order...' : 'Create Order'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => onNavigate('orders')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✓</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Order Created Successfully!</h3>
                            <p className="text-gray-600 mt-2">Your order has been created and assigned to a courier</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-mono text-sm font-medium">{result.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Item:</span>
                                <span className="font-medium">{result.item}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Status:</span>
                                <Badge status={result.status} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Courier ID:</span>
                                <span className="font-mono text-sm">{result.courierId}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => onNavigate('tracking', { orderId: result.orderId })}>
                                View Tracking
                            </Button>
                            <Button variant="secondary" onClick={handleCreateAnother}>
                                Create Another Order
                            </Button>
                            <Button variant="secondary" onClick={() => onNavigate('orders')}>
                                View All Orders
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
