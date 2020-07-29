/* eslint-disable no-irregular-whitespace */
import { render } from '@testing-library/react'
import MockDate from 'mockdate'
import { normalize } from 'normalizr'
import React from 'react'

import { createNewExperiment } from '@/lib/experiments'
import { MetricBare, metricBareNormalizrSchema, Segment, segmentNormalizrSchema } from '@/lib/schemas'
import Fixtures from '@/test-helpers/fixtures'

import ExperimentForm from './ExperimentForm'

test('renders as expected', () => {
  MockDate.set('2020-07-21')
  const metrics = Fixtures.createMetricBares(20)
  const segments = Fixtures.createSegments(20)
  const {
    entities: { metrics: indexedMetrics },
  } = normalize<MetricBare, { metrics: Record<number, MetricBare> }>(metrics, [metricBareNormalizrSchema])
  const {
    entities: { segments: indexedSegments },
  } = normalize<Segment, { segments: Record<number, Segment> }>(segments, [segmentNormalizrSchema])

  const { container } = render(
    <ExperimentForm
      indexedMetrics={indexedMetrics}
      indexedSegments={indexedSegments}
      initialExperiment={createNewExperiment()}
    />,
  )
  expect(container).toMatchSnapshot()
})

test.todo('form works as expected')
