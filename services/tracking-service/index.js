import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/tracking';

// MongoDB Connection
mongoose.connect(MONGO_URL)
    .then(() => console.log('[TRACKING SERVICE] Connected to MongoDB'))
    .catch(err => console.error('[TRACKING SERVICE] MongoDB connection error:', err));

// Tracking Model
const TrackingSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    history: [String]
}, { timestamps: true });

const Tracking = mongoose.model('Tracking', TrackingSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Tracking Service is running' });
});

// Event handler endpoint
app.post('/events', async (req, res) => {
    const { type, payload } = req.body;

    console.log(`[TRACKING SERVICE] Received event: ${type}`, payload);

    try {
        if (type === 'ORDER_CREATED') {
            const { orderId } = payload;

            const tracking = new Tracking({
                orderId,
                status: 'CREATED',
                history: ['CREATED']
            });

            await tracking.save();
            console.log(`[TRACKING SERVICE] Initialized tracking for order: ${orderId}`);
        }

        if (type === 'COURIER_ASSIGNED') {
            const { orderId } = payload;

            const tracking = await Tracking.findOne({ orderId });

            if (tracking) {
                tracking.status = 'ASSIGNED';
                tracking.history.push('ASSIGNED');
                await tracking.save();
                console.log(`[TRACKING SERVICE] Updated tracking for order ${orderId}: ASSIGNED`);
            }
        }

        res.status(200).json({ message: 'Event processed' });
    } catch (error) {
        console.error('[TRACKING SERVICE] Error processing event:', error.message);
        res.status(500).json({ error: 'Failed to process event' });
    }
});

// Get tracking for an order
app.get('/tracking/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const tracking = await Tracking.findOne({ orderId });

        if (!tracking) {
            return res.status(404).json({ error: 'Tracking record not found' });
        }

        res.json({
            orderId: tracking.orderId,
            status: tracking.status,
            history: tracking.history
        });
    } catch (error) {
        console.error('[TRACKING SERVICE] Error fetching tracking:', error.message);
        res.status(500).json({ error: 'Failed to fetch tracking' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`[TRACKING SERVICE] Running on port ${PORT}`);
});
