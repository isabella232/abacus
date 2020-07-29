import { LinearProgress } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import debugFactory from 'debug'
import { useRouter } from 'next/router'
import { denormalize, normalize } from 'normalizr'
import { toIntOrNull } from 'qc-to_int'
import React from 'react'

import ExperimentsApi from '@/api/ExperimentsApi'
import MetricsApi from '@/api/MetricsApi'
import SegmentsApi from '@/api/SegmentsApi'
import ExperimentDetails from '@/components/ExperimentDetails'
import ExperimentTabs from '@/components/ExperimentTabs'
import Layout from '@/components/Layout'
import { ExperimentFull, ExperimentFullNormalizedEntities, experimentFullNormalizrSchema } from '@/lib/schemas'
import { useDataLoadingError, useDataSource } from '@/utils/data-loading'
import { createUnresolvingPromise, or } from '@/utils/general'

const debug = debugFactory('abacus:pages/experiments/[id].tsx')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tabs: {
      marginBottom: theme.spacing(2),
    },
  }),
)

export default function ExperimentPage() {
  const classes = useStyles()
  const router = useRouter()
  const experimentId = toIntOrNull(router.query.id)
  debug(`ExperimentPage#render ${experimentId}`)

  const {
    isLoading: experimentIsLoading,
    data: normalizedExperimentData,
    error: experimentError,
  } = useDataSource(async () => {
    if (!experimentId) {
      return createUnresolvingPromise<null>()
    }
    const experiment = await ExperimentsApi.findById(experimentId)
    const normalizedExperiment = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
      experiment,
      experimentFullNormalizrSchema,
    )
    return normalizedExperiment
  }, [experimentId])
  useDataLoadingError(experimentError, 'Experiment')
  const normalizedExperiment =
    normalizedExperimentData && normalizedExperimentData.entities.experiments[normalizedExperimentData.result]
  // Keeping this denormalized experiment here as temporary scafolding:
  const experiment =
    normalizedExperimentData &&
    denormalize(normalizedExperimentData.result, experimentFullNormalizrSchema, normalizedExperimentData.entities)

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

  const isLoading = or(experimentIsLoading, metricsIsLoading, segmentsIsLoading)

  return (
    <Layout title={`Experiment: ${experiment?.name || ''}`}>
      {isLoading ? (
        <LinearProgress />
      ) : (
        normalizedExperiment &&
        normalizedExperimentData &&
        experiment &&
        metrics &&
        segments && (
          <>
            <ExperimentTabs className={classes.tabs} normalizedExperiment={normalizedExperiment} tab='details' />
            <ExperimentDetails
              experiment={experiment}
              normalizedExperiment={normalizedExperiment}
              normalizedExperimentData={normalizedExperimentData}
              metrics={metrics}
              segments={segments}
            />
          </>
        )
      )}
    </Layout>
  )
}
