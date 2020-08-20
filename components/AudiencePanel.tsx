import { TableCellProps } from '@material-ui/core/TableCell'
import _ from 'lodash'
import React from 'react'

import LabelValuePanel from '@/components/LabelValuePanel'
import SegmentsTable from '@/components/SegmentsTable'
import VariationsTable from '@/components/VariationsTable'
import { ExperimentFullNormalized, ExperimentFullNormalizedEntities, Segment, SegmentType } from '@/lib/schemas'
import * as Variations from '@/lib/variations'

/**
 * Renders the audience information of an experiment in a panel component.
 */
function AudiencePanel({
  normalizedExperiment,
  normalizedExperimentEntities,
  indexedSegments,
}: {
  normalizedExperiment: ExperimentFullNormalized
  normalizedExperimentEntities: ExperimentFullNormalizedEntities
  indexedSegments: Record<number, Segment>
}) {
  const segmentAssignmentsWithSegments = Object.values(normalizedExperimentEntities.segmentAssignments).map(
    (segmentAssignment) => {
      const segment = indexedSegments[segmentAssignment.segmentId]
      if (!segment) {
        throw new Error(
          `Could not find segment corresponding to segmentAssignment. segmentAssignmentId: '${segmentAssignment.segmentAssignmentId}'`,
        )
      }
      return { segmentAssignment, segment }
    },
  )
  const segmentAssignmentsWithSegmentsByType = _.groupBy(segmentAssignmentsWithSegments, _.property('segment.type'))

  const data = [
    { label: 'Platform', value: normalizedExperiment.platform },
    {
      label: 'User Type',
      value: normalizedExperiment.existingUsersAllowed ? 'All users (new + existing)' : 'New users only',
    },
    {
      label: 'Variations',
      padding: 'none' as TableCellProps['padding'],
      value: <VariationsTable variations={Variations.sort(Object.values(normalizedExperimentEntities.variations))} />,
    },
    {
      label: 'Segments',
      padding: 'none' as TableCellProps['padding'],
      value: (
        <>
          <SegmentsTable
            segmentAssignmentsWithSegments={segmentAssignmentsWithSegmentsByType[SegmentType.Locale] ?? []}
            type={SegmentType.Locale}
          />
          <SegmentsTable
            segmentAssignmentsWithSegments={segmentAssignmentsWithSegmentsByType[SegmentType.Country] ?? []}
            type={SegmentType.Country}
          />
        </>
      ),
    },
  ]
  return <LabelValuePanel data={data} title='Audience' />
}

export default AudiencePanel
