// Schema documentation lives at:
// https://app.swaggerhub.com/apis/yanir/experiments/0.1.0

import * as dateFns from 'date-fns'
import _ from 'lodash'
import * as yup from 'yup'

const idSchema = yup.number().integer().positive()
export const nameSchema = yup
  .string()
  .max(128)
  .matches(/^[a-z][a-z0-9_]*[a-z0-9]$/, 'This field must use a basic snake_case.')
const dateSchema = yup
  .date()
  // As yup's default transform sets a local timezone and we want it to be in UTC:
  .transform(function (_value, originalValue) {
    return new Date(originalValue)
  })

export const eventSchema = yup
  .object({
    event: yup.string().defined(),
    props: yup.mixed().notRequired(),
  })
  .defined()
  .camelCase()
export type Event = yup.InferType<typeof eventSchema>

export const eventNewSchema = yup
  .object({
    event: yup.string().defined(),
    props: yup.array(yup.object({ key: yup.string().defined(), value: yup.string().defined() }).defined()).defined(),
  })
  .defined()
  .camelCase()
export type EventNew = yup.InferType<typeof eventNewSchema>

export enum TransactionTypes {
  NewPurchase = 'new purchase',
  Recurring = 'recurring',
  Cancellation = 'cancellation',
  StopRecurring = 'stop recurring',
  UpdateCard = 'update card',
  Refund = 'refund',
  StartTrial = 'start trial',
  StartRecurring = 'start recurring',
  TransferOut = 'transfer out',
  TransferIn = 'transfer in',
  Reactivation = 'reactivation',
}

export const metricRevenueParamsSchema = yup
  .object({
    refundDays: yup.number().integer().positive().defined(),
    productSlugs: yup.array(yup.string().defined()).defined(),
    transactionTypes: yup.array(yup.string().oneOf(Object.values(TransactionTypes)).defined()),
  })
  .defined()
  .camelCase()
export type MetricRevenueParams = yup.InferType<typeof metricRevenueParamsSchema>

export enum MetricParameterType {
  Conversion = 'conversion',
  Revenue = 'revenue',
}

export const metricBareSchema = yup
  .object({
    metricId: idSchema.defined(),
    name: nameSchema.defined(),
    description: yup.string().defined(),
    parameterType: yup.string().oneOf(Object.values(MetricParameterType)).defined(),
  })
  .defined()
  .camelCase()
export type MetricBare = yup.InferType<typeof metricBareSchema>

export const metricFullSchema = metricBareSchema
  .shape({
    higherIsBetter: yup.boolean().defined(),
    eventParams: yup.mixed().when('parameterType', {
      is: MetricParameterType.Conversion,
      then: yup.array(eventSchema).defined(),
      otherwise: yup.mixed().oneOf([null]),
    }),
    revenueParams: yup.mixed().when('parameterType', {
      is: MetricParameterType.Revenue,
      then: metricRevenueParamsSchema.defined(),
      otherwise: yup.mixed().oneOf([null]),
    }),
  })
  .defined()
  .camelCase()
  .test('event-params-required', 'Event Params is required and must be valid JSON.', (metricFull) => {
    return !(metricFull.parameterType === MetricParameterType.Conversion && !metricFull.eventParams)
  })
  .test('revenue-params-required', 'Revenue Params is required and must be valid JSON.', (metricFull) => {
    return !(metricFull.parameterType === MetricParameterType.Revenue && !metricFull.revenueParams)
  })
  .test('exactly-one-params', 'Exactly one of eventParams or revenueParams must be defined.', (metricFull) => {
    // (Logical XOR)
    return !!metricFull.eventParams !== !!metricFull.revenueParams
  })
export type MetricFull = yup.InferType<typeof metricFullSchema>
export const metricFullNewSchema = metricFullSchema.shape({
  metricId: idSchema.nullable(),
})
export type MetricFullNew = yup.InferType<typeof metricFullNewSchema>
export const metricFullNewOutboundSchema = metricFullNewSchema.snakeCase().transform(
  // istanbul ignore next; Tested by integration
  (currentValue) => ({
    ...currentValue,
    revenueParams: undefined,
    revenue_params: currentValue.revenue_params
      ? metricRevenueParamsSchema.snakeCase().cast(currentValue.revenue_params)
      : undefined,
  }),
)

export enum AttributionWindowSeconds {
  OneHour = 3600,
  SixHours = 21600,
  TwelveHours = 43200,
  TwentyFourHours = 86400,
  SeventyTwoHours = 259200,
  OneWeek = 604800,
  TwoWeeks = 1209600,
  ThreeWeeks = 1814400,
  FourWeeks = 2419200,
}

