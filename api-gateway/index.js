import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'apex-dispatch-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// JWT Verification Middleware
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Role-Based Access Control Middleware
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

// Health endpoint (no auth required)
app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is running' });
});

// Auth endpoints (no auth required for login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post('http://auth-service:4000/auth/login', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { error: 'Login failed' }
        );
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const response = await axios.post('http://auth-service:4000/auth/verify', null, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 401).json(
            error.response?.data || { error: 'Token verification failed' }
        );
    }
});

// Create order - admin and operator only
app.post('/api/orders', verifyJWT, requireRole('admin', 'operator'), async (req, res) => {
    try {
        console.log(`[API GATEWAY] User ${req.user.email} (${req.user.role}) creating order`);
        const response = await axios.post('http://order-service:5000/orders', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('[API GATEWAY] Error forwarding to Order Service:', error.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get all orders - all authenticated users
app.get('/api/orders', verifyJWT, requireRole('admin', 'operator', 'viewer'), async (req, res) => {
    try {
        console.log(`[API GATEWAY] User ${req.user.email} (${req.user.role}) fetching orders`);
        const response = await axios.get('http://order-service:5000/orders');
        res.json(response.data);
    } catch (error) {
        console.error('[API GATEWAY] Error fetching orders:', error.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get tracking - all authenticated users
app.get('/api/tracking/:orderId', verifyJWT, requireRole('admin', 'operator', 'viewer'), async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log(`[API GATEWAY] User ${req.user.email} (${req.user.role}) fetching tracking for ${orderId}`);
        const response = await axios.get(`http://tracking-service:8000/tracking/${orderId}`);
        res.json(response.data);
    } catch (error) {
        console.error('[API GATEWAY] Error fetching tracking:', error.message);
        res.status(error.response?.status === 404 ? 404 : 500).json({
            error: error.response?.data?.error || 'Failed to fetch tracking'
        });
    }
});

// Event Bus endpoints - admin only
app.get('/api/events', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const limit = req.query.limit || 50;
        console.log(`[API GATEWAY] Admin ${req.user.email} fetching events`);
        const response = await axios.get(`http://event-bus:10000/events?limit=${limit}`);
        res.json(response.data);
    } catch (error) {
        console.error('[API GATEWAY] Error fetching events:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Failed to fetch events'
        });
    }
});

// Event Bus metrics endpoint - admin only (MUST come before /:eventId route)
app.get('/api/events/metrics', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        console.log(`[API GATEWAY] Admin ${req.user.email} fetching event metrics`);

        // Fetch all events
        const eventsResponse = await axios.get('http://event-bus:10000/events?limit=1000');
        const events = eventsResponse.data.events || [];

        // Calculate metrics
        const totalEvents = events.length;
        let failedEvents = 0;
        let totalAttempts = 0;
        let totalDeliveries = 0;

        // For each event, fetch details to get delivery info
        for (const event of events) {
            try {
                const detailsResponse = await axios.get(`http://event-bus:10000/events/${event.eventId}`);
                const deliveries = detailsResponse.data.deliveries || [];

                // Check if any delivery failed
                const hasFailed = deliveries.some(d => d.status === 'FAILED');
                if (hasFailed) {
                    failedEvents++;
                }

                // Sum up attempts
                deliveries.forEach(d => {
                    totalAttempts += d.attempts || 0;
                    totalDeliveries++;
                });
            } catch (err) {
                console.error(`[API GATEWAY] Error fetching details for event ${event.eventId}:`, err.message);
            }
        }

        const avgAttempts = totalDeliveries > 0 ? (totalAttempts / totalDeliveries).toFixed(2) : 0;

        res.json({
            totalEvents,
            failedEvents,
            dlqCount: failedEvents, // DLQ count is same as failed events
            avgAttempts: parseFloat(avgAttempts)
        });
    } catch (error) {
        console.error('[API GATEWAY] Error fetching event metrics:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Failed to fetch event metrics'
        });
    }
});

app.get('/api/events/:eventId', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log(`[API GATEWAY] Admin ${req.user.email} fetching event ${eventId}`);
        const response = await axios.get(`http://event-bus:10000/events/${eventId}`);
        res.json(response.data);
    } catch (error) {
        console.error('[API GATEWAY] Error fetching event details:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Failed to fetch event details'
        });
    }
});

app.post('/api/events/:eventId/replay', verifyJWT, requireRole('admin'), async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log(`[API GATEWAY] Admin ${req.user.email} replaying event ${eventId}`);
        const response = await axios.post(`http://event-bus:10000/events/${eventId}/replay`);
        res.json(response.data);
    } catch (error) {
        console.error('[API GATEWAY] Error replaying event:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Failed to replay event'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`[API GATEWAY] Running on port ${PORT}`);
});
