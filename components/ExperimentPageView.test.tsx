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

test('staging experiment shows correct features enabled in overview', async () => {
  const experiment = Fixtures.createExperimentFull({ status: Status.Staging })
  mockedExperimentsApi.findById.mockImplementationOnce(async () => experiment)

  const metrics = Fixtures.createMetricBares(10)
  mockedMetricsApi.findAll.mockImplementationOnce(async () => metrics)

  const segments = Fixtures.createSegments(10)
  mockedSegmentsApi.findAll.mockImplementationOnce(async () => segments)

  const analyses = Fixtures.createAnalyses()
  mockedAnalysesApi.findByExperimentId.mockImplementationOnce(async () => analyses)

  const { container } = render(
    <ExperimentPageView experimentId={experiment.experimentId} view={ExperimentView.Overview} debugMode={false} />,
  )

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))
  expect(container).toMatchSnapshot()

  const editInWizard = screen.getByRole('link', { name: /Edit In Wizard/ })
  const run = screen.getByRole('button', { name: /Run/ })
  const disable = screen.getByRole('button', { name: /Disable/ })
  const generalPanelEdit = screen.getByRole('button', { name: /Edit Experiment General Data/ })
  const assignMetric = screen.getByRole('button', { name: /Assign Metric/ })
  const conclusionEdit = screen.queryByRole('button', { name: /Edit Conclusion/ })

  expect(editInWizard.classList.contains('Mui-disabled')).toBe(false)
  expect(run.hasAttribute('disabled')).toBe(false)
  expect(disable.hasAttribute('disabled')).toBe(false)
  expect(generalPanelEdit.hasAttribute('disabled')).toBe(true)
  expect(assignMetric.hasAttribute('disabled')).toBe(true)
  expect(conclusionEdit).toBeNull()
})

test('running experiment shows correct features enabled in overview', async () => {
  const experiment = Fixtures.createExperimentFull({ status: Status.Running })
  mockedExperimentsApi.findById.mockImplementationOnce(async () => experiment)

  const metrics = Fixtures.createMetricBares(10)
  mockedMetricsApi.findAll.mockImplementationOnce(async () => metrics)

  const segments = Fixtures.createSegments(10)
  mockedSegmentsApi.findAll.mockImplementationOnce(async () => segments)

  const analyses = Fixtures.createAnalyses()
  mockedAnalysesApi.findByExperimentId.mockImplementationOnce(async () => analyses)

  const { container } = render(
    <ExperimentPageView experimentId={experiment.experimentId} view={ExperimentView.Overview} debugMode={false} />,
  )

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))
  expect(container).toMatchSnapshot()

  const editInWizard = screen.getByRole('link', { name: /Edit In Wizard/ })
  const run = screen.getByRole('button', { name: /Run/ })
  const disable = screen.getByRole('button', { name: /Disable/ })
  const generalPanelEdit = screen.getByRole('button', { name: /Edit Experiment General Data/ })
  const assignMetric = screen.getByRole('button', { name: /Assign Metric/ })
  const conclusionEdit = screen.queryByRole('button', { name: /Edit Conclusion/ })

  expect(editInWizard.classList.contains('Mui-disabled')).toBe(true)
  expect(run.hasAttribute('disabled')).toBe(true)
  expect(disable.hasAttribute('disabled')).toBe(false)
  expect(generalPanelEdit.hasAttribute('disabled')).toBe(false)
  expect(assignMetric.hasAttribute('disabled')).toBe(false)
  expect(conclusionEdit).toBeNull()
})

test('completed experiment shows correct features enabled in overview', async () => {
  const experiment = Fixtures.createExperimentFull({ status: Status.Completed })
  mockedExperimentsApi.findById.mockImplementationOnce(async () => experiment)

  const metrics = Fixtures.createMetricBares(10)
  mockedMetricsApi.findAll.mockImplementationOnce(async () => metrics)

  const segments = Fixtures.createSegments(10)
  mockedSegmentsApi.findAll.mockImplementationOnce(async () => segments)

  const analyses = Fixtures.createAnalyses()
  mockedAnalysesApi.findByExperimentId.mockImplementationOnce(async () => analyses)

  const { container } = render(
    <ExperimentPageView experimentId={experiment.experimentId} view={ExperimentView.Overview} debugMode={false} />,
  )

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))
  expect(container).toMatchSnapshot()

  const editInWizard = screen.getByRole('link', { name: /Edit In Wizard/ })
  const run = screen.getByRole('button', { name: /Run/ })
  const disable = screen.getByRole('button', { name: /Disable/ })
  const generalPanelEdit = screen.getByRole('button', { name: /Edit Experiment General Data/ })
  const assignMetric = screen.getByRole('button', { name: /Assign Metric/ })
  const conclusionEdit = screen.getByRole('button', { name: /Edit Conclusion/ })

  expect(editInWizard.classList.contains('Mui-disabled')).toBe(true)
  expect(run.hasAttribute('disabled')).toBe(true)
  expect(disable.hasAttribute('disabled')).toBe(false)
  expect(generalPanelEdit.hasAttribute('disabled')).toBe(false)
  expect(assignMetric.hasAttribute('disabled')).toBe(false)
  expect(conclusionEdit.hasAttribute('disabled')).toBe(false)
})

test('disabled experiment shows correct features enabled in overview', async () => {
  const experiment = Fixtures.createExperimentFull({ status: Status.Disabled })
  mockedExperimentsApi.findById.mockImplementationOnce(async () => experiment)

  const metrics = Fixtures.createMetricBares(10)
  mockedMetricsApi.findAll.mockImplementationOnce(async () => metrics)

  const segments = Fixtures.createSegments(10)
  mockedSegmentsApi.findAll.mockImplementationOnce(async () => segments)

  const analyses = Fixtures.createAnalyses()
  mockedAnalysesApi.findByExperimentId.mockImplementationOnce(async () => analyses)

  const { container } = render(
    <ExperimentPageView experimentId={experiment.experimentId} view={ExperimentView.Overview} debugMode={false} />,
  )

  await waitFor(() => screen.getByRole('button', { name: /Assign Metric/ }))
  expect(container).toMatchSnapshot()

  const editInWizard = screen.getByRole('link', { name: /Edit In Wizard/ })
  const run = screen.getByRole('button', { name: /Run/ })
  const disable = screen.getByRole('button', { name: /Disable/ })
  const generalPanelEdit = screen.getByRole('button', { name: /Edit Experiment General Data/ })
  const assignMetric = screen.getByRole('button', { name: /Assign Metric/ })
  const conclusionEdit = screen.getByRole('button', { name: /Edit Conclusion/ })

  expect(editInWizard.classList.contains('Mui-disabled')).toBe(true)
  expect(run.hasAttribute('disabled')).toBe(true)
  expect(disable.hasAttribute('disabled')).toBe(true)
  expect(generalPanelEdit.hasAttribute('disabled')).toBe(false)
  expect(assignMetric.hasAttribute('disabled')).toBe(false)
  expect(conclusionEdit.hasAttribute('disabled')).toBe(false)
})
