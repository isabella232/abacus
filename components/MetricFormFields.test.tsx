import { render } from '@testing-library/react'
import { Formik, FormikProps } from 'formik'
import MockDate from 'mockdate'
import React from 'react'

import { MetricFormData, metricToFormData } from '@/lib/form-data'
import Fixtures from '@/test-helpers/fixtures'

import MetricFormFields from './MetricFormFields'

MockDate.set('2020-07-21')

test('renders as expected for revenue metric', () => {
  const metric = Fixtures.createMetricFull(0)
  const { container } = render(
    <Formik
      initialValues={{
        metric: metricToFormData(metric),
      }}
      onSubmit={
        /* istanbul ignore next; This is unused */
        () => undefined
      }
    >
      {(formikProps: FormikProps<{ metric: MetricFormData }>) => <MetricFormFields formikProps={formikProps} />}
    </Formik>,
  )

  expect(container).toMatchSnapshot()
})

test('renders as expected for conversion metric', () => {
  const metric = Fixtures.createMetricFull(1)
  const { container } = render(
    <Formik
      initialValues={{
        metric: metricToFormData(metric),
      }}
      onSubmit={
        /* istanbul ignore next; This is unused */
        () => undefined
      }
    >
      {(formikProps: FormikProps<{ metric: MetricFormData }>) => <MetricFormFields formikProps={formikProps} />}
    </Formik>,
  )

  expect(container).toMatchSnapshot()
})
