import {
  Chip,
  createStyles,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  useTheme,
} from '@material-ui/core'
import clsx from 'clsx'
import _ from 'lodash'
import MaterialTable from 'material-table'
import React from 'react'
import Plot from 'react-plotly.js'

import DatetimeText from '@/components/DatetimeText'
import { AnalysisStrategyToHuman, RecommendationWarningToHuman } from '@/lib/analyses'
import * as Experiments from '@/lib/experiments'
import { AttributionWindowSecondsToHuman } from '@/lib/metric-assignments'
import { Analysis, AnalysisStrategy, ExperimentFull, MetricAssignment, MetricBare } from '@/lib/schemas'
import * as Variations from '@/lib/variations'
import { createStaticTableOptions } from '@/utils/material-table'

import { MetricAssignmentAnalysesData } from './ExperimentResults'
import RecommendationString from './RecommendationString'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // Hide the '>' expander buttons when they are disabled
      '& .MuiIconButton-root.Mui-disabled': {
        opacity: 0,
      },
    },
    primaryChip: {
      marginTop: theme.spacing(1),
    },
  }),
)

/**
 * Render the latest analyses for the experiment for each metric assignment as a single condensed table, using only
 * the experiment's default analysis strategy.
 */
export default function CondensedLatestAnalyses({
  experiment,
  allMetricAssignmentAnalysesData,
}: {
  experiment: ExperimentFull
  allMetricAssignmentAnalysesData: MetricAssignmentAnalysesData[]
}) {
  const classes = useStyles()
  const theme = useTheme()

  // Sort the assignments for consistency and collect the data we need to render the component.
  const defaultAnalysisStrategy = Experiments.getDefaultAnalysisStrategy(experiment)

  // When will the Javascript pipe operator ever arrive... :'(
  const metricAssignmentSummaryData = allMetricAssignmentAnalysesData.map(
    ({ metricAssignment, metric, analysesByStrategyDateAsc }) => {
      const recommendations = Object.values(analysesByStrategyDateAsc)
        .map(
          (analyses) =>
            //  istanbul ignore next; We don't need to test empty analyses as we filter out all undefined values
            _.last(analyses)?.recommendation,
        )
        .filter((recommendation) => !!recommendation)
      const uniqueRecommendations = _.uniq(recommendations.map((recommendation) => JSON.stringify(recommendation)))

      return {
        metricAssignment,
        metric,
        analysesByStrategyDateAsc,
        latestDefaultAnalysis: _.last(analysesByStrategyDateAsc[defaultAnalysisStrategy]),
        recommendationConflict: uniqueRecommendations.length > 1,
      }
    },
  )

  const tableColumns = [
    {
      title: 'Metric',
      render: ({ metric, metricAssignment }: { metric: MetricBare; metricAssignment: MetricAssignment }) => (
        <>
          {metric.name}{' '}
          {metricAssignment.isPrimary && (
            <Chip label='Primary' variant='outlined' disabled className={classes.primaryChip} />
          )}
        </>
      ),
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
        fontWeight: 600,
      },
    },
    {
      title: 'Attribution window',
      render: ({ metricAssignment }: { metricAssignment: MetricAssignment }) =>
        AttributionWindowSecondsToHuman[metricAssignment.attributionWindowSeconds],
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
      },
    },
    {
      title: 'Recommendation',
      render: ({
        latestDefaultAnalysis,
        recommendationConflict,
      }: {
        latestDefaultAnalysis?: Analysis
        recommendationConflict?: boolean
      }) => {
        if (recommendationConflict) {
          return <>Manual analysis required</>
        }
        if (!latestDefaultAnalysis?.recommendation) {
          return <>Not analyzed yet</>
        }
        return <RecommendationString recommendation={latestDefaultAnalysis.recommendation} experiment={experiment} />
      },
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
      },
    },
  ]

  const DetailPanel = [
    ({
      analysesByStrategyDateAsc,
      latestDefaultAnalysis,
      metricAssignment,
      recommendationConflict,
    }: {
      analysesByStrategyDateAsc: Record<AnalysisStrategy, Analysis[]>
      latestDefaultAnalysis?: Analysis
      metricAssignment: MetricAssignment,
      recommendationConflict?: boolean
    }) => {
      return {
        render: () =>
          latestDefaultAnalysis && (
            <AnalysisDetailPanel {...{ analysesByStrategyDateAsc, latestDefaultAnalysis, metricAssignment, experiment }}/>
          ),
        disabled: !latestDefaultAnalysis || recommendationConflict,
      }
    },
  ]

  return (
    <div className={classes.root}>
      <MaterialTable
        columns={tableColumns}
        data={metricAssignmentSummaryData}
        options={createStaticTableOptions(metricAssignmentSummaryData.length)}
        onRowClick={(_event, rowData, togglePanel) => {
          const { latestDefaultAnalysis, recommendationConflict } = rowData as {
            latestDefaultAnalysis?: Analysis
            recommendationConflict?: boolean
          }
          if (togglePanel && latestDefaultAnalysis && !recommendationConflict) {
            togglePanel()
          }
        }}
        detailPanel={DetailPanel}
      />
    </div>
  )
}

const useAnalysisDetailStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2, 8),
      background: theme.palette.action.hover,
    },
    headerCell: {
      fontWeight: 'bold',
      width: '9rem',
      verticalAlign: 'top',
    },
    dataCell: {
      fontFamily: theme.custom.fonts.monospace,
    },
    plots: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
    },
    plot: {
      width: `calc(50% - ${theme.spacing(1)}px)`,
      height: 400,
    }
  }),
)

function AnalysisDetailPanel({
  latestDefaultAnalysis,
  metricAssignment,
  analysesByStrategyDateAsc,
  experiment,
}: {
  latestDefaultAnalysis: Analysis
  metricAssignment: MetricAssignment
  analysesByStrategyDateAsc: Record<AnalysisStrategy, Analysis[]>
  experiment: ExperimentFull
}) {
  const classes = useAnalysisDetailStyles()
  const theme = useTheme()

  // We hand out colors based on the order of the variant.
  // Control and Treatment should have a consistent order even across experiments so this should give good results.
  // Ideally we would add some marker to differentiate control variants
  // 
  // These come from a data pallete generator and should be visually equidistant.
  const variantColors = ['rgba(71, 27, 92, .3)', 'rgba(205, 112, 85, .3)']

  const strategy = Experiments.getDefaultAnalysisStrategy(experiment)
  const analyses = analysesByStrategyDateAsc[strategy]
  const dates = analyses.map(({ analysisDatetime })=> analysisDatetime.toISOString())

  const plotlyDataVariationGraph = [
    ...experiment.variations.flatMap((variation, index) => {
      const variationKey = `variation_${variation.variationId}`
      return [
        {
          name: `Lower Bound: ${variation.name}`,
          x: dates,
          y: analyses.map(({ metricEstimates }) => metricEstimates && metricEstimates[variationKey].bottom),
          line: { width: 0 },
          marker: { color: "444" },
          mode: "lines",
          type: 'scatter',
        },
        {
          name: `Upper Bound: ${variation.name}`,
          x: dates,
          y: analyses.map(({ metricEstimates }) => metricEstimates && metricEstimates[variationKey].top),
          fill: "tonexty", 
          fillcolor: variantColors[index], 
          line: {width: 0}, 
          marker: {color: "444"}, 
          mode: "lines", 
          type: "scatter"
        }
      ]
    })
  ]

  const plotlyDataDifferenceGraph = [
    {
      name: `Lower Bound: Difference`,
      x: dates,
      y: analyses.map(({ metricEstimates }) => metricEstimates && metricEstimates['diff'].bottom),
      line: { width: 0 },
      marker: { color: "444" },
      mode: "lines",
      type: 'scatter',
    },
    {
      name: `Upper Bound: Difference`,
      x: dates,
      y: analyses.map(({ metricEstimates }) => metricEstimates && metricEstimates['diff'].top),
      fill: "tonexty",
      fillcolor: 'rgba(0,0,0,.2)',
      line: { width: 0 },
      marker: { color: "444" },
      mode: "lines",
      type: "scatter"
    },
    {
      // zero line
      name: 'Zero Difference',
      x: dates,
      y: analyses.map(_ => 0),
      line: {
        color: 'rgba(0,0,0,.4)',
      },
      mode: 'lines',
      type: 'scatter', 
    },
    {
      name: 'Lower Bound: No Difference',
      x: dates,
      y: analyses.map(_ => -metricAssignment.minDifference),
      line: {
        color: 'rgba(0,0,0,.4)',
        dash: 'dash',
      },
      mode: 'lines',
      type: 'scatter', 
    },
    {
      name: 'Upper Bound: No Difference',
      x: dates,
      y: analyses.map(_ => metricAssignment.minDifference),
      line: {
        color: 'rgba(0,0,0,.4)',
        dash: 'dash',
      },
      mode: 'lines',
      type: 'scatter', 
    }
  ]

  const plotlyLayoutDefault = { 
    autosize: true,
    margin: {
      l: theme.spacing(10),
      r: theme.spacing(2),
      t: theme.spacing(8),
      b: theme.spacing(6),
    },
    showlegend: false,
    hoverlabel: {
      // Don't restrict name lengths
      namelength: -1,
    }
  }

  return (
    <TableContainer className={clsx(classes.root, 'analysis-detail-panel')}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell component='th' scope='row' variant='head'>
              Last analyzed
            </TableCell>
            <TableCell>
              <DatetimeText datetime={latestDefaultAnalysis.analysisDatetime} excludeTime={true} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component='th' scope='row' variant='head'>
              Analysis strategy
            </TableCell>
            <TableCell className={classes.dataCell}>
              {AnalysisStrategyToHuman[latestDefaultAnalysis.analysisStrategy]}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component='th' scope='row' variant='head'>
              Analyzed participants
            </TableCell>
            <TableCell className={classes.dataCell}>
              {latestDefaultAnalysis.participantStats.total} ({latestDefaultAnalysis.participantStats.not_final} not
              final
              {Variations.sort(experiment.variations).map(({ variationId, name }) => (
                <span key={variationId}>
                  ; {latestDefaultAnalysis.participantStats[`variation_${variationId}`]} in {name}
                </span>
              ))}
              )
            </TableCell>
          </TableRow>
          {latestDefaultAnalysis.metricEstimates && latestDefaultAnalysis.recommendation && (
            <>
              <TableRow>
                <TableCell component='th' scope='row' variant='head'>
                  Difference interval
                </TableCell>
                <TableCell className={classes.dataCell}>
                  [{_.round(latestDefaultAnalysis.metricEstimates.diff.bottom, 4)},
                  {_.round(latestDefaultAnalysis.metricEstimates.diff.top, 4)}]
                </TableCell>
              </TableRow>
              {latestDefaultAnalysis.recommendation.warnings.length > 0 && (
                <TableRow>
                  <TableCell component='th' scope='row' variant='head'>
                    Warnings
                  </TableCell>
                  <TableCell className={classes.dataCell}>
                    {latestDefaultAnalysis.recommendation.warnings.map((warning) => (
                      <div key={warning}>{RecommendationWarningToHuman[warning]}</div>
                    ))}
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
      <div className={classes.plots}>
        <Plot
          layout={{
            ...plotlyLayoutDefault,
            title: `Variation Credible Intervals`,
            yaxis: { title: 'Metric Estimates' },
          }}
          data={plotlyDataVariationGraph}
          className={classes.plot}
        />
        <Plot
          layout={{
            ...plotlyLayoutDefault,
            title: `Difference Credible Interval`,
            yaxis: { title: 'Difference Estimate' },
          }}
          data={plotlyDataDifferenceGraph}
          className={classes.plot}
        />
      </div>
    </TableContainer>
  )
}
