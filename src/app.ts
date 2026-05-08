import cors from 'cors';
import express from 'express';
import { workforceRouter } from './modules/workforce/workforce.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'dewr-workforce-intelligence-services' });
});

app.use('/api/v1/workforce-intelligence', workforceRouter);

export { app };
