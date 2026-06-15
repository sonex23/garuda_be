import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(env.uploadDir)));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default serverless(app);