export const metricAssignmentNewSchema = yup
  .object({
    attributionWindowSeconds: yup
      .number()
      .integer()
      .positive()
      .oneOf(Object.values(AttributionWindowSeconds) as number[])
      .defined() as yup.Schema<AttributionWindowSeconds>,
    changeExpected: yup.bool().defined(),
    isPrimary: yup.bool().defined(),
    metricId: idSchema.defined(),
    minDifference: yup.number().defined().positive(),
  })
  .defined()
  .camelCase()
export type MetricAssignmentNew = yup.InferType<typeof metricAssignmentNewSchema>
export const metricAssignmentNewOutboundSchema = metricAssignmentNewSchema.snakeCase()

export const metricAssignmentSchema = metricAssignmentNewSchema
  .shape({
    metricAssignmentId: idSchema.defined(),
  })
  .defined()
  .camelCase()
export type MetricAssignment = yup.InferType<typeof metricAssignmentSchema>

export enum SegmentType {
  Country = 'country',
  Locale = 'locale',
}

export const segmentSchema = yup
  .object({
    segmentId: idSchema.defined(),
    name: yup.string().defined(),
    type: yup.string().oneOf(Object.values(SegmentType)).defined(),
  })
  .defined()
  .camelCase()
export type Segment = yup.InferType<typeof segmentSchema>

export const segmentAssignmentNewSchema = yup
  .object({
    segmentId: idSchema.defined(),
    isExcluded: yup.bool().defined(),
  })
  .defined()
  .camelCase()
export type SegmentAssignmentNew = yup.InferType<typeof segmentAssignmentNewSchema>
export const segmentAssignmentNewOutboundSchema = segmentAssignmentNewSchema.snakeCase()

export const segmentAssignmentSchema = segmentAssignmentNewSchema
  .shape({
    segmentAssignmentId: idSchema.defined(),
  })
  .defined()
  .camelCase()
export type SegmentAssignment = yup.InferType<typeof segmentAssignmentSchema>

export const variationNewSchema = yup
  .object({
    name: nameSchema.defined(),
    isDefault: yup.bool().defined(),
    allocatedPercentage: yup.number().integer().min(1).max(99).defined(),
  })
  .defined()
  .camelCase()
export type VariationNew = yup.InferType<typeof variationNewSchema>
export const variationNewOutboundSchema = variationNewSchema.snakeCase()

export const variationSchema = variationNewSchema
  .shape({
    variationId: idSchema.defined(),
  })
  .defined()
  .camelCase()
export type Variation = yup.InferType<typeof variationSchema>

export enum Platform {
  Calypso = 'calypso',
  Wpcom = 'wpcom',
}

export enum Status {
  Staging = 'staging',
  Running = 'running',
  Completed = 'completed',
  Disabled = 'disabled',
}

export const MAX_DISTANCE_BETWEEN_NOW_AND_START_DATE_IN_MONTHS = 12
export const MAX_DISTANCE_BETWEEN_START_AND_END_DATE_IN_MONTHS = 12
export const experimentBareSchema = yup
  .object({
    experimentId: idSchema.defined(),
    name: nameSchema.defined(),
    startDatetime: dateSchema.defined(),
    endDatetime: dateSchema
      .defined()
      .when(
        'startDatetime',
        (startDatetime: Date, schema: yup.DateSchema) =>
          startDatetime &&
          schema
            .min(startDatetime, 'End date must be after start date.')
            .max(
              dateFns.addMonths(startDatetime, MAX_DISTANCE_BETWEEN_START_AND_END_DATE_IN_MONTHS),
              `End date must be within ${MAX_DISTANCE_BETWEEN_START_AND_END_DATE_IN_MONTHS} months of start date.`,
            ),
      ),
    status: yup.string().oneOf(Object.values(Status)).defined(),
    platform: yup.string().oneOf(Object.values(Platform)).defined(),
    ownerLogin: yup.string().defined(),
  })
  .defined()
  .camelCase()
export type ExperimentBare = yup.InferType<typeof experimentBareSchema>

export const experimentFullSchema = experimentBareSchema
  .shape({
    description: yup.string().defined(),
    existingUsersAllowed: yup.boolean().defined(),
    p2Url: yup.string().url().defined(),
    endReason: yup.string().nullable(),
    conclusionUrl: yup.string().url().nullable(),
    deployedVariationId: idSchema.nullable().notRequired(),
    exposureEvents: yup.array<Event>(eventSchema).nullable(),
    metricAssignments: yup.array(metricAssignmentSchema).defined().min(1),
    segmentAssignments: yup.array(segmentAssignmentSchema).defined(),
    variations: yup.array<Variation>(variationSchema).defined().min(2),
  })
  .defined()
  .camelCase()
export type ExperimentFull = yup.InferType<typeof experimentFullSchema>

