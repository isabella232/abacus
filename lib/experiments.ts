import { AnalysisStrategy, ExperimentFull, ExperimentFullNormalized, Platform } from './schemas'

/**
 * Return the primary metric assignment ID for this experiment if one exists.
 */
export function getPrimaryMetricAssignmentId(experiment: ExperimentFull): number | null {
  return experiment.metricAssignments.find((metricAssignment) => metricAssignment.isPrimary)?.metricAssignmentId ?? null
}

/**
 * Determines whether conclusion data has been entered for this experiment.
 */
export function hasConclusionData(normalizedExperiment: ExperimentFullNormalized): boolean {
  return (
    !!normalizedExperiment.endReason ||
    !!normalizedExperiment.conclusionUrl ||
    typeof normalizedExperiment.deployedVariationId === 'number'
  )
}

/**
 * Return this experiment's default analysis strategy, which depends on the existence of exposureEvents.
 */
export function getDefaultAnalysisStrategy(experiment: ExperimentFull) {
  return experiment.exposureEvents ? AnalysisStrategy.PpNaive : AnalysisStrategy.MittNoSpammersNoCrossovers
}

/**
 * Initial Experiment data for use in the ExperimentForm
 */
export function createInitialExperiment() {
  return {
    p2Url: '',
    name: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    ownerLogin: '',
    existingUsersAllowed: 'true',
    platform: Platform.Wpcom,
    metricAssignments: [],
    segmentAssignments: [],
    variations: [
      { name: 'control', isDefault: true, allocatedPercentage: 50 },
      { name: 'treatment', isDefault: false, allocatedPercentage: 50 },
    ],
  }
}

export const PlatformToHuman: Record<Platform, string> = {
  [Platform.Wpcom]: 'WordPress.com',
  [Platform.Calypso]: 'Calypso',
}
