require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

// Helmet with adjustments for Google reCAPTCHA
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
            frameSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
            connectSrc: ["'self'", "https://www.google.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration for production
// CLIENT_URL supports comma-separated values for multiple deployments
const clientUrls = (process.env.CLIENT_URL || '').split(',').map(u => u.trim()).filter(Boolean);
const allowedOrigins = [
    ...clientUrls,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
].map(o => o.trim().replace(/\/+$/, ''));

console.log('Allowed CORS origins:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.trim().replace(/\/+$/, '');

        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/capstone_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/v1', apiRoutes);

// Health Check (Keep-Alive)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
