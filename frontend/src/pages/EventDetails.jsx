import { useState, useEffect } from 'react';
import { getEventDetails, replayEvent } from '../api/eventBus';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function EventDetails({ eventId, onNavigate }) {
    const [event, setEvent] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [replayLoading, setReplayLoading] = useState(false);
    const [replayMessage, setReplayMessage] = useState('');

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getEventDetails(eventId);
            setEvent(data.event);
            setDeliveries(data.deliveries || []);
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Failed to load event details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReplay = async () => {
        try {
            setReplayLoading(true);
            setReplayMessage('');
            await replayEvent(eventId);
            setReplayMessage('Replay initiated successfully! Refreshing event details...');

            // Wait a bit then refresh
            setTimeout(() => {
                fetchEventDetails();
                setReplayMessage('');
            }, 2000);
        } catch (err) {
            console.error('Error replaying event:', err);
            setReplayMessage('Failed to replay event. Please try again.');
        } finally {
            setReplayLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const hasFailedDeliveries = deliveries.some(d => d.status === 'FAILED');

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-500 mt-4">Loading event details...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => onNavigate('events')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Events
                </button>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error || 'Event not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate('events')}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Events
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
                        <p className="text-sm text-gray-600 mt-1">Event ID: <span className="font-mono">{eventId}</span></p>
                    </div>
                </div>
                {hasFailedDeliveries && (
                    <Button
                        onClick={handleReplay}
                        disabled={replayLoading}
                    >
                        {replayLoading ? 'Replaying...' : 'Replay Failed Deliveries'}
                    </Button>
                )}
            </div>

            {/* Replay Message */}
            {replayMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm ${replayMessage.includes('Failed') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                    {replayMessage}
                </div>
            )}

            {/* Event Metadata */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="text-base font-medium text-gray-900 mt-1">{event.type}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">
                            <StatusBadge status={event.status} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-base font-medium text-gray-900 mt-1">{formatDate(event.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-base font-medium text-gray-900 mt-1">{formatDate(event.updatedAt)}</p>
                    </div>
                </div>
            </Card>

            {/* Event Payload */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Payload</h2>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-gray-800">{JSON.stringify(event.payload, null, 2)}</code>
                </pre>
            </Card>

            {/* Deliveries Table */}
            <Card noHover>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Deliveries</h2>
                {deliveries.length === 0 ? (
                    <p className="text-sm text-gray-500">No deliveries found for this event.</p>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Target Service</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Attempts</Table.HeaderCell>
                                <Table.HeaderCell>Last Error</Table.HeaderCell>
                                <Table.HeaderCell>Updated At</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {deliveries.map((delivery, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell>
                                        <span className="font-medium text-gray-900">{delivery.targetService}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge status={delivery.status} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-sm text-gray-600">{delivery.attempts}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {delivery.lastError ? (
                                            <span className="text-sm text-red-600 font-mono">{delivery.lastError}</span>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-sm text-gray-600">{formatDate(delivery.updatedAt)}</span>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </Card>
        </div>
    );
}
