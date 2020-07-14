import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  Typography,
} from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Field } from 'formik'
import { RadioGroup, Select } from 'formik-material-ui'
import React from 'react'

import { Platform } from '@/models'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '36rem',
      // TODO: Remove, this is just for the storybook.
      margin: '2rem auto',
    },
    row: {
      margin: theme.spacing(6, 0),
      display: 'flex',
      alignItems: 'center',
    },
  }),
)

// TODO: Move this out once schema arrives
const PlatformToHuman: Record<Platform, string> = {
  [Platform.Wpcom]: 'WordPress.com',
  [Platform.Calypso]: 'Calypso',
}

const Audience = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography variant='h2' gutterBottom>
        Audience
      </Typography>

      <div className={classes.row}>
        <FormControl component='fieldset'>
          <FormLabel required>Platform</FormLabel>
          <Field component={Select} name='experiment.platform'>
            {Object.values(Platform).map((platform) => (
              <MenuItem key={platform} value={platform}>
                {PlatformToHuman[platform]}
              </MenuItem>
            ))}
          </Field>
        </FormControl>
      </div>

      <div className={classes.row}>
        <FormControl component='fieldset'>
          <FormLabel required>User types</FormLabel>
          <FormHelperText>Types of users to include in experiment</FormHelperText>

          <Field
            component={RadioGroup}
            name='experiment.existingUsersAllowed'
            required
            InputLabelProps={{
              shrink: true,
            }}
          >
            <FormControlLabel
              value='false'
              label='New users only'
              control={<Radio disabled={isSubmitting} />}
              disabled={isSubmitting}
            />
            <FormControlLabel
              value='true'
              label='All users (new + existing)'
              control={<Radio disabled={isSubmitting} />}
              disabled={isSubmitting}
            />
          </Field>
        </FormControl>
      </div>
    </div>
  )
}

export default Audience