const now = new Date()
export const experimentFullNewSchema = experimentFullSchema.shape({
  experimentId: idSchema.nullable(),
  // This effectively makes status undefined (best I could do in yup)
  status: yup.mixed().oneOf([]).notRequired(),
  startDatetime: dateSchema
    .defined()
    .test(
      'future-start-date',
      'Start date (UTC) must be in the future.',
      // We need to refer to new Date() instead of using dateFns.isFuture so MockDate works with this in the tests.
      (date) => dateFns.isBefore(new Date(), date),
    )
    .test(
      'bounded-start-date',
      `Start date must be within ${MAX_DISTANCE_BETWEEN_NOW_AND_START_DATE_IN_MONTHS} months from now.`,
      // We need to refer to new Date() instead of using dateFns.isFuture so MockDate works with this in the tests.
      (date) => dateFns.isBefore(date, dateFns.addMonths(now, MAX_DISTANCE_BETWEEN_NOW_AND_START_DATE_IN_MONTHS)),
    ),
  exposureEvents: yup.array(eventNewSchema).notRequired(),
  metricAssignments: yup.array(metricAssignmentNewSchema).defined().min(1),
  segmentAssignments: yup.array(segmentAssignmentNewSchema).defined(),
  variations: yup.array<VariationNew>(variationNewSchema).defined().min(2),
})
export type ExperimentFullNew = yup.InferType<typeof experimentFullNewSchema>
/**
 * For casting use only.
 */
export const experimentFullNewOutboundSchema = experimentFullNewSchema
  .shape({
    // Seems to work here but not below?
    variations: yup.array<VariationNew>(variationNewOutboundSchema).defined(),
  })
  .snakeCase()
  .transform(
    // istanbul ignore next; Tested by integration
    (currentValue) => ({
      ...currentValue,
      // The P2 field gets incorrectly snake_cased so we fix it here
      p_2_url: undefined,
      p2_url: currentValue.p_2_url,
      // These two only seem to work down here rather then above?
      metric_assignments: yup.array(metricAssignmentNewOutboundSchema).defined().cast(currentValue.metric_assignments),
      segment_assignments: yup
        .array(segmentAssignmentNewOutboundSchema)
        .defined()
        .cast(currentValue.segment_assignments),
      // Converting EventNew to Event
      exposure_events: currentValue.exposure_events.map(
        (event: EventNew): Event => ({
          event: event.event,
          props: event.props ? _.fromPairs(event.props.map(({ key, value }) => [key, value])) : undefined,
        }),
      ),
    }),
  )

export enum RecommendationReason {
  CiInRope = 'ci_in_rope',
  CiGreaterThanRope = 'ci_greater_than_rope',
  CiLessThanRope = 'ci_less_than_rope',
  CiRopePartlyOverlap = 'ci_rope_partly_overlap',
  RopeInCi = 'rope_in_ci',
}

export enum RecommendationWarning {
  ShortPeriod = 'short_period',
  LongPeriod = 'long_period',
  WideCi = 'wide_ci',
}

export const recommendationSchema = yup
  .object({
    endExperiment: yup.boolean().defined(),
    chosenVariationId: yup.number().nullable().defined(),
    reason: yup.string().oneOf(Object.values(RecommendationReason)).defined(),
    warnings: yup.array(yup.string().oneOf(Object.values(RecommendationWarning)).defined()).defined(),
  })
  .defined()
  .camelCase()
export type Recommendation = yup.InferType<typeof recommendationSchema>

export const metricEstimateSchema = yup
  .object({
    estimate: yup.number().defined(),
    top: yup.number().defined(),
    bottom: yup.number().defined(),
  })
  .defined()
  .camelCase()
export type MetricEstimate = yup.InferType<typeof metricEstimateSchema>

export enum AnalysisStrategy {
  IttPure = 'itt_pure',
  MittNoSpammers = 'mitt_no_spammers',
  MittNoCrossovers = 'mitt_no_crossovers',
  MittNoSpammersNoCrossovers = 'mitt_no_spammers_no_crossovers',
  PpNaive = 'pp_naive',
}

export const analysisSchema = yup
  .object({
    metricAssignmentId: idSchema.defined(),
    analysisDatetime: dateSchema.defined(),
    analysisStrategy: yup.string().oneOf(Object.values(AnalysisStrategy)).defined(),
    // TODO: Provide better validation for these
    participantStats: yup.object().defined() as yup.Schema<Record<string, number>>,
    metricEstimates: yup.object().nullable().defined() as yup.Schema<Record<string, MetricEstimate> | null>,
    recommendation: recommendationSchema.nullable().defined(),
  })
  .defined()
  .camelCase()
export type Analysis = yup.InferType<typeof analysisSchema>

/**
 * The yup equivalant of _.pick, produces a subset of the original schema.
 *
 * @param schema A yup object schema
 * @param props Properties to pick
 * @param value See yup.reach
 * @param context See yup.reach
 */
export function yupPick(schema: yup.ObjectSchema, props: string[], value?: unknown, context?: unknown) {
  return yup.object(_.fromPairs(props.map((prop) => [prop, yup.reach(schema, prop, value, context)])))
}
