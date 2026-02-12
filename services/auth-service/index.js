import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth';
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('[AUTH SERVICE] Connected to MongoDB');
        seedUsers();
    })
    .catch(err => console.error('[AUTH SERVICE] MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'operator', 'viewer'],
        required: true
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Seed default users
async function seedUsers() {
    try {
        const users = [
            { email: 'admin@example.com', password: 'admin123', role: 'admin' },
            { email: 'operator@example.com', password: 'operator123', role: 'operator' },
            { email: 'viewer@example.com', password: 'viewer123', role: 'viewer' }
        ];

        for (const userData of users) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                const passwordHash = await bcrypt.hash(userData.password, 10);
                const user = new User({
                    email: userData.email,
                    passwordHash,
                    role: userData.role
                });
                await user.save();
                console.log(`[AUTH SERVICE] Seeded user: ${userData.email} (${userData.role})`);
            }
        }
    } catch (error) {
        console.error('[AUTH SERVICE] Error seeding users:', error.message);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Auth Service is running' });
});

// POST /auth/login - Login endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const expiresIn = rememberMe ? '7d' : '1h';
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn }
        );

        console.log(`[AUTH SERVICE] User logged in: ${email} (${user.role}), rememberMe: ${rememberMe}`);

        res.json({
            token,
            user: {
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[AUTH SERVICE] Login error:', error.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /auth/verify - Verify JWT token
app.post('/auth/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);

        res.json({
            valid: true,
            user: {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`[AUTH SERVICE] Running on port ${PORT}`);
});
