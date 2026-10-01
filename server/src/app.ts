import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env, checkGeminiKey } from './config/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import chatRoutes from './routes/chat';
import quizRoutes from './routes/quiz';
import plannerRoutes from './routes/planner';
import progressRoutes from './routes/progress';
import recommendationsRoutes from './routes/recommendations';
import notesRoutes from './routes/notes';

const app = express();

// Middleware
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Static files for uploads (served only to authenticated users in route handlers)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!env.geminiApiKey,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/notes', notesRoutes);

// Error handler (must be last)
app.use(errorHandler);

checkGeminiKey();

export default app;
