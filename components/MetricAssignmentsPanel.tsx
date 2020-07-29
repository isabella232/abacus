import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import React from 'react'

import Label from '@/components/Label'
import { AttributionWindowSecondsToHuman } from '@/lib/metric-assignments'
import * as MetricAssignments from '@/lib/metric-assignments'
import { ExperimentFullNormalizedData, MetricBare } from '@/lib/schemas'
import { formatBoolean, formatUsCurrencyDollar } from '@/utils/formatters'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    primary: {
      marginLeft: theme.spacing(1),
    },
    title: {
      padding: theme.spacing(1, 2),
    },
  }),
)

/**
 * Renders the assigned metric information of an experiment in a panel component.
 *
 * @param props.experiment - The experiment with the metric assignment information.
 * @param props.metrics - The metrics to look up (aka resolve) the metric IDs of the
 *   experiment's metric assignments.
 */
function MetricAssignmentsPanel({
  normalizedExperimentData,
  indexedMetrics,
}: {
  normalizedExperimentData: ExperimentFullNormalizedData
  indexedMetrics: Record<number, MetricBare>
}) {
  const classes = useStyles()

  const sortedMetricAssignments = MetricAssignments.sort(
    Object.values(normalizedExperimentData.entities.metricAssignments),
  )

  const metricAssignmentsWithMetrics = sortedMetricAssignments.map((metricAssignment) => {
    const metric = indexedMetrics[metricAssignment.metricId]
    if (!metric) {
      throw new Error(
        `Can't find metric matching metricId '${metricAssignment.metricId}' of metricAssignment (${metricAssignment.metricAssignmentId})`,
      )
    }
    return { metricAssignment, metric }
  })

  return (
    <Paper>
      <Typography className={classes.title} color='textPrimary' variant='h3'>
        Metrics
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell component='th' variant='head'>
              Name
            </TableCell>
            <TableCell component='th' variant='head'>
              Minimum Difference
            </TableCell>
            <TableCell component='th' variant='head'>
              Attribution Window
            </TableCell>
            <TableCell component='th' variant='head'>
              Changes Expected
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metricAssignmentsWithMetrics.map(({ metricAssignment, metric }) => (
            <TableRow key={metricAssignment.metricAssignmentId}>
              <TableCell>
                {metric.name}
                {metricAssignment.isPrimary && <Label className={classes.primary} text='Primary' />}
              </TableCell>
              <TableCell>
                <span>
                  {metric.parameterType === 'revenue'
                    ? formatUsCurrencyDollar(metricAssignment.minDifference)
                    : `${metricAssignment.minDifference} pp`}
                </span>
              </TableCell>
              <TableCell>{AttributionWindowSecondsToHuman[metricAssignment.attributionWindowSeconds]}</TableCell>
              <TableCell>{formatBoolean(metricAssignment.changeExpected)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default MetricAssignmentsPanel
