import { AnalysisStrategy, ExperimentFull, Platform, Variation } from './schemas'

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
 * Return this experiment's default analysis strategy, which depends on the existence of exposureEvents.
 */
export function getDefaultAnalysisStrategy(experiment: ExperimentFull): AnalysisStrategy {
  return experiment.exposureEvents ? AnalysisStrategy.PpNaive : AnalysisStrategy.MittNoSpammersNoCrossovers
}

export const PlatformToHuman: Record<Platform, string> = {
  [Platform.Wpcom]: 'WordPress.com Backend',
  [Platform.Calypso]: 'Calypso',
}
