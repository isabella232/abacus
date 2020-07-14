/* eslint-disable no-irregular-whitespace */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import React from 'react'

import Audience from './Audience'

test('renders as expected', async () => {
  const { container } = render(
    <Formik
      initialValues={{ experiment: { segmentAssignments: [] } }}
      onSubmit={
        /* istanbul ignore next; This is unused */
        () => undefined
      }
    >
      <Audience isSubmitting={false} />
    </Formik>,
  )
  expect(container).toMatchSnapshot()

  fireEvent.click(screen.getByRole('combobox'))

  await waitFor(() => screen.getByText(/en-AU/))

  fireEvent.click(screen.getByText(/en-AU/))
})
