import type { Request, Response } from 'express';
import {
  createTruckRecord,
  getAllTrucks,
  updateTruckRecordStatus,
} from './truck.service.js';

export async function getTrucksHandler(_req: Request, res: Response) {
  const trucks = await getAllTrucks();
  res.json(trucks);
}

export async function createTruckHandler(req: Request, res: Response) {
  try {
    const truck = await createTruckRecord(req.body);
    res.status(201).json(truck);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
}

export async function updateTruckStatusHandler(req: Request, res: Response) {
  try {
    const truck = await updateTruckRecordStatus(req.params.id, req.body);
    res.json(truck);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = message === 'truck not found' ? 404 : 400;
    res.status(statusCode).json({ message });
  }
}