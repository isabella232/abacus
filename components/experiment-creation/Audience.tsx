import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  TextField,
  Typography,
} from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { Field } from 'formik'
import { RadioGroup, Select } from 'formik-material-ui'
import { AutocompleteProps, AutocompleteRenderInputParams, fieldToAutocomplete } from 'formik-material-ui-lab'
import React from 'react'

import { Platform, SegmentAssignment, SegmentType } from '@/models'

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
    segmentationHelperText: {
      marginBottom: theme.spacing(2),
    },
  }),
)

// TODO: Move these out once schema arrives
const PlatformToHuman: Record<Platform, string> = {
  [Platform.Wpcom]: 'WordPress.com',
  [Platform.Calypso]: 'Calypso',
}

const SegmentTypeToHuman: Record<SegmentType, string> = {
  [SegmentType.Country]: 'Country',
  [SegmentType.Locale]: 'Locale',
}

// TODO: Fix this reference after Schema
type Segment = {
  segmentId: number
  name: string
  type: SegmentType
}
type SegmentAssignmentNew = Pick<SegmentAssignment, 'segmentId' | 'isExcluded'>

// TODO: Populate these properly
const segments: Record<number, Segment> = {
  1: { segmentId: 1, name: 'us', type: SegmentType.Country },
  2: { segmentId: 2, name: 'au', type: SegmentType.Country },
  3: { segmentId: 3, name: 'en-US', type: SegmentType.Locale },
  4: { segmentId: 4, name: 'en-AU', type: SegmentType.Locale },
}

const SegmentsAutocomplete = (props: AutocompleteProps<Segment, true, false, false>) => {
  const {
    form: { setFieldValue },
    field: { name, value: outerValue },
  } = props

  // Here we translate SegmentAssignment (outside) <-> Segment (inside)
  const segmentAssignmentToSegment = (segmentAssignment: SegmentAssignmentNew) => {
    const segment = segments[segmentAssignment.segmentId]
    if (!segment) {
      throw new Error('Could not find segment with specified segmentId.')
    }
    return segment
  }
  const segmentToSegmentAssignment = (segment: Segment): SegmentAssignmentNew => ({
    segmentId: segment.segmentId,
    isExcluded: false,
  })
  const onChange = React.useCallback(
    (_event, value: Segment[]) => {
      setFieldValue(name, value.map(segmentToSegmentAssignment))
    },
    [setFieldValue, name],
  )
  const value = (outerValue as SegmentAssignmentNew[]).map(segmentAssignmentToSegment)

  return (
    <Autocomplete
      {...fieldToAutocomplete(props)}
      multiple={true}
      onChange={onChange}
      value={value}
      getOptionLabel={({ name, type }: Pick<Segment, 'name' | 'type'>) => `${SegmentTypeToHuman[type]}: ${name}`}
    />
  )
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
      <div className={classes.row}>
        <FormControl component='fieldset'>
          <FormLabel>Segmentation</FormLabel>
          <FormHelperText className={classes.segmentationHelperText}>
            Optionally, add segmentation to your experiment
          </FormHelperText>
          <Field
            name='experiment.segmentAssignments'
            component={SegmentsAutocomplete}
            options={Object.values(segments)}
            // Fix these types after Schema
            // TODO: Error state, see https://stackworx.github.io/formik-material-ui/docs/api/material-ui-lab
            renderInput={(params: AutocompleteRenderInputParams) => (
              <TextField {...params} variant='outlined' placeholder='Segments' />
            )}
          />
        </FormControl>
      </div>
    </div>
  )
}

export default Audience
