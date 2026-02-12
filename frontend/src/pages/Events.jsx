import { useState, useEffect, useMemo } from 'react';
import { getEvents } from '../api/eventBus';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Select from '../components/Select';

export default function Events({ onNavigate }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getEvents(100);
            setEvents(data.events || []);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get unique event types for filter dropdown
    const eventTypes = useMemo(() => {
        const types = [...new Set(events.map(e => e.type))];
        return types.sort();
    }, [events]);

    // Apply filters
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Status filter
            if (statusFilter !== 'ALL' && event.status !== statusFilter) {
                return false;
            }

            // Type filter
            if (typeFilter !== 'ALL' && event.type !== typeFilter) {
                return false;
            }

            // Search filter (Event ID partial match)
            if (searchQuery && !event.eventId.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [events, statusFilter, typeFilter, searchQuery]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const shortenEventId = (eventId) => {
        return eventId.substring(0, 8);
    };

    const handleViewEvent = (eventId) => {
        onNavigate('event-details', { eventId });
    };

    const handleResetFilters = () => {
        setStatusFilter('ALL');
        setTypeFilter('ALL');
        setSearchQuery('');
    };

    const hasActiveFilters = statusFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery !== '';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Log</h1>
                    <p className="text-sm text-gray-600 mt-1">Monitor and manage event deliveries</p>
                </div>
                <button
                    onClick={fetchEvents}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Status Filter */}
                    <div className="flex-1">
                        <Select
                            id="status-filter"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                { value: 'DELIVERED', label: 'Delivered' },
                                { value: 'PARTIALLY_DELIVERED', label: 'Partially Delivered' },
                                { value: 'FAILED', label: 'Failed' },
                                { value: 'RECEIVED', label: 'Received' }
                            ]}
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex-1">
                        <Select
                            id="type-filter"
                            label="Event Type"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { value: 'ALL', label: 'All Types' },
                                ...eventTypes.map(type => ({ value: type, label: type }))
                            ]}
                        />
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search Event ID
                        </label>
                        <input
                            id="search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Event ID..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                        />
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <div className="flex items-end">
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                            >
                                Reset
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Summary */}
                {hasActiveFilters && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span> of <span className="font-semibold text-gray-900">{events.length}</span> events
                        </p>
                    </div>
                )}
            </div>

            {/* Events Table */}
            <Card noHover>
                {loading && events.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-gray-500 mt-4">Loading events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {hasActiveFilters ? 'No events match your filters' : 'No events found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {hasActiveFilters ? 'Try adjusting your filters or search query.' : 'Events will appear here once they are created.'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={handleResetFilters}
                                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Event ID</Table.HeaderCell>
                                <Table.HeaderCell>Type</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Created At</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filteredEvents.map((event) => (
                                <Table.Row key={event.eventId}>
                                    <Table.Cell>
                                        <span className="font-mono text-sm text-gray-600">
                                            {shortenEventId(event.eventId)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="font-medium text-gray-900">{event.type}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge status={event.status} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(event.createdAt)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button
                                            onClick={() => handleViewEvent(event.eventId)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                                        >
                                            View
                                        </button>
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
