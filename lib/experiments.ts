import { AnalysisStrategy, ExperimentFull, Variation, Platform } from './schemas'
import { DefaultVariationKey } from './variations'

/**
 * Return the deployed variation if one has been selected, otherwise `null`.
 *
 * @throws {Error} If a `deployedVariationId` is set but cannot be found in the
 *   variations.
 */
export function getDeployedVariation(experiment: ExperimentFull): null | Variation {
  let deployedVariation = null

  if (typeof experiment.deployedVariationId === 'number') {
    deployedVariation = experiment.variations.find(
      (variation) => experiment.deployedVariationId === variation.variationId,
    )

    if (!deployedVariation) {
      throw Error(
        `Failed to resolve the deployed variation with ID ${experiment.deployedVariationId} for experiment with ID ${experiment.experimentId}.`,
      )
    }
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
export function hasConclusionData(experiment: ExperimentFull): boolean {
  return !!experiment.endReason || !!experiment.conclusionUrl || typeof experiment.deployedVariationId === 'number'
}

/**
 * Return this experiment's default analysis strategy, which depends on the existence of exposureEvents.
 */
export function getDefaultAnalysisStrategy(experiment: ExperimentFull) {
  return experiment.exposureEvents ? AnalysisStrategy.PpNaive : AnalysisStrategy.MittNoSpammersNoCrossovers
}

export function createNewExperiment(): Partial<ExperimentFull> {
  return {
    platform: Platform.Wpcom,
    metricAssignments: [],
    segmentAssignments: [],
    variations: [
      { name: 'control', isDefault: true, allocatedPercentage: 50, key: DefaultVariationKey.Control },
      { name: 'treatment', isDefault: false, allocatedPercentage: 50, key: DefaultVariationKey.Treatment },
    ],
  }
}