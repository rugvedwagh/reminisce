import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';

import helmet from 'helmet';
import compression from 'compression';

import errorHandler from './middleware/error.middleware.js';
import notFound from './middleware/not-found.middleware.js';
import DatabaseConnection from './config/database.js';
import { RedisConnection } from './config/redis.js';

import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1); // Trust first proxy (Render)

// === Security & Performance Middleware ===
app.use(helmet());
app.use(compression());
app.disable('x-powered-by'); // Hide Express info from headers

// === CORS & Parsing Middleware ===
app.use(
    cors({
        origin: process.env.REACT_APP_DOMAIN,
        credentials: true,
    })
);

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

// === Routes ===
app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// === Root Route ===
app.get('/', (req, res) => {
    res.send(`<h3> Server is running in ${process.env.NODE_ENV || 'development'} mode</h3>`);
});

// === 404 + Error Handling Middleware ===
app.use(notFound);
app.use(errorHandler);

// === Connect to DB & Redis ===
DatabaseConnection();
RedisConnection();

// === Server Startup ===
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
    const sslOptions = {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem'),
    };

    https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
        console.log(`\n✅ HTTPS Dev Server running at https://localhost:${PORT}`);
    });

} else {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`\n🚀 Production server running on port ${PORT}`);
    });
}

