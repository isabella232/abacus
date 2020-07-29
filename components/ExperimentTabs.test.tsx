import { normalize } from 'normalizr'
import React from 'react'

import { ExperimentFull, ExperimentFullNormalizedEntities, experimentFullNormalizrSchema } from '@/lib/schemas'
import Fixtures from '@/test-helpers/fixtures'
import { render } from '@/test-helpers/test-utils'

import ExperimentTabs from './ExperimentTabs'

test('renders expected links', () => {
  const experiment = Fixtures.createExperimentFull({
    metricAssignments: [],
    segmentAssignments: [],
  })
  const normalizedExperimentData = normalize<ExperimentFull, ExperimentFullNormalizedEntities>(
    experiment,
    experimentFullNormalizrSchema,
  )
  const normalizedExperiment = normalizedExperimentData.entities.experiments[normalizedExperimentData.result]
  const { getByText } = render(<ExperimentTabs normalizedExperiment={normalizedExperiment} tab='details' />)

  expect(getByText('Details', { selector: '.MuiTab-wrapper' })).toBeInTheDocument()
  expect(getByText('Results', { selector: '.MuiTab-wrapper' })).toBeInTheDocument()
  expect(getByText('Snippets', { selector: '.MuiTab-wrapper' })).toBeInTheDocument()
})
