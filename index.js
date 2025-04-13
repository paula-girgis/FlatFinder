import express from 'express';
import dotenv from 'dotenv';
import { appRouter } from './src/app.router.js';
import { connectDB } from './DB/connection.js';

dotenv.config();

const app = express();
connectDB();

appRouter(app, express);

// Don't use app.listen() directly
const port = process.env.port || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`App running on port ${port}`));
}

export default app; // 👈 Required for Vercel
