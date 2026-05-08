import { ingestWorkforceEvents, listEvents, listRegions, listScenarios } from './workforce.repository.js';
import type { WorkforceEventRequest } from './workforce.types.js';

function regionCoordinates(regionId: string): [number, number] {
  const lookup: Record<string, [number, number]> = {
    'sa4-brisbane-inner': [153.0251, -27.4698],
    'sa4-logan-beaudesert': [153.1094, -27.6392],
    'sa4-townsville': [146.8179, -19.259],
    'sa4-mandurah': [115.7217, -32.536],
    'sa4-northern-territory-outback': [133.7751, -23.698]
  };

  return lookup[regionId] ?? [133.7751, -25.2744];
}

export function getPathwaysDataset() {
  const regions = listRegions();
  const averages = regions.reduce(
    (acc, region) => ({
      employmentRatePercent: acc.employmentRatePercent + region.employmentRatePercent,
      vacancies: acc.vacancies + region.vacancies,
      skillsGapIndex: acc.skillsGapIndex + region.skillsGapIndex,
      trainingCompletions: acc.trainingCompletions + region.trainingCompletions,
      sustainedOutcomeRatePercent: acc.sustainedOutcomeRatePercent + region.sustainedOutcomeRatePercent
    }),
    { employmentRatePercent: 0, vacancies: 0, skillsGapIndex: 0, trainingCompletions: 0, sustainedOutcomeRatePercent: 0 }
  );
  const divisor = Math.max(1, regions.length);

  return {
    scenarios: listScenarios(),
    kpis: listScenarios().map((scenario, index) => ({
      scenarioId: scenario.scenarioId,
      metrics: {
        employmentRatePercent: Number((averages.employmentRatePercent / divisor + index * 1.6).toFixed(1)),
        vacancies: Math.max(0, Math.round(averages.vacancies - index * 720)),
        skillsGapIndex: Math.max(0, Math.round(averages.skillsGapIndex / divisor - index * 5)),
        trainingCompletions: Math.round(averages.trainingCompletions + index * 860),
        sustainedOutcomeRatePercent: Number((averages.sustainedOutcomeRatePercent / divisor + index * 2.4).toFixed(1))
      }
    })),
    regions: {
      features: regions.map((region) => ({
        ...region,
        geometry: { type: 'Point' as const, coordinates: regionCoordinates(region.regionId) }
      }))
    }
  };
}

export function ingestEvents(events: WorkforceEventRequest[]) {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error('At least one workforce event is required.');
  }

  return ingestWorkforceEvents(events);
}

export function getRecentEvents() {
  return listEvents();
}
