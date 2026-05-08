import type { WorkforceEventRequest, WorkforceRegionProjection, WorkforceScenarioProjection } from './workforce.types.js';

const now = new Date().toISOString();

const scenarios: WorkforceScenarioProjection[] = [
  {
    scenarioId: 'baseline-support',
    displayName: 'Baseline employment services',
    summary: 'Current caseload, provider coverage and training pipeline settings.',
    horizonQuarter: '2026 Q2'
  },
  {
    scenarioId: 'regional-skills-accelerator',
    displayName: 'Regional skills accelerator',
    summary: 'Prioritises short-cycle training places against regional vacancy pressure and skills gaps.',
    horizonQuarter: '2026 Q4'
  },
  {
    scenarioId: 'youth-pathways-boost',
    displayName: 'Youth pathways boost',
    summary: 'Targets youth cohorts with work experience, foundation skills and employer matching.',
    horizonQuarter: '2027 Q1'
  }
];

const regions = new Map<string, WorkforceRegionProjection>([
  ['sa4-brisbane-inner', {
    regionId: 'sa4-brisbane-inner',
    displayName: 'Brisbane Inner City',
    state: 'QLD',
    primaryIndustry: 'Health care and social assistance',
    cohort: 'all',
    employmentRatePercent: 68.9,
    vacancies: 2860,
    skillsGapIndex: 48,
    trainingCompletions: 1480,
    sustainedOutcomeRatePercent: 57.8,
    participantCount: 6240,
    updatedAt: now
  }]
]);

const events: WorkforceEventRequest[] = [];

export function listScenarios() {
  return scenarios;
}

export function listRegions() {
  return [...regions.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function listEvents() {
  return events.slice(-100);
}

export function ingestWorkforceEvents(nextEvents: WorkforceEventRequest[]) {
  for (const event of nextEvents) {
    events.push(event);
    const current = regions.get(event.regionId);
    regions.set(event.regionId, {
      regionId: event.regionId,
      displayName: event.regionName,
      state: event.state,
      primaryIndustry: event.primaryIndustry,
      cohort: event.cohort,
      employmentRatePercent: event.employmentRatePercent ?? current?.employmentRatePercent ?? 0,
      vacancies: event.vacancies ?? current?.vacancies ?? 0,
      skillsGapIndex: event.skillsGapIndex ?? current?.skillsGapIndex ?? 0,
      trainingCompletions: event.trainingCompletions ?? current?.trainingCompletions ?? 0,
      sustainedOutcomeRatePercent: event.sustainedOutcomeRatePercent ?? current?.sustainedOutcomeRatePercent ?? 0,
      participantCount: event.participantCount ?? current?.participantCount ?? 0,
      updatedAt: event.occurredAt
    });
  }

  return { accepted: nextEvents.length, totalEvents: events.length, regions: listRegions() };
}
