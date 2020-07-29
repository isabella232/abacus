import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import _ from 'lodash'
import React from 'react'

import Label from '@/components/Label'
import { Segment, SegmentAssignment, SegmentType } from '@/lib/schemas'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    excluded: {
      marginLeft: theme.spacing(1),
    },
  }),
)

/**
 * Mapping from SegmentType to human-friendly values.
 */
const SegmentTypeToHeading = {
  [SegmentType.Country]: 'Countries',
  [SegmentType.Locale]: 'Locales',
}

/**
 * Renders the segments of a particular type.
 *
 * @param props.resolvedSegmentAssignments - The segment assignments with the
 *   segment IDs resolved to the actual segment.
 * @param props.type - The segment type the segment assignments represent.
 */
function SegmentsTable({
  segmentAssignmentsWithSegments,
  type,
}: {
  segmentAssignmentsWithSegments: {
    segmentAssignment: SegmentAssignment
    segment: Segment
  }[]
  type: SegmentType
}) {
  const sortedSegmentAssignmentsWithSegments = _.orderBy(segmentAssignmentsWithSegments, [_.property('segment.name')])

  const classes = useStyles()
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell component='th' variant='head'>
            {SegmentTypeToHeading[type]}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedSegmentAssignmentsWithSegments.length === 0 ? (
          <TableRow>
            <TableCell>All {type === SegmentType.Country ? 'countries' : 'locales'} included</TableCell>
          </TableRow>
        ) : (
          sortedSegmentAssignmentsWithSegments.map(({ segmentAssignment, segment }) => (
            <TableRow key={segment.segmentId}>
              <TableCell>
                {segment.name}
                {segmentAssignment.isExcluded && <Label className={classes.excluded} text='Excluded' />}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default SegmentsTable
