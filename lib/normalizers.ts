import { normalize, schema } from 'normalizr'

import {
  ExperimentFull,
  ExperimentFullNormalized,
  ExperimentFullNormalizedEntities,
  experimentFullNormalizrSchema,
  MetricBare,
  MetricFull,
  Segment,
} from './schemas'

const metricNormalizrSchema = new schema.Entity<MetricBare | MetricFull>('metrics', {}, { idAttribute: 'metricId' })

/**
 * Return a mapping from metric ID to the metric object.
 */
export function indexMetrics<Metric extends MetricBare | MetricFull>(metrics: Metric[]): Record<number, Metric> {
  return normalize<Metric>(metrics, [metricNormalizrSchema]).entities.metrics || {}
}

const segmentNormalizrSchema = new schema.Entity<Segment>('segments', {}, { idAttribute: 'segmentId' })

/**
 * Return a mapping from segment ID to the segment object.
 */
export function indexSegments(segments: Segment[]): Record<number, Segment> {
  return normalize<Segment>(segments, [segmentNormalizrSchema]).entities.segments || {}
}

/**
 * Returns a tuple of normalizedExperiment and normalizedExperimentEntities (all the entities in experiment including experiment itself).
 */
export function normalizeExperiment(
  experiment: ExperimentFull,
): [ExperimentFullNormalized, ExperimentFullNormalizedEntities] {
  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const normalizedExperiment = normalizedExperimentData.entities.experiments[normalizedExperimentData.result]
  const entities = {
    experiments: normalizedExperimentData.entities.experiments,
    metricAssignments: normalizedExperimentData.entities.metricAssignments || {},
    segmentAssignments: normalizedExperimentData.entities.segmentAssignments || {},
    variations: normalizedExperimentData.entities.variations || {},
  }
  return [normalizedExperiment, entities]
}
