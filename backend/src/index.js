import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import profileRoutes from './routes/profile.routes.js';
import adminRoutes from './routes/admin.routes.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// --------------------------------------
// ✅ CORS Configuration
// --------------------------------------
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// --------------------------------------
// Body Parsers
// --------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------------------------------
// Morgan Logging (skip health route)
// --------------------------------------
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.path === '/health',
  })
);

// --------------------------------------
// Static Upload Folder
// --------------------------------------
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// --------------------------------------
// Health Check Route
// --------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------------------------------
// ⭐ Root Route (Fix for 404 on Render / Railway)
// --------------------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'Candidate Referral API is running 🚀',
    status: 'ok',
    docs: '/api',
  });
});

// --------------------------------------
// API Routes
// --------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// --------------------------------------
// 404 Handler
// --------------------------------------
app.use((_req, res, _next) => {
  res.status(404).json({ message: 'Route not found' });
});

// --------------------------------------
// Global Error Handler
// --------------------------------------
app.use(errorHandler);

// --------------------------------------
// Start Server
// --------------------------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
