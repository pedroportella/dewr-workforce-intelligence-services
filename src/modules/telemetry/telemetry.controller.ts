import type { Request, Response } from 'express';
import type { TelemetryIngestRequestDto } from '../../shared/contracts/telemetry-contracts.js';
import { ingestTelemetryEvents } from './telemetry.service.js';

export async function ingestTelemetryEventsHandler(req: Request, res: Response) {
  try {
    const payload = req.body as TelemetryIngestRequestDto;

    if (!payload?.source || !payload?.simulation || !payload?.snapshot?.trucks) {
      res.status(400).json({ message: 'Invalid telemetry payload.' });
      return;
    }

    const response = await ingestTelemetryEvents(payload);
    res.status(202).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected telemetry ingest error';
    res.status(500).json({ message });
  }
}
