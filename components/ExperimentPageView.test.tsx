/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/ban-ts-ignore */
import { screen, waitFor } from '@testing-library/react'
import _ from 'lodash'
import MockDate from 'mockdate'
import * as notistack from 'notistack'
import React from 'react'

import AnalysesApi from '@/api/AnalysesApi'
import ExperimentsApi from '@/api/ExperimentsApi'
import MetricsApi from '@/api/MetricsApi'
import SegmentsApi from '@/api/SegmentsApi'
import { Status } from '@/lib/schemas'
import Fixtures from '@/test-helpers/fixtures'
import { render } from '@/test-helpers/test-utils'

import ExperimentPageView, { ExperimentView } from './ExperimentPageView'

MockDate.set('2020-07-21')

jest.mock('@/api/ExperimentsApi')
const mockedExperimentsApi = ExperimentsApi as jest.Mocked<typeof ExperimentsApi>

jest.mock('@/api/MetricsApi')
const mockedMetricsApi = MetricsApi as jest.Mocked<typeof MetricsApi>

jest.mock('@/api/SegmentsApi')
const mockedSegmentsApi = SegmentsApi as jest.Mocked<typeof SegmentsApi>

jest.mock('@/api/AnalysesApi')
const mockedAnalysesApi = AnalysesApi as jest.Mocked<typeof AnalysesApi>

jest.mock('notistack')
const mockedNotistack = notistack as jest.Mocked<typeof notistack>
mockedNotistack.useSnackbar.mockImplementation(() => ({
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
}))

const renderExperimentPageView = (status: Status) => {
  const experiment = Fixtures.createExperimentFull({ status })
  mockedExperimentsApi.findById.mockImplementationOnce(async () => experiment)

  const metrics = Fixtures.createMetricBares(10)
  mockedMetricsApi.findAll.mockImplementationOnce(async () => metrics)

  const segments = Fixtures.createSegments(10)
  mockedSegmentsApi.findAll.mockImplementationOnce(async () => segments)

  const analyses = Fixtures.createAnalyses()
  mockedAnalysesApi.findByExperimentId.mockImplementationOnce(async () => analyses)

  return render(
    <ExperimentPageView experimentId={experiment.experimentId} view={ExperimentView.Overview} debugMode={false} />,
  )
}

/**
 * Gets an map of button states
 * - true: visible and enabled
 * - false: visible and disabled
 * - null: not on screen
 */
const getButtonStates = () => {
  const editInWizard = screen.getByRole('link', { name: /Edit In Wizard/ })
  const run = screen.getByRole('button', { name: /Run/ })
  const disable = screen.getByRole('button', { name: /Disable/ })
  const generalPanelEdit = screen.getByRole('button', { name: /Edit Experiment General Data/ })
  const assignMetric = screen.getByRole('button', { name: /Assign Metric/ })
  const conclusionEdit = screen.queryByRole('button', { name: /Edit Conclusion/ })

  return {
    editInWizard: !editInWizard.classList.contains('Mui-disabled'),
    run: !run.hasAttribute('disabled'),
    disable: !disable.hasAttribute('disabled'),
    generalPanelEdit: !generalPanelEdit.hasAttribute('disabled'),
    assignMetric: !assignMetric.hasAttribute('disabled'),
    conclusionEdit: conclusionEdit && !conclusionEdit.hasAttribute('disabled'),
  }
}

test('staging experiment shows correct features enabled in overview', async () => {
  const { container: _container } = renderExperimentPageView(Status.Staging)

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))

  expect(getButtonStates()).toEqual({
    editInWizard: true,
    run: true,
    disable: true,
    generalPanelEdit: false,
    assignMetric: false,
    conclusionEdit: null,
  })
})

test('running experiment shows correct features enabled in overview', async () => {
  const { container: _container } = renderExperimentPageView(Status.Running)

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))

  expect(getButtonStates()).toEqual({
    editInWizard: false,
    run: false,
    disable: true,
    generalPanelEdit: true,
    assignMetric: true,
    conclusionEdit: null,
  })
})

test('completed experiment shows correct features enabled in overview', async () => {
  const { container: _container } = renderExperimentPageView(Status.Completed)

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))

  expect(getButtonStates()).toEqual({
    editInWizard: false,
    run: false,
    disable: true,
    generalPanelEdit: true,
    assignMetric: true,
    conclusionEdit: true,
  })
})

test('disabled experiment shows correct features enabled in overview', async () => {
  const { container: _container } = renderExperimentPageView(Status.Disabled)

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))

  expect(getButtonStates()).toEqual({
    editInWizard: false,
    run: false,
    disable: false,
    generalPanelEdit: true,
    assignMetric: true,
    conclusionEdit: true,
  })
})
