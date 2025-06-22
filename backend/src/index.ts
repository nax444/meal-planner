// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config, dbOptions, validateEnv } from './config';
import { errorHandler, notFound } from './middleware/error';

// Routes
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import mealPlanRoutes from './routes/mealPlans';

// Validate environment variables
validateEnv();

// Create Express app
const app = express();

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose
  .connect(config.mongoUri, dbOptions)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
console.log(`Attempting to start server on port ${PORT}...`);
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app;