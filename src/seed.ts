import 'dotenv/config';
import { prisma } from './db.js';

const observedAt = new Date('2026-05-08T00:00:00.000Z');

const scenarios = [
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

const regions = [
  {
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
    participantCount: 6240
  },
  {
    regionId: 'sa4-logan-beaudesert',
    displayName: 'Logan - Beaudesert',
    state: 'QLD',
    primaryIndustry: 'Construction',
    cohort: 'participant',
    employmentRatePercent: 59.7,
    vacancies: 2240,
    skillsGapIndex: 66,
    trainingCompletions: 1060,
    sustainedOutcomeRatePercent: 49.4,
    participantCount: 9120
  },
  {
    regionId: 'sa4-townsville',
    displayName: 'Townsville',
    state: 'QLD',
    primaryIndustry: 'Manufacturing',
    cohort: 'youth',
    employmentRatePercent: 61.5,
    vacancies: 1320,
    skillsGapIndex: 73,
    trainingCompletions: 760,
    sustainedOutcomeRatePercent: 47.1,
    participantCount: 4380
  }
];

async function main() {
  for (const scenario of scenarios) {
    await prisma.pathwayScenario.upsert({
      where: { scenarioId: scenario.scenarioId },
      update: scenario,
      create: scenario
    });
  }

  for (const region of regions) {
    await prisma.workforceRegion.upsert({
      where: { regionId: region.regionId },
      update: {
        displayName: region.displayName,
        state: region.state,
        primaryIndustry: region.primaryIndustry,
        cohort: region.cohort
      },
      create: {
        regionId: region.regionId,
        displayName: region.displayName,
        state: region.state,
        primaryIndustry: region.primaryIndustry,
        cohort: region.cohort
      }
    });

    await prisma.workforceMetricSnapshot.create({
      data: {
        regionId: region.regionId,
        employmentRatePercent: region.employmentRatePercent,
        vacancies: region.vacancies,
        skillsGapIndex: region.skillsGapIndex,
        trainingCompletions: region.trainingCompletions,
        sustainedOutcomeRatePercent: region.sustainedOutcomeRatePercent,
        participantCount: region.participantCount,
        observedAt
      }
    });
  }

  console.log('DEWR workforce intelligence seed data applied.');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
