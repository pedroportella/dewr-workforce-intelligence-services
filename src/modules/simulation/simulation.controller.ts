import type { Request, Response } from 'express';
import {
  getSimulationSnapshot,
  getSimulationState,
  resetSimulation,
  startSimulation,
  stopSimulation,
  tickSimulation,
} from './simulation.service.js';

function handleSimulationError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected simulation error';
  res.status(503).json({ message });
}

export async function getSimulationSnapshotHandler(_req: Request, res: Response) {
  try {
    const snapshot = await getSimulationSnapshot();
    res.json(snapshot);
  } catch (error) {
    handleSimulationError(res, error);
  }
}

export async function getSimulationStateHandler(_req: Request, res: Response) {
  try {
    const state = await getSimulationState();
    res.json(state);
  } catch (error) {
    handleSimulationError(res, error);
  }
}

export async function tickSimulationHandler(_req: Request, res: Response) {
  try {
    const response = await tickSimulation();
    res.json(response);
  } catch (error) {
    handleSimulationError(res, error);
  }
}

export async function resetSimulationHandler(_req: Request, res: Response) {
  try {
    const response = await resetSimulation();
    res.json(response);
  } catch (error) {
    handleSimulationError(res, error);
  }
}

export async function startSimulationHandler(_req: Request, res: Response) {
  try {
    const response = await startSimulation();
    res.json(response);
  } catch (error) {
    handleSimulationError(res, error);
  }
}

export async function stopSimulationHandler(_req: Request, res: Response) {
  try {
    const response = await stopSimulation();
    res.json(response);
  } catch (error) {
    handleSimulationError(res, error);
  }
}
