import { FormControl, FormControlLabel, FormLabel, Radio, TextField as MuiTextField } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Field, FormikProps, getIn } from 'formik'
import { RadioGroup, Switch, TextField, TextFieldProps, fieldToTextField } from 'formik-material-ui'
import React, { useEffect } from 'react'

import { MetricParameterType } from '@/lib/schemas'
import { MetricFormData } from '@/lib/form-data'
import DebugOutput from './DebugOutput'

const useJsonTextFieldStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { width: '100%' },
  }),
)

// This fixes the error state in JSON text fields
function JsonTextField({ children, helperText = '', ...props }: TextFieldProps) {
  const classes = useJsonTextFieldStyles()

  const fieldError = getIn(props.form.errors, props.field.name);
  const showError = getIn(props.form.touched, props.field.name) && !!fieldError;

  return (
    <div className={classes.root}>
      <MuiTextField {...fieldToTextField(props)} helperText={helperText}>{children}</MuiTextField>
      {showError && <DebugOutput label="Errors" content={fieldError} />}
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    row: {
      margin: theme.spacing(3, 0),
      display: 'flex',
      alignItems: 'center',
      '&:first-of-type': {
        marginTop: 0,
      },
    },
  }),
)

const MetricFormFields = ({ formikProps }: { formikProps: FormikProps<{ metric: MetricFormData }> }) => {
  const classes = useStyles()

  // Here we reset the params field after parameterType changes
  useEffect(() => {
    if (formikProps.values.metric.parameterType === MetricParameterType.Conversion) {
      const eventParams = formikProps.values.metric.eventParams
      formikProps.setValues({
        ...formikProps.values,
        metric: {
          ...formikProps.values.metric,
          revenueParams: 'undefined',
          eventParams: eventParams === 'undefined' ? '[]' : eventParams,
        }
      })
    } else {
      const revenueParams = formikProps.values.metric.revenueParams 
      formikProps.setValues({
        ...formikProps.values,
        metric: {
          ...formikProps.values.metric,
          revenueParams: revenueParams === 'undefined' ? '{}' : revenueParams,
          eventParams: 'undefined',
        }
      })
    }
  }, [formikProps.values.metric.parameterType])

  return (
    <>
      <div className={classes.row}>
        <Field
          component={TextField}
          name='metric.name'
          id='metric.name'
          label='Metric name'
          placeholder='metric_name'
          helperText='Use snake_case.'
          variant='outlined'
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <div className={classes.row}>
        <Field
          component={TextField}
          name='metric.description'
          id='metric.description'
          label='Metric description'
          placeholder='Put your Metric description here!'
          variant='outlined'
          fullWidth
          required
          multiline
          rows={4}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <div className={classes.row}>
        <FormControlLabel
          label='Higher is better'
          control={
            <Field
              component={Switch}
              name='metric.higherIsBetter'
              id='metric.higherIsBetter'
              label='Higher is better'
              type='checkbox'
              aria-label='Higher is better'
              variant='outlined'
            />
          }
        />
      </div>
      <div className={classes.row}>
        <FormControl component='fieldset'>
          <FormLabel required>Metric Type</FormLabel>
          <Field component={RadioGroup} name='metric.parameterType' required>
            <FormControlLabel
              value={MetricParameterType.Conversion}
              label='Conversion'
              control={<Radio disabled={formikProps.isSubmitting} />}
              disabled={formikProps.isSubmitting}
            />
            <FormControlLabel
              value={MetricParameterType.Revenue}
              label='Revenue'
              control={<Radio disabled={formikProps.isSubmitting} />}
              disabled={formikProps.isSubmitting}
            />
          </Field>
        </FormControl>
      </div>
      <div className={classes.row}>
        {formikProps.values.metric.parameterType === MetricParameterType.Conversion && (

          <Field
            component={JsonTextField}
            name='metric.eventParams'
            id='metric.eventParams'
            label='Event Parameters'
            variant='outlined'
            fullWidth
            required
            multiline
            resizable
            rows={8}
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
      </div>
      <div className={classes.row}>
        {formikProps.values.metric.parameterType === MetricParameterType.Revenue && (
          <Field
            component={JsonTextField}
            name='metric.revenueParams'
            id='metric.revenueParams'
            label='Revenue Parameters'
            variant='outlined'
            fullWidth
            required
            multiline
            resizable
            rows={8}
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
      </div>
    </>
  )
}

export default MetricFormFields
