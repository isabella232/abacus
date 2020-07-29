import { normalize } from 'normalizr'
import React from 'react'

import RenderErrorBoundary from '@/components/RenderErrorBoundary'
import {
  ExperimentFull,
  ExperimentFullNormalizedEntities,
  experimentFullNormalizrSchema,
  Segment,
  segmentNormalizrSchema,
} from '@/lib/schemas'
import Fixtures from '@/test-helpers/fixtures'
import { render } from '@/test-helpers/test-utils'

import AudiencePanel from './AudiencePanel'

test('renders as expected with no segment assignments', () => {
  const experiment = Fixtures.createExperimentFull()
  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const { container } = render(
    <AudiencePanel normalizedExperimentData={normalizedExperimentData} indexedSegments={{}} />,
  )

  expect(container).toMatchSnapshot()
})

test('renders as expected with existing users allowed', () => {
  const experiment = Fixtures.createExperimentFull({
    existingUsersAllowed: true,
  })
  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const { container } = render(
    <AudiencePanel normalizedExperimentData={normalizedExperimentData} indexedSegments={{}} />,
  )

  expect(container).toMatchSnapshot()
})

test('renders as expected with all segments resolvable', () => {
  const segments = Fixtures.createSegments(5)
  const experiment = Fixtures.createExperimentFull({
    segmentAssignments: [
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 101, segmentId: 1 }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 102, segmentId: 2, isExcluded: true }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 103, segmentId: 3, isExcluded: true }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 104, segmentId: 4 }),
    ],
  })
  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const {
    entities: { segments: indexedSegments },
  } = normalize<Segment, { segments: Record<number, Segment> }>(segments, [segmentNormalizrSchema])
  const { container } = render(
    <AudiencePanel normalizedExperimentData={normalizedExperimentData} indexedSegments={indexedSegments} />,
  )

  expect(container).toMatchSnapshot()
})

test('throws an error when some segments not resolvable', () => {
  const segments = Fixtures.createSegments(5)
  const experiment = Fixtures.createExperimentFull({
    segmentAssignments: [
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 101, segmentId: 1 }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 102, segmentId: 2, isExcluded: true }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 103, segmentId: 3, isExcluded: true }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 104, segmentId: 4 }),
      Fixtures.createSegmentAssignment({ segmentAssignmentId: 110, segmentId: 10 }),
    ],
  })

  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const {
    entities: { segments: indexedSegments },
  } = normalize<Segment, { segments: Record<number, Segment> }>(segments, [segmentNormalizrSchema])

  // Note: This console.error spy is mainly used to suppress the output that the
  // `render` function outputs.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation(() => {})
  try {
    render(
      <RenderErrorBoundary>
        {() => <AudiencePanel normalizedExperimentData={normalizedExperimentData} indexedSegments={indexedSegments} />}
      </RenderErrorBoundary>,
    )
    expect(false).toBe(true) // Should never be reached
  } catch (err) {
    expect(consoleErrorSpy).toHaveBeenCalled()
  } finally {
    consoleErrorSpy.mockRestore()
  }
})
