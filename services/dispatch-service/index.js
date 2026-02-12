import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 7000;
const EVENT_BUS_URL = 'http://event-bus:10000/events';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Dispatch Service is running' });
});

// Event handler endpoint
app.post('/events', async (req, res) => {
    const { type, payload } = req.body;

    console.log(`[DISPATCH SERVICE] Received event: ${type}`, payload);

    try {
        if (type === 'ORDER_CREATED') {
            const { orderId } = payload;

            console.log(`[DISPATCH SERVICE] Assigning courier for order: ${orderId}`);

            // Call Courier Service to get available courier
            const courierResponse = await axios.get('http://courier-service:6000/couriers/available');
            const courier = courierResponse.data;

            console.log(`[DISPATCH SERVICE] Assigned courier ${courier.id} to order ${orderId}`);

            // Emit COURIER_ASSIGNED event to Event Bus
            await axios.post(EVENT_BUS_URL, {
                type: 'COURIER_ASSIGNED',
                payload: { orderId, courierId: courier.id }
            });

            console.log(`[DISPATCH SERVICE] Emitted COURIER_ASSIGNED event for order ${orderId}`);
        }

        res.status(200).json({ message: 'Event processed' });
    } catch (error) {
        console.error('[DISPATCH SERVICE] Error processing event:', error.message);
        res.status(500).json({ error: 'Failed to process event' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`[DISPATCH SERVICE] Running on port ${PORT}`);
});
