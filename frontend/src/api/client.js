import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = { ...config.headers, ...authHeaders };
    return config;
});

export const createOrder = async (item) => {
    const response = await apiClient.post('/api/orders', { item });
    return response.data;
};

export const getOrders = async () => {
    const response = await apiClient.get('/api/orders');
    return response.data;
};

export const getTracking = async (orderId) => {
    const response = await apiClient.get(`/api/tracking/${orderId}`);
    return response.data;
};
