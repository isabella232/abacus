import { LinearProgress } from '@material-ui/core'
import debugFactory from 'debug'
import { normalize } from 'normalizr'
import React from 'react'

import MetricsApi from '@/api/MetricsApi'
import SegmentsApi from '@/api/SegmentsApi'
import DebugOutput from '@/components/DebugOutput'
import ExperimentForm from '@/components/experiment-creation/ExperimentForm'
import Layout from '@/components/Layout'
import { createNewExperiment } from '@/lib/experiments'
import { MetricBare, metricBareNormalizrSchema, Segment, segmentNormalizrSchema } from '@/lib/schemas'
import { useDataLoadingError, useDataSource } from '@/utils/data-loading'
import { or } from '@/utils/general'

const debug = debugFactory('abacus:pages/experiments/new.tsx')

const ExperimentsNewPage = function () {
  debug('ExperimentsNewPage#render')
  const initialExperiment = createNewExperiment()

  const { isLoading: metricsIsLoading, data: indexedMetrics, error: metricsError } = useDataSource(async () => {
    const metrics = await MetricsApi.findAll()
    const {
      entities: { metrics: indexedMetrics },
    } = normalize<MetricBare, { metrics: Record<number, MetricBare> }>(metrics, [metricBareNormalizrSchema])
    return indexedMetrics
  }, [])
  useDataLoadingError(metricsError, 'Metrics')

  const { isLoading: segmentsIsLoading, data: indexedSegments, error: segmentsError } = useDataSource(async () => {
    const segments = await SegmentsApi.findAll()
    const {
      entities: { segments: indexedSegments },
    } = normalize<Segment, { segments: Record<number, Segment> }>(segments, [segmentNormalizrSchema])
    return indexedSegments
  }, [])
  useDataLoadingError(segmentsError, 'Segments')

  const isLoading = or(metricsIsLoading, segmentsIsLoading)

  return (
    <Layout title='Create an Experiment'>
      {isLoading && <LinearProgress />}
      {!isLoading && indexedMetrics && indexedSegments && (
        <ExperimentForm
          indexedMetrics={indexedMetrics}
          indexedSegments={indexedSegments}
          initialExperiment={initialExperiment}
        />
      )}
      <DebugOutput label='Initial Experiment' content={initialExperiment} />
      <DebugOutput label='Metrics' content={indexedMetrics} />
      <DebugOutput label='Segments' content={indexedSegments} />
    </Layout>
  )
}

export default ExperimentsNewPage
