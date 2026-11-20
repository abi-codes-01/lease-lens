import express from 'express';
import reviewRouter from './routes/review.js';
import { errorHandler } from './middleware/errors.js';

const app = express();
const port = Number(process.env.PORT) || 4000;

app.set('trust proxy', 1);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(reviewRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`[Server] listening on http://localhost:${port}`);
});
