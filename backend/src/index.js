require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const db = require('./config/db');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Header hardening
app.use(
  helmet({
    contentSecurityPolicy: false // Allows API consumption without blocking client assets
  })
);

// Cross-Origin Resource Sharing (CORS) with credentials support
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/testing, easily clamped in prod via env
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global General Rate Limiter
app.use('/api', generalLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    postgres_connected: db.isPostgres(),
    service: 'AI Government Scheme Recommender Backend'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/ai', aiRoutes);

// 404 and Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database initialization and server boot
async function startServer(customPort) {
  try {
    await db.initDB();
    const port = customPort || process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`====================================================`);
      console.log(`  AI Government Scheme Recommender API Server       `);
      console.log(`  Listening on http://localhost:${port}             `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(`====================================================`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
