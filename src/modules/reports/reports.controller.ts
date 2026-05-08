import type { Request, Response } from 'express';
import {
  getFleetExceptionsReport,
  getFleetProductivityReport,
  getFleetReportSummary,
  getTelemetryHistoryReport,
  getTruckCycleReport,
  getTruckDistanceReport,
  getTruckUtilisationReport,
  getZoneActivityReport,
} from './reports.service.js';

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getReportRange(req: Request) {
  return {
    from: parseDate(req.query['from']),
    to: parseDate(req.query['to']),
    truckCode: typeof req.query['truckCode'] === 'string' ? req.query['truckCode'] : undefined,
    limit: typeof req.query['limit'] === 'string' ? Number(req.query['limit']) : undefined,
  };
}

async function runReport(res: Response, action: () => Promise<unknown>) {
  try {
    const payload = await action();
    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected report error';
    res.status(500).json({ message });
  }
}

export async function getFleetReportSummaryHandler(req: Request, res: Response) {
  await runReport(res, () => getFleetReportSummary(getReportRange(req)));
}

export async function getTruckUtilisationReportHandler(req: Request, res: Response) {
  await runReport(res, () => getTruckUtilisationReport(getReportRange(req)));
}

export async function getTruckCycleReportHandler(req: Request, res: Response) {
  await runReport(res, () => getTruckCycleReport(getReportRange(req)));
}

export async function getTruckDistanceReportHandler(req: Request, res: Response) {
  await runReport(res, () => getTruckDistanceReport(getReportRange(req)));
}

export async function getZoneActivityReportHandler(req: Request, res: Response) {
  await runReport(res, () => getZoneActivityReport(getReportRange(req)));
}

export async function getTelemetryHistoryReportHandler(req: Request, res: Response) {
  await runReport(res, () => getTelemetryHistoryReport(getReportRange(req)));
}

export async function getFleetExceptionsReportHandler(req: Request, res: Response) {
  await runReport(res, () => getFleetExceptionsReport(getReportRange(req)));
}

export async function getFleetProductivityReportHandler(req: Request, res: Response) {
  await runReport(res, () => getFleetProductivityReport(getReportRange(req)));
}
