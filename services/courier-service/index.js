import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 6000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/couriers';

// MongoDB Connection
mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .then(() => seedCouriers())
    .catch(err => console.error('MongoDB connection error:', err));

// Courier Model
const CourierSchema = new mongoose.Schema({
    courierId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    available: { type: Boolean, default: true }
}, { timestamps: true });

const Courier = mongoose.model('Courier', CourierSchema);

// Seed initial couriers if DB is empty
async function seedCouriers() {
    try {
        const count = await Courier.countDocuments();
        if (count === 0) {
            await Courier.insertMany([
                { courierId: 'c1', name: 'Rider One', available: true },
                { courierId: 'c2', name: 'Rider Two', available: true }
            ]);
            console.log('Seeded initial couriers');
        }
    } catch (error) {
        console.error('Error seeding couriers:', error);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Courier Service is running' });
});

// Get available courier endpoint
app.get('/couriers/available', async (req, res) => {
    try {
        const availableCourier = await Courier.findOne({ available: true });

        if (!availableCourier) {
            return res.status(404).json({ error: 'No couriers available' });
        }

        console.log(`Returning available courier: ${availableCourier.courierId}`);
        res.json({
            id: availableCourier.courierId,
            name: availableCourier.name,
            available: availableCourier.available
        });
    } catch (error) {
        console.error('Error fetching courier:', error.message);
        res.status(500).json({ error: 'Failed to fetch courier' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Courier Service is running on port ${PORT}`);
});
