import { Router } from 'express';
import { getPathwaysDataset, getRecentEvents, ingestEvents } from './workforce.service.js';

const workforceRouter = Router();

workforceRouter.get('/pathways/dataset', (_req, res) => {
  res.json(getPathwaysDataset());
});

workforceRouter.get('/events', (_req, res) => {
  res.json({ events: getRecentEvents() });
});

workforceRouter.post('/events', (req, res) => {
  try {
    const result = ingestEvents(req.body.events ?? req.body);
    res.status(202).json(result);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid workforce event payload.' });
  }
});

export { workforceRouter };
