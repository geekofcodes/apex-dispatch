import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/orders';
const EVENT_BUS_URL = 'http://event-bus:10000/events';

// MongoDB Connection
mongoose.connect(MONGO_URL)
    .then(() => console.log('[ORDER SERVICE] Connected to MongoDB'))
    .catch(err => console.error('[ORDER SERVICE] MongoDB connection error:', err));

// Order Model
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    item: { type: String, required: true },
    status: { type: String, required: true },
    courierId: String
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Order Service is running' });
});

// Create order endpoint
app.post('/orders', async (req, res) => {
    try {
        const { item } = req.body;

        if (!item) {
            return res.status(400).json({ error: 'Item is required' });
        }

        // Create order with CREATED status
        const orderId = randomUUID();

        console.log(`[ORDER SERVICE] Created order: ${orderId}`);

        // Save order to database with CREATED status
        const order = new Order({
            orderId,
            item,
            status: 'CREATED'
        });
        await order.save();

        // Emit ORDER_CREATED event to Event Bus
        try {
            await axios.post(EVENT_BUS_URL, {
                type: 'ORDER_CREATED',
                payload: { orderId, item }
            });
            console.log(`[ORDER SERVICE] Emitted ORDER_CREATED event for order ${orderId}`);
        } catch (error) {
            console.error('[ORDER SERVICE] Failed to emit ORDER_CREATED event:', error.message);
        }

        // Return response immediately
        res.json({
            orderId,
            item,
            status: 'CREATED'
        });
    } catch (error) {
        console.error('[ORDER SERVICE] Error creating order:', error.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Event handler endpoint
app.post('/events', async (req, res) => {
    const { type, payload } = req.body;

    console.log(`[ORDER SERVICE] Received event: ${type}`, payload);

    try {
        if (type === 'COURIER_ASSIGNED') {
            // Update order with courier assignment
            const { orderId, courierId } = payload;
            await Order.findOneAndUpdate(
                { orderId },
                { courierId, status: 'ASSIGNED' }
            );
            console.log(`[ORDER SERVICE] Updated order ${orderId} with courier ${courierId}`);
        }

        res.status(200).json({ message: 'Event processed' });
    } catch (error) {
        console.error('[ORDER SERVICE] Error processing event:', error.message);
        res.status(500).json({ error: 'Failed to process event' });
    }
});

// Get all orders endpoint
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders.map(order => ({
            orderId: order.orderId,
            item: order.item,
            status: order.status,
            courierId: order.courierId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        })));
    } catch (error) {
        console.error('[ORDER SERVICE] Error fetching orders:', error.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`[ORDER SERVICE] Running on port ${PORT}`);
});
