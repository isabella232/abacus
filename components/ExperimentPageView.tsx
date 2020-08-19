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
import { normalizeExperiment } from '@/lib/normalizers'
import { Analysis, ExperimentFull, ExperimentFullNormalized, ExperimentFullNormalizedData } from '@/lib/schemas'
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
  } = useDataSource(async (): Promise<[ExperimentFull, ExperimentFullNormalized, ExperimentFullNormalizedData]> => {
    if (!experimentId) {
      return createUnresolvingPromise<[ExperimentFull, ExperimentFullNormalized, ExperimentFullNormalizedData]>()
    }

    const experiment = await ExperimentsApi.findById(experimentId)
    const [normalizedExperiment, normalizedExperimentData] = normalizeExperiment(experiment)
    return [experiment, normalizedExperiment, normalizedExperimentData]
  }, [experimentId])
  useDataLoadingError(experimentError, 'Experiment')
  let experiment, normalizedExperiment, normalizedExperimentData
  if (experimentData) {
    ;[experiment, normalizedExperiment, normalizedExperimentData] = experimentData
  }

  const { isLoading: metricsIsLoading, data: metrics, error: metricsError } = useDataSource(
    () => MetricsApi.findAll(),
    [],
  )
  useDataLoadingError(metricsError, 'Metrics')

  const { isLoading: segmentsIsLoading, data: segments, error: segmentsError } = useDataSource(
    () => SegmentsApi.findAll(),
    [],
  )
  useDataLoadingError(segmentsError, 'Segments')

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
            normalizedExperimentData &&
            metrics &&
            segments &&
            analyses && (
              <>
                {view === ExperimentView.Details && <ExperimentDetails {...{ experiment, normalizedExperiment, normalizedExperimentData, metrics, segments }} />}
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
