import { Router } from 'express';
import {
  createTruckHandler,
  getTrucksHandler,
  updateTruckStatusHandler,
} from './truck.controller.js';

const truckRouter = Router();

truckRouter.get('/', getTrucksHandler);
truckRouter.post('/', createTruckHandler);
truckRouter.patch('/:id/status', updateTruckStatusHandler);

export { truckRouter };