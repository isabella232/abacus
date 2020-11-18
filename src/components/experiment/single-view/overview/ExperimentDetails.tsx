import Grid from '@material-ui/core/Grid'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import debugFactory from 'debug'
import React from 'react'

import AudiencePanel from 'src/components/experiment/single-view/overview/AudiencePanel'
import ConclusionsPanel from 'src/components/experiment/single-view/overview/ConclusionsPanel'
import GeneralPanel from 'src/components/experiment/single-view/overview/GeneralPanel'
import MetricAssignmentsPanel from 'src/components/experiment/single-view/overview/MetricAssignmentsPanel'
import { ExperimentFull, MetricBare, Segment, Status, TagBare } from 'src/lib/schemas'

const debug = debugFactory('abacus:components/ExperimentDetails.tsx')

/**
 * Renders the main details of an experiment.
 */
function ExperimentDetails({
  experiment,
  metrics,
  segments,
  tags,
  experimentReloadRef,
}: {
  experiment: ExperimentFull
  metrics: MetricBare[]
  segments: Segment[]
  tags: TagBare[]
  experimentReloadRef: React.MutableRefObject<() => void>
}): JSX.Element {
  debug('ExperimentDetails#render')
  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={7}>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <GeneralPanel {...{ experiment, experimentReloadRef }} />
          </Grid>
          {isMdDown && (
            <Grid item>
              <AudiencePanel {...{ experiment, segments, tags }} />
            </Grid>
          )}
          <Grid item>
            <MetricAssignmentsPanel {...{ experiment, metrics, experimentReloadRef }} />
          </Grid>
          {(experiment.status === Status.Completed || experiment.status === Status.Disabled) && (
            <Grid item>
              <ConclusionsPanel {...{ experiment, experimentReloadRef }} />
            </Grid>
          )}
        </Grid>
      </Grid>
      {!isMdDown && (
        <Grid item lg={5}>
          <AudiencePanel {...{ experiment, segments, tags }} />
        </Grid>
      )}
    </Grid>
  )
}

export default ExperimentDetails
