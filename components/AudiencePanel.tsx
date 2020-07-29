import { TableCellProps } from '@material-ui/core/TableCell'
import _ from 'lodash'
import React from 'react'

import LabelValuePanel from '@/components/LabelValuePanel'
import SegmentsTable from '@/components/SegmentsTable'
import VariationsTable from '@/components/VariationsTable'
import { ExperimentFullNormalizedData, Segment, SegmentType } from '@/lib/schemas'
import * as Variations from '@/lib/variations'

/**
 * Renders the audience information of an experiment in a panel component.
 *
 * @param props.experiment - The experiment with the audience information.
 * @param props.segments - The segments to look up (aka resolve) the segment IDs
 *   of the experiment's segment assignments.
 */
function AudiencePanel({
  normalizedExperimentData,
  indexedSegments,
}: {
  normalizedExperimentData: ExperimentFullNormalizedData
  indexedSegments: Record<number, Segment>
}) {
  const normalizedExperiment = normalizedExperimentData.entities.experiments[normalizedExperimentData.result]

  const segmentAssignmentsWithSegments = Object.values(normalizedExperimentData.entities.segmentAssignments ?? []).map(
    (segmentAssignment) => {
      const segment = indexedSegments[segmentAssignment.segmentId]
      if (!segment) {
        throw new Error(
          `Can't find segment matching segmentId '${segmentAssignment.segmentId}' of segmentAssignment (${segmentAssignment.segmentAssignmentId})`,
        )
      }
      return { segmentAssignment, segment }
    },
  )

  const segmentsAssignmentsWithSegmentsByType = _.groupBy(segmentAssignmentsWithSegments, _.property('segment.type'))

  const variations = Variations.sort(Object.values(normalizedExperimentData.entities.variations))

  const data = [
    { label: 'Platform', value: normalizedExperiment.platform },
    {
      label: 'User Type',
      value: normalizedExperiment.existingUsersAllowed ? 'All users (new + existing)' : 'New users only',
    },
    {
      label: 'Variations',
      padding: 'none' as TableCellProps['padding'],
      value: <VariationsTable variations={variations} />,
    },
    {
      label: 'Segments',
      padding: 'none' as TableCellProps['padding'],
      value: (
        <>
          <SegmentsTable
            segmentAssignmentsWithSegments={segmentsAssignmentsWithSegmentsByType[SegmentType.Locale] ?? []}
            type={SegmentType.Locale}
          />
          <SegmentsTable
            segmentAssignmentsWithSegments={segmentsAssignmentsWithSegmentsByType[SegmentType.Country] ?? []}
            type={SegmentType.Country}
          />
        </>
      ),
    },
  ]
  return <LabelValuePanel data={data} title='Audience' />
}

export default AudiencePanel
