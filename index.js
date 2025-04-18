import express from 'express';
import dotenv from 'dotenv';
import { appRouter } from './src/app.router.js';
import { connectDB } from './DB/connection.js';

dotenv.config();

const app = express();

// Async initialization
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB to connect before using app
    appRouter(app, express);
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
  }
};

startServer();

// Only listen locally during development
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`🚀 App running on port ${port}`));
}

export default app; // Required for Vercel
