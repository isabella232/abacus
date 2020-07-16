/* eslint-disable no-irregular-whitespace */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikProps } from 'formik'
import React from 'react'

import { createNewExperiment } from '@/lib/experiments'
import { ExperimentFullNew } from '@/lib/schemas'

import Audience from './Audience'

test('renders as expected', async () => {
  const { container } = render(
    <Formik
      initialValues={{ experiment: createNewExperiment() }}
      onSubmit={
        /* istanbul ignore next; This is unused */
        () => undefined
      }
    >
      {(formikProps: FormikProps<{ experiment: Partial<ExperimentFullNew> }>) => <Audience formikProps={formikProps} />}
    </Formik>,
  )
  expect(container).toMatchSnapshot()

  fireEvent.click(screen.getByRole('combobox'))

  await waitFor(() => screen.getByText(/en-AU/))

  fireEvent.click(screen.getByText(/en-AU/))
})
