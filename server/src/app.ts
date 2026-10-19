import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createApiRouter } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/errorHandler';

dotenv.config();

export function createApp(): Application {
  const app = express();

  app.use(helmet());

  const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: origin === '*' ? '*' : [origin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  app.use('/api', createApiRouter());

  app.use(errorHandler);

  return app;
}
