const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
if (!process.env.AGRO_API_KEY || !process.env.MONGODB_URI) {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
}
const config = require('./config/config');
const { initScheduler } = require('./services/cropAlertScheduler');

const app = express();
const compression = require('compression');

// CORS Configuration - using config settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Handle both array and string formats for allowed origins
    let allowedOrigins = [];
    if (Array.isArray(config.cors.origin)) {
      allowedOrigins = config.cors.origin;
    } else if (typeof config.cors.origin === 'string') {
      // If it's a comma-separated string, split it
      allowedOrigins = config.cors.origin.split(',').map(o => o.trim());
    } else {
      // Default fallback
      allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://agro-rakshak.vercel.app'];
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || (origin && origin.endsWith('vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  optionsSuccessStatus: config.cors.optionsSuccessStatus,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
};

// Middleware
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// Static uploads (research images)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Database connection helper with connection reuse for serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const db = await mongoose.connect(config.database.uri, config.database.options);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected');
    if (process.env.VERCEL !== '1') {
      initScheduler();
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

// Auto-connect on startup for non-serverless environments
if (process.env.VERCEL !== '1') {
  connectDB();
}

// Serverless DB connection middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && config.database.uri) {
    await connectDB();
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/diagnosis', require('./routes/diagnosis'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/marketplace', require('./routes/marketplace'));
// Soil Health routes
app.use('/api/soil', require('./routes/soilHealth'));
// Research & References
app.use('/api/research', require('./routes/research'));
app.use('/api/notifications', require('./routes/notifications'));
// Image Uploads
app.use('/api/upload', require('./routes/upload'));
// Farmer Module
app.use('/api/farmer', require('./routes/farmer'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Agro Rakshak API is running' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Agro Rakshak API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Serve frontend in production (Single Server Deployment fallback when not on Vercel)
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    // Only send index.html if it's not an API request
    if (!req.url.startsWith('/api/')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1' && require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
