const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const automationRoutes = require('./routes/automationRoutes');

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging Middleware
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/automation', automationRoutes);

// API Root Info
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: '✅ AI WhatsApp CRM API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      payment: '/api/payment',
      user: '/api/user',
      voice: '/api/voice',
      whatsapp: '/api/whatsapp',
      automation: '/api/automation',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: '✅ Server is running', 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

module.exports = app;
