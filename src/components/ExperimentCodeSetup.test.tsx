/* eslint-disable @typescript-eslint/require-await,@typescript-eslint/ban-ts-comment */
import { act, render, screen } from '@testing-library/react'
import React from 'react'

import { ExperimentFull, Platform } from '../lib/schemas'
import ExperimentCodeSetup from './ExperimentCodeSetup'

// @ts-ignore: only pass the props required
const minimalExperiment: ExperimentFull = {
  name: 'test',
  variations: [
    {
      name: 'control',
      allocatedPercentage: 50,
      isDefault: true,
      variationId: 1,
    },
    {
      name: 'treatment',
      allocatedPercentage: 50,
      isDefault: false,
      variationId: 2,
    },
  ],
  platform: Platform.Wpcom,
  experimentId: 1,
}

test('renders as expected', () => {
  const { container } = render(<ExperimentCodeSetup experiment={minimalExperiment} />)

  expect(container).toMatchSnapshot()
})

test('clicking a tab does something', () => {
  const { container } = render(<ExperimentCodeSetup experiment={minimalExperiment} />)
  act(() => {
    const tab = screen.getByText('Logged Out Homepages')
    tab.click()
  })
  expect(container).toMatchSnapshot()
})
