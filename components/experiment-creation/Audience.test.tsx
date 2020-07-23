/* eslint-disable no-irregular-whitespace,@typescript-eslint/ban-ts-ignore */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikProps } from 'formik'
import React from 'react'

import { createNewExperiment } from '@/lib/experiments'
import { ExperimentFullNew } from '@/lib/schemas'

import Audience from './Audience'

// Needed for testing the MuiCombobox
document.createRange = () => ({
  setStart: () => undefined,
  setEnd: () => undefined,
  // @ts-ignore; This is just for mocking
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
})

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

  const segmentCombobox = screen.getByRole('combobox')
  fireEvent.click(segmentCombobox)

  const segmentComboboxInput = segmentCombobox.querySelector('input')

  // Typeguard
  if (!segmentComboboxInput) {
    throw new Error(`Can't find the segmentCombobox input`)
  }

  fireEvent.change(segmentComboboxInput, { target: { value: 'AU' } })

  await waitFor(() => screen.debug(screen.getByText(/AU/)))

  fireEvent.click(screen.getByText(/AU/))

  fireEvent.click(screen.getByLabelText(/Exclude/))
})
