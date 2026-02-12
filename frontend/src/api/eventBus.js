import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const eventBusClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to all requests
eventBusClient.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = { ...config.headers, ...authHeaders };
    return config;
});

export const getEvents = async (limit = 50) => {
    const response = await eventBusClient.get(`/api/events?limit=${limit}`);
    return response.data;
};

export const getEventDetails = async (eventId) => {
    const response = await eventBusClient.get(`/api/events/${eventId}`);
    return response.data;
};

export const replayEvent = async (eventId) => {
    const response = await eventBusClient.post(`/api/events/${eventId}/replay`);
    return response.data;
};

export const getEventMetrics = async () => {
    const response = await eventBusClient.get('/api/events/metrics');
    return response.data;
};
