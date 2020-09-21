import _ from 'lodash'
import React, { useMemo } from 'react'

import DebugOutput from '@/components/DebugOutput'
import * as Experiments from '@/lib/experiments'
import { Analysis, ExperimentFull, MetricBare, MetricAssignment, AnalysisStrategy } from '@/lib/schemas'

import CondensedLatestAnalyses from './CondensedLatestAnalyses'
import FullLatestAnalyses from './FullLatestAnalyses'
import ParticipantCounts from './ParticipantCounts'
import { indexMetrics } from '@/lib/normalizers'

export type MetricAssignmentAnalysesData = { 
  metricAssignment: MetricAssignment, 
  metric: MetricBare,
  analysesByStrategy: Record<AnalysisStrategy, Analysis[]> 
}

/**
 * Main component for summarizing experiment results.
 */
export default function ExperimentResults({
  analyses,
  experiment,
  metrics,
  debugMode,
}: {
  analyses: Analysis[]
  experiment: ExperimentFull
  metrics: MetricBare[]
  debugMode?: boolean
}) {
  const indexedMetrics = indexMetrics(metrics)
  const metricAssignmentIdToLatestAnalyses = useMemo(
    () =>
      _.mapValues(_.groupBy(analyses, 'metricAssignmentId'), (metricAnalyses) => {
        metricAnalyses = _.orderBy(metricAnalyses, ['analysisDatetime'], ['desc'])
        return _.sortBy(
          _.filter(metricAnalyses, ['analysisDatetime', metricAnalyses[0].analysisDatetime]),
          'analysisStrategy',
        )
      }),
    [analyses],
  )

  const analysesByMetricAssignmentId = _.groupBy(analyses, 'metricAssignmentId')
  const allMetricAssignmentAnalysisData: MetricAssignmentAnalysesData[] =
      experiment.metricAssignments.map((metricAssignment) => {
        const metricAssignmentAnalyses = analysesByMetricAssignmentId[metricAssignment.metricAssignmentId]
        return {
          metricAssignment,
          metric: indexedMetrics[metricAssignment.metricId],
          analysesByStrategy: _.groupBy(metricAssignmentAnalyses, 'analysisStrategy') as Record<AnalysisStrategy, Analysis[]>
        }
      })

  if (analyses.length === 0) {
    return <p>No analyses yet for {experiment.name}.</p>
  }

  if (debugMode) {
    return (
      <>
        <div className='analysis-participant-counts'>
          <h3>Participant counts for the primary metric</h3>
          <ParticipantCounts
            experiment={experiment}
            latestPrimaryMetricAnalyses={
              metricAssignmentIdToLatestAnalyses[Experiments.getPrimaryMetricAssignmentId(experiment) as number]
            }
          />
        </div>

        <div className='analysis-latest-results'>
          <h3>Latest results by metric</h3>
          <FullLatestAnalyses
            experiment={experiment}
            indexedMetrics={indexedMetrics}
            metricAssignmentIdToLatestAnalyses={metricAssignmentIdToLatestAnalyses}
          />
        </div>

        <p>Found {analyses.length} analysis objects in total.</p>
        <DebugOutput label={`All analysis objects (${analyses.length})`} content={analyses} className='debug-json' />
      </>
    )
  }

  return (
    <div className='analysis-latest-results'>
      <CondensedLatestAnalyses
        experiment={experiment}
        indexedMetrics={indexedMetrics}
        metricAssignmentIdToLatestAnalyses={metricAssignmentIdToLatestAnalyses}
      />
    </div>
  )
}
