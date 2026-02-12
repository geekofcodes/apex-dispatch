import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Notification Service is running' });
});

// Event handler endpoint
app.post('/events', (req, res) => {
    const { type, payload } = req.body;

    console.log(`[NOTIFICATION SERVICE] Received event: ${type}`, payload);

    if (type === 'ORDER_CREATED') {
        const { orderId } = payload;
        console.log(`[NOTIFICATION] ORDER_CREATED for order ${orderId}`);
    }

    if (type === 'COURIER_ASSIGNED') {
        const { orderId, courierId } = payload;
        console.log(`[NOTIFICATION] COURIER_ASSIGNED for order ${orderId} to courier ${courierId}`);
    }

    res.status(200).json({ message: 'Event processed' });
});

// Start server
app.listen(PORT, () => {
    console.log(`[NOTIFICATION SERVICE] Running on port ${PORT}`);
});
