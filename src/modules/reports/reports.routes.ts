import { Router } from 'express';
import {
  getFleetExceptionsReportHandler,
  getFleetProductivityReportHandler,
  getFleetReportSummaryHandler,
  getTelemetryHistoryReportHandler,
  getTruckCycleReportHandler,
  getTruckDistanceReportHandler,
  getTruckUtilisationReportHandler,
  getZoneActivityReportHandler,
} from './reports.controller.js';

const reportsRouter = Router();

reportsRouter.get('/summary', getFleetReportSummaryHandler);
reportsRouter.get('/utilisation', getTruckUtilisationReportHandler);
reportsRouter.get('/cycles', getTruckCycleReportHandler);
reportsRouter.get('/distance', getTruckDistanceReportHandler);
reportsRouter.get('/zones', getZoneActivityReportHandler);
reportsRouter.get('/history', getTelemetryHistoryReportHandler);
reportsRouter.get('/exceptions', getFleetExceptionsReportHandler);
reportsRouter.get('/productivity', getFleetProductivityReportHandler);

export { reportsRouter };
