import Fixtures from '@/test-helpers/fixtures'

import * as Experiments from './experiments'
import { normalizeExperiment } from './normalizers'
import { AnalysisStrategy } from './schemas'

describe('lib/experiments.ts module', () => {
  describe('getPrimaryMetricAssignmentId', () => {
    it('returns the primary assignment ID when it exists', () => {
      expect(Experiments.getPrimaryMetricAssignmentId(Fixtures.createExperimentFull())).toBe(123)
    })

    it('returns undefined when no primary assignment ID exists', () => {
      expect(
        Experiments.getPrimaryMetricAssignmentId(Fixtures.createExperimentFull({ metricAssignments: [] })),
      ).toBeNull()
    })
  })

  describe('hasConclusionData', () => {
    it('should return true if at least one piece of conclusion data is set', () => {
      expect(
        Experiments.hasConclusionData(
          normalizeExperiment(
            Fixtures.createExperimentFull({
              conclusionUrl: 'https://betterexperiments.wordpress.com/experiment_1/conclusion',
            }),
          )[0],
        ),
      ).toBe(true)
      expect(
        Experiments.hasConclusionData(
          normalizeExperiment(Fixtures.createExperimentFull({ deployedVariationId: 1 }))[0],
        ),
      ).toBe(true)
      expect(
        Experiments.hasConclusionData(
          normalizeExperiment(Fixtures.createExperimentFull({ endReason: 'Ran its course.' }))[0],
        ),
      ).toBe(true)
    })

    it('should return false if no conclusion data is set', () => {
      expect(Experiments.hasConclusionData(normalizeExperiment(Fixtures.createExperimentFull())[0])).toBe(false)
    })
  })

  describe('getDefaultAnalysisSummary', () => {
    it('returns the correct strategy based on the exposureEvents', () => {
      expect(Experiments.getDefaultAnalysisStrategy(Fixtures.createExperimentFull({ exposureEvents: null }))).toBe(
        AnalysisStrategy.MittNoSpammersNoCrossovers,
      )
      expect(
        Experiments.getDefaultAnalysisStrategy(Fixtures.createExperimentFull({ exposureEvents: [{ event: 'ev1' }] })),
      ).toBe(AnalysisStrategy.PpNaive)
    })
  })

  describe('createNewExperiment', () => {
    it('should return a new experiment', () => {
      expect(Experiments.createInitialExperiment()).toMatchInlineSnapshot(`
        Object {
          "description": "",
          "endDatetime": "",
          "existingUsersAllowed": "true",
          "metricAssignments": Array [],
          "name": "",
          "ownerLogin": "",
          "p2Url": "",
          "platform": "wpcom",
          "segmentAssignments": Array [],
          "startDatetime": "",
          "variations": Array [
            Object {
              "allocatedPercentage": 50,
              "isDefault": true,
              "name": "control",
            },
            Object {
              "allocatedPercentage": 50,
              "isDefault": false,
              "name": "treatment",
            },
          ],
        }
      `)
    })
  })
})
