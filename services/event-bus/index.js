import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventbus';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('[EVENT BUS] Connected to MongoDB'))
    .catch(err => console.error('[EVENT BUS] MongoDB connection error:', err));

// Event Schema - Main event record
const EventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
        type: String,
        enum: ['RECEIVED', 'DELIVERED', 'PARTIALLY_DELIVERED'],
        default: 'RECEIVED'
    }
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);

// Delivery Schema - Per-service delivery tracking
const DeliverySchema = new mongoose.Schema({
    eventId: { type: String, required: true, index: true },
    targetService: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'DELIVERED', 'FAILED'],
        default: 'PENDING'
    },
    attempts: { type: Number, default: 0 },
    lastError: String
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', DeliverySchema);

// List of services to notify
const SERVICES = [
    { name: 'dispatch-service', url: process.env.DISPATCH_SERVICE_URL },
    { name: 'tracking-service', url: process.env.TRACKING_SERVICE_URL },
    { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL }
].filter(s => !!s.url);


// Helper function to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry delivery to a single service
async function deliverEventWithRetry(service, eventData, delivery) {
    const { type, payload } = eventData;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[EVENT BUS] Attempt ${attempt}/${MAX_RETRIES} - Delivering ${type} to ${service.name}`);

            await axios.post(service.url, { type, payload }, { timeout: 5000 });

            // Success - update delivery
            delivery.status = 'DELIVERED';
            delivery.attempts = attempt;
            await delivery.save();

            console.log(`[EVENT BUS] ✓ Successfully delivered ${type} to ${service.name}`);
            return { success: true };

        } catch (error) {
            console.error(`[EVENT BUS] ✗ Attempt ${attempt}/${MAX_RETRIES} failed for ${service.name}: ${error.message}`);

            delivery.attempts = attempt;
            delivery.lastError = error.message;

            // If this was the last attempt, mark as FAILED (DLQ)
            if (attempt === MAX_RETRIES) {
                delivery.status = 'FAILED';
                await delivery.save();

                console.error(`[EVENT BUS] DLQ: Event ${type} for ${service.name} failed after ${MAX_RETRIES} attempts`);
                return { success: false, error: error.message };
            }

            // Save attempt count and wait before retry
            await delivery.save();
            await delay(RETRY_DELAY_MS);
        }
    }
}

// Update event status based on delivery results
async function updateEventStatus(eventId) {
    const deliveries = await Delivery.find({ eventId });

    const allDelivered = deliveries.every(d => d.status === 'DELIVERED');
    const anyDelivered = deliveries.some(d => d.status === 'DELIVERED');

    let status;
    if (allDelivered) {
        status = 'DELIVERED';
    } else if (anyDelivered) {
        status = 'PARTIALLY_DELIVERED';
    } else {
        status = 'RECEIVED'; // All failed or pending
    }

    await Event.findOneAndUpdate({ eventId }, { status });
    console.log(`[EVENT BUS] Event ${eventId} status updated to: ${status}`);
}

// POST /events - Receive and fan-out events with retry
app.post('/events', async (req, res) => {
    const { type, payload } = req.body;
    const eventId = randomUUID();

    console.log(`[EVENT BUS] Received event: ${type} (eventId: ${eventId})`, payload);

    try {
        // 1. Create event record
        const event = new Event({
            eventId,
            type,
            payload,
            status: 'RECEIVED'
        });
        await event.save();
        console.log(`[EVENT BUS] Created event record: ${eventId}`);

        // 2. Create delivery records for each target service
        const deliveryPromises = SERVICES.map(async (service) => {
            const delivery = new Delivery({
                eventId,
                targetService: service.name,
                status: 'PENDING',
                attempts: 0
            });
            await delivery.save();
            return delivery;
        });

        const deliveries = await Promise.all(deliveryPromises);
        console.log(`[EVENT BUS] Created ${deliveries.length} delivery records`);

        // Immediately respond to caller (fire-and-forget)
        res.status(200).json({
            message: 'Event received and processing',
            eventId
        });

        // 3. Process deliveries asynchronously
        const deliveryAttempts = SERVICES.map(async (service, index) => {
            await deliverEventWithRetry(service, { type, payload }, deliveries[index]);
        });

        await Promise.allSettled(deliveryAttempts);

        // 4. Update event status based on delivery results
        await updateEventStatus(eventId);

    } catch (error) {
        console.error('[EVENT BUS] Error processing event:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process event' });
        }
    }
});

// GET /events - List recent events
app.get('/events', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const events = await Event.find()
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            count: events.length,
            events: events.map(e => ({
                eventId: e.eventId,
                type: e.type,
                status: e.status,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt
            }))
        });
    } catch (error) {
        console.error('[EVENT BUS] Error fetching events:', error.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET /events/:eventId - Get event details with deliveries
app.get('/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findOne({ eventId });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const deliveries = await Delivery.find({ eventId });

        res.json({
            event: {
                eventId: event.eventId,
                type: event.type,
                payload: event.payload,
                status: event.status,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt
            },
            deliveries: deliveries.map(d => ({
                targetService: d.targetService,
                status: d.status,
                attempts: d.attempts,
                lastError: d.lastError,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt
            }))
        });
    } catch (error) {
        console.error('[EVENT BUS] Error fetching event details:', error.message);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
});

// GET /dlq - View failed deliveries (DLQ)
app.get('/dlq', async (req, res) => {
    try {
        const failedDeliveries = await Delivery.find({ status: 'FAILED' })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            count: failedDeliveries.length,
            deliveries: failedDeliveries
        });
    } catch (error) {
        console.error('[EVENT BUS] Error fetching DLQ:', error.message);
        res.status(500).json({ error: 'Failed to fetch DLQ' });
    }
});

// POST /events/:eventId/replay - Replay failed deliveries
app.post('/events/:eventId/replay', async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findOne({ eventId });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Find all failed deliveries for this event
        const failedDeliveries = await Delivery.find({
            eventId,
            status: 'FAILED'
        });

        if (failedDeliveries.length === 0) {
            return res.json({
                message: 'No failed deliveries to replay',
                eventId
            });
        }

        console.log(`[EVENT BUS] Replaying ${failedDeliveries.length} failed deliveries for event ${eventId}`);

        // Respond immediately
        res.json({
            message: `Replaying ${failedDeliveries.length} failed deliveries`,
            eventId,
            services: failedDeliveries.map(d => d.targetService)
        });

        // Replay deliveries asynchronously
        const replayPromises = failedDeliveries.map(async (delivery) => {
            // Reset delivery for retry
            delivery.status = 'PENDING';
            delivery.attempts = 0;
            delivery.lastError = undefined;
            await delivery.save();

            // Find the service config
            const service = SERVICES.find(s => s.name === delivery.targetService);
            if (service) {
                await deliverEventWithRetry(service, {
                    type: event.type,
                    payload: event.payload
                }, delivery);
            }
        });

        await Promise.allSettled(replayPromises);

        // Update event status after replay
        await updateEventStatus(eventId);

    } catch (error) {
        console.error('[EVENT BUS] Error replaying event:', error.message);
        res.status(500).json({ error: 'Failed to replay event' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'event-bus',
        uptime: process.uptime()
    });
});


app.listen(PORT, () => {
    console.log(`[EVENT BUS] Running on port ${PORT}`);
});
