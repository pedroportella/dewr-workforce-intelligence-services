import assert from 'node:assert/strict';
import { ingestEvents, getPathwaysDataset } from './modules/workforce/workforce.service.js';

const result = ingestEvents([
  {
    eventId: 'contract-test-001',
    eventType: 'TrainingCompletionRecorded',
    occurredAt: new Date('2026-05-08T00:00:00.000Z').toISOString(),
    regionId: 'sa4-logan-beaudesert',
    regionName: 'Logan - Beaudesert',
    state: 'QLD',
    primaryIndustry: 'Construction',
    cohort: 'participant',
    trainingCompletions: 1110,
    participantCount: 9200
  }
]);

assert.equal(result.accepted, 1);

const dataset = getPathwaysDataset();
const logan = dataset.regions.features.find((region) => region.regionId === 'sa4-logan-beaudesert');

assert.equal(logan?.trainingCompletions, 1110);
assert.equal(dataset.scenarios.length, 3);

console.log('workforce contract tests passed');
