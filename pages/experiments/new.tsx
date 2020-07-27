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

  const { isLoading: metricsIsLoading, data: normalizedMetrics, error: metricsError } = useDataSource(async () => {
    const metrics = await MetricsApi.findAll()
    const {
      entities: { metrics: normalizedMetrics },
    } = normalize<MetricBare>(metrics, [metricBareNormalizrSchema])
    return normalizedMetrics
  }, [])
  useDataLoadingError(metricsError, 'Metrics')

  const { isLoading: segmentsIsLoading, data: normalizedSegments, error: segmentsError } = useDataSource(async () => {
    const segments = await SegmentsApi.findAll()
    const {
      entities: { segments: normalizedSegments },
    } = normalize<Segment>(segments, [segmentNormalizrSchema])
    return normalizedSegments
  }, [])
  useDataLoadingError(segmentsError, 'Segments')

  const isLoading = or(metricsIsLoading, segmentsIsLoading)

  return (
    <Layout title='Create an Experiment'>
      {isLoading && <LinearProgress />}
      {!isLoading && normalizedMetrics && normalizedSegments && (
        <ExperimentForm
          normalizedMetrics={normalizedMetrics}
          normalizedSegments={normalizedSegments}
          initialExperiment={initialExperiment}
        />
      )}
      <DebugOutput label='Initial Experiment' content={initialExperiment} />
      <DebugOutput label='Metrics' content={normalizedMetrics} />
      <DebugOutput label='Segments' content={normalizedSegments} />
    </Layout>
  )
}

export default ExperimentsNewPage
