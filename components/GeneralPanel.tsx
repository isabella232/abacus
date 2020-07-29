import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import React from 'react'

import DatetimeText from '@/components/DatetimeText'
import LabelValuePanel from '@/components/LabelValuePanel'
import { ExperimentFullNormalized } from '@/lib/schemas'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    to: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  }),
)

/**
 * Renders the general information of an experiment in a panel component.
 *
 * @param props.experiment - The experiment with the general information.
 */
function GeneralPanel({ normalizedExperiment }: { normalizedExperiment: ExperimentFullNormalized }) {
  const classes = useStyles()
  const data = [
    { label: 'Description', value: normalizedExperiment.description },
    {
      label: 'P2 Link',
      value: (
        <a href={normalizedExperiment.p2Url} rel='noopener noreferrer' target='_blank'>
          {normalizedExperiment.p2Url}
        </a>
      ),
    },
    {
      label: 'Dates',
      value: (
        <>
          <DatetimeText datetime={normalizedExperiment.startDatetime} excludeTime />
          <span className={classes.to}>to</span>
          <DatetimeText datetime={normalizedExperiment.endDatetime} excludeTime />
        </>
      ),
    },
    { label: 'Owner', value: normalizedExperiment.ownerLogin },
  ]
  return <LabelValuePanel data={data} title='General' />
}

export default GeneralPanel
