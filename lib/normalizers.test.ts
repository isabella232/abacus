import Fixtures from '@/test-helpers/fixtures'

import * as Normalizers from './normalizers'

describe('lib/normalizers.ts module', () => {
  describe('indexSegments', () => {
    it('indexes an empty array', () => {
      expect(Normalizers.indexMetrics([])).toEqual({})
    })

    it('indexes an non-empty array', () => {
      const metrics = Fixtures.createMetricBares()
      expect(Normalizers.indexMetrics(metrics)).toEqual({ 1: metrics[0], 2: metrics[1], 3: metrics[2] })
    })
  })

  describe('indexSegments', () => {
    it('indexes an empty array', () => {
      expect(Normalizers.indexSegments([])).toEqual({})
    })

    it('indexes an non-empty array', () => {
      const segments = Fixtures.createSegments(2)
      expect(Normalizers.indexSegments(segments)).toEqual({ 1: segments[0], 2: segments[1] })
    })
  })

  describe('normalizeExperiment', () => {
    it('normalizes an empty experiment', () => {
      const experiment = { experimentId: 0 }
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore; This is just for minimal testing
      expect(Normalizers.normalizeExperiment(experiment)).toEqual([
        experiment,
        {
          experiments: { 0: experiment },
          metricAssignments: {},
          segmentAssignments: {},
          variations: {},
        },
      ])
    })
  })
})
