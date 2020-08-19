import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import React, { useMemo } from 'react'

import Label from '@/components/Label'
import { AttributionWindowSecondsToHuman } from '@/lib/metric-assignments'
import * as MetricAssignments from '@/lib/metric-assignments'
import { MetricAssignment, MetricBare, MetricParameterType } from '@/lib/schemas'
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
 */
function MetricAssignmentsPanel({ metricAssignments, indexedMetrics }: { metricAssignments: MetricAssignment[]; indexedMetrics: Record<number, MetricBare> }) {
  const classes = useStyles()
  const sortedMetricAssignmentsWithMetrics = MetricAssignments.sort(metricAssignments).map(metricAssignment => ({ metricAssignment, metric: indexedMetrics[metricAssignment.metricAssignmentId] }))

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
              Attribution Window
            </TableCell>
            <TableCell component='th' variant='head'>
              Changes Expected
            </TableCell>
            <TableCell component='th' variant='head'>
              Minimum Difference
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedMetricAssignmentsWithMetrics.map(({ metric, metricAssignment }) => (
            <TableRow key={metricAssignment.metricAssignmentId}>
              <TableCell>
                {metric.name}
                {metricAssignment.isPrimary && <Label className={classes.primary} text='Primary' />}
              </TableCell>
              <TableCell>
                {AttributionWindowSecondsToHuman[metricAssignment.attributionWindowSeconds]}
              </TableCell>
              <TableCell>{formatBoolean(metricAssignment.changeExpected)}</TableCell>
              <TableCell>
                <span>
                  {metric.parameterType === MetricParameterType.Revenue
                    ? formatUsCurrencyDollar(metricAssignment.minDifference)
                    : `${metricAssignment.minDifference} pp`}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default MetricAssignmentsPanel
