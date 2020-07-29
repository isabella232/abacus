import {
  AnalysisStrategy,
  ExperimentFull,
  ExperimentFullNew,
  ExperimentFullNormalized,
  ExperimentFullNormalizedData,
  Platform,
  Variation,
} from './schemas'

/**
 * Return the deployed variation if one has been selected, otherwise `null`.
 *
 * @throws {Error} If a `deployedVariationId` is set but cannot be found in the
 *   variations.
 */
export function getDeployedVariation(normalizedExperimentData: ExperimentFullNormalizedData): null | Variation {
  const normalizedExperiment = normalizedExperimentData.entities.experiments[normalizedExperimentData.result]

  if (typeof normalizedExperiment.deployedVariationId !== 'number') {
    return null
  }

  const deployedVariation = normalizedExperimentData.entities.variations[normalizedExperiment.deployedVariationId]

  if (!deployedVariation) {
    throw new Error(
      `Failed to resolve the deployed variation with ID ${normalizedExperiment.deployedVariationId} for experiment with ID ${normalizedExperiment.experimentId}.`,
    )
  }

  return deployedVariation
}

/**
 * Return the primary metric assignment ID for this experiment if one exists.
 */
export function getPrimaryMetricAssignmentId(experiment: ExperimentFull): number | null {
  return experiment.metricAssignments.find((metricAssignment) => metricAssignment.isPrimary)?.metricAssignmentId ?? null
}

/**
 * Determines whether conclusion data has been entered for this experiment.
 */
export function hasConclusionData(experiment: ExperimentFull | ExperimentFullNormalized): boolean {
  return !!experiment.endReason || !!experiment.conclusionUrl || typeof experiment.deployedVariationId === 'number'
}

/**
 * Return this experiment's default analysis strategy, which depends on the existence of exposureEvents.
 */
export function getDefaultAnalysisStrategy(experiment: ExperimentFull) {
  return experiment.exposureEvents ? AnalysisStrategy.PpNaive : AnalysisStrategy.MittNoSpammersNoCrossovers
}

export function createNewExperiment(): Partial<ExperimentFullNew> {
  return {
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
