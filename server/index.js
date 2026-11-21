import express from 'express';
import cors from 'cors';
import reviewRouter from './routes/review.js';
import { errorHandler } from './middleware/errors.js';

const app = express();
const port = Number(process.env.PORT) || 4000;

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'lease-lens-api' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lease-lens-api' });
});

app.use(reviewRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[Server] listening on http://localhost:${port}`);
  });
}

export default app;
