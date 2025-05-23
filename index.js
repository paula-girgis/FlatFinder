import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import { appRouter } from './src/app.router.js';
import { connectDB } from './DB/connection.js';

dotenv.config();

const app = express();

// 2. Use cors middleware (allow all origins)
app.use(cors({
  origin: '*', // Allow requests from any domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Async initialization
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB to connect before using app
    appRouter(app, express);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
    process.exit(1); // Exit with failure code
  }
};

startServer();
