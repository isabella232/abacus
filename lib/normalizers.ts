import { normalize, schema } from 'normalizr'

import {
  ExperimentFull,
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
 * Returns a tuple of normalizedExperiment and normalizedExperimentData (normalizr format, includes all nested entities).
 */
export function normalizeExperiment(experiment: ExperimentFull) {
  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const normalizedExperiment = normalizedExperimentData.entities.experiments[normalizedExperimentData.result]
  return [normalizedExperiment, normalizedExperimentData]
}
