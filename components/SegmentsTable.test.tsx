import React from 'react'

import { Segment, SegmentAssignment, SegmentType } from '@/lib/schemas'
import { render } from '@/test-helpers/test-utils'

import SegmentsTable from './SegmentsTable'

test('renders as expected with segment names not in order', () => {
  const segmentAssignmentsWithSegments: Array<{ segment: Segment; segmentAssignment: SegmentAssignment }> = [
    {
      segment: { segmentId: 1, name: 'foo', type: SegmentType.Country },
      segmentAssignment: { segmentAssignmentId: 0, segmentId: 1, isExcluded: false },
    },
    {
      segment: { segmentId: 2, name: 'bar', type: SegmentType.Country },
      segmentAssignment: { segmentAssignmentId: 1, segmentId: 2, isExcluded: true },
    },
  ]
  const { container } = render(
    <SegmentsTable segmentAssignmentsWithSegments={segmentAssignmentsWithSegments} type={SegmentType.Country} />,
  )

  expect(container).toMatchInlineSnapshot(`
    <div>
      <table
        class="MuiTable-root"
      >
        <thead
          class="MuiTableHead-root"
        >
          <tr
            class="MuiTableRow-root MuiTableRow-head"
          >
            <th
              class="MuiTableCell-root MuiTableCell-head"
              role="columnheader"
              scope="col"
            >
              Countries
            </th>
          </tr>
        </thead>
        <tbody
          class="MuiTableBody-root"
        >
          <tr
            class="MuiTableRow-root"
          >
            <td
              class="MuiTableCell-root MuiTableCell-body"
            >
              bar
              <span
                class="makeStyles-excluded-1 makeStyles-root-2"
              >
                Excluded
              </span>
            </td>
          </tr>
          <tr
            class="MuiTableRow-root"
          >
            <td
              class="MuiTableCell-root MuiTableCell-body"
            >
              foo
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `)
})
