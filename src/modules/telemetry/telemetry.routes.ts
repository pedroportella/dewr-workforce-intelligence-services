import { Router } from 'express';
import { ingestTelemetryEventsHandler } from './telemetry.controller.js';

const telemetryRouter = Router();

telemetryRouter.post('/events', ingestTelemetryEventsHandler);

export { telemetryRouter };
