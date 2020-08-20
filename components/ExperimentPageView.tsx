// istanbul ignore file; Even though it sits with components this is a "page" component
import { createStyles, LinearProgress, makeStyles, Theme } from '@material-ui/core'
import _ from 'lodash'
import React from 'react'

import AnalysesApi from '@/api/AnalysesApi'
import ExperimentsApi from '@/api/ExperimentsApi'
import MetricsApi from '@/api/MetricsApi'
import SegmentsApi from '@/api/SegmentsApi'
import ExperimentResults from '@/components/experiment-results/ExperimentResults'
import ExperimentDetails from '@/components/ExperimentDetails'
import ExperimentTabs from '@/components/ExperimentTabs'
import Layout from '@/components/Layout'
import { indexMetrics, indexSegments, normalizeExperiment } from '@/lib/normalizers'
import { Analysis, ExperimentFull, ExperimentFullNormalized, ExperimentFullNormalizedEntities } from '@/lib/schemas'
import { useDataLoadingError, useDataSource } from '@/utils/data-loading'
import { createUnresolvingPromise, or } from '@/utils/general'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    viewTabs: {
      marginBottom: theme.spacing(2),
    },
  }),
)

export enum ExperimentView {
  Details = 'details',
  Results = 'results',
  Snippets = 'snippets',
}

export default function ExperimentPageView({
  view,
  experimentId,
  debugMode,
}: {
  view: ExperimentView
  experimentId: number
  debugMode: boolean
}) {
  const classes = useStyles()

  const {
    isLoading: experimentIsLoading,
    data: experimentData,
    error: experimentError,
  } = useDataSource(async (): Promise<[ExperimentFull, ExperimentFullNormalized, ExperimentFullNormalizedEntities]> => {
    if (!experimentId) {
      return createUnresolvingPromise<[ExperimentFull, ExperimentFullNormalized, ExperimentFullNormalizedEntities]>()
    }

    const experiment = await ExperimentsApi.findById(experimentId)
    const [normalizedExperiment, normalizedExperimentEntities] = normalizeExperiment(experiment)
    return [experiment, normalizedExperiment, normalizedExperimentEntities]
  }, [experimentId])
  useDataLoadingError(experimentError, 'Experiment')
  let experiment, normalizedExperiment, normalizedExperimentEntities
  if (experimentData) {
    ;[experiment, normalizedExperiment, normalizedExperimentEntities] = experimentData
  }

  const { isLoading: metricsIsLoading, data: indexedMetrics, error: metricsError } = useDataSource(
    async () => indexMetrics(await MetricsApi.findAll()),
    [],
  )
  useDataLoadingError(metricsError, 'Metrics')
  const metrics = indexedMetrics && Object.values(indexedMetrics)

  const { isLoading: segmentsIsLoading, data: indexedSegments, error: segmentsError } = useDataSource(
    async () => indexSegments(await SegmentsApi.findAll()),
    [],
  )
  useDataLoadingError(segmentsError, 'Segments')
  const segments = indexedSegments && Object.values(indexedSegments)

  const { isLoading: analysesIsLoading, data: analyses, error: analysesError } = useDataSource(
    () => (experimentId ? AnalysesApi.findByExperimentId(experimentId) : createUnresolvingPromise<Analysis[]>()),
    [experimentId],
  )
  useDataLoadingError(analysesError, 'Analyses')

  const isLoading = or(experimentIsLoading, metricsIsLoading, segmentsIsLoading, analysesIsLoading)

  return (
    <Layout title={`Experiment: ${experiment?.name || ''}`}>
      <>
        {/* TODO: Inline this. */}
        <ExperimentTabs experimentId={experimentId} tab={view} className={classes.viewTabs} />
        {isLoading ? (
          <LinearProgress />
        ) : (
          experiment &&
          normalizedExperiment &&
          normalizedExperimentEntities &&
          indexedMetrics &&
          indexedSegments &&
          metrics &&
          segments &&
          analyses && (
            <>
              {view === ExperimentView.Details && (
                <ExperimentDetails
                  {...{ normalizedExperiment, normalizedExperimentEntities, indexedMetrics, indexedSegments }}
                />
              )}
              {view === ExperimentView.Results && (
                <ExperimentResults {...{ experiment, metrics, analyses, debugMode }} />
              )}
            </>
          )
        )}
      </>
    </Layout>
  )
}
