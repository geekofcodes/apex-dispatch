import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const API_URL = `${API_BASE_URL}/api`;

// Get token from storage
export function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Save token to storage
export function saveToken(token, rememberMe) {
    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
}

// Remove token from storage
export function removeToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
}

// Get user from token (decode JWT payload)
export function getUserFromToken() {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.email,
            role: payload.role,
            userId: payload.userId
        };
    } catch (error) {
        return null;
    }
}

// Login
export async function login(email, password, rememberMe) {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        rememberMe
    });

    const { token, user } = response.data;
    saveToken(token, rememberMe);
    return user;
}

// Logout
export function logout() {
    removeToken();
}

// Check if user is authenticated
export function isAuthenticated() {
    return !!getToken();
}

// Get auth headers for API calls
export function getAuthHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
