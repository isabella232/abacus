// Temporarily ignore until more parts are in place
/* eslint-disable @typescript-eslint/no-unused-vars */
/* istanbul ignore file */
import { Button, Paper, Step, StepButton, StepLabel, Stepper, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import useComponentSize from '@rehooks/component-size'
import { Formik } from 'formik'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as yup from 'yup'

import { ExperimentFullNew, experimentFullNewSchema, MetricBare, Segment } from '@/lib/schemas'

import Audience from './Audience'
import BasicInfo from './BasicInfo'
import Beginning from './Beginning'

enum StageId {
  Beginning,
  BasicInfo,
  Audience,
  Metrics,
  Submit,
}

interface Stage {
  id: StageId
  title: string
  validatableFields?: string[]
}

const stages: Stage[] = [
  {
    id: StageId.Beginning,
    title: 'Start',
    validatableFields: ['experiment.p2Url'],
  },
  {
    id: StageId.BasicInfo,
    title: 'Basic Info',
    validatableFields: [
      'experiment.name',
      'experiment.description',
      'experiment.startDatetime',
      'experiment.endDatetime',
      'experiment.ownerLogin',
    ],
  },
  {
    id: StageId.Audience,
    title: 'Audience',
    validatableFields: [
      'experiment.platform',
      'experiment.existingUsersAllowed',
      'experiment.segments',
      'experiment.variations',
    ],
  },
  {
    id: StageId.Metrics,
    title: 'Metrics',
    validatableFields: ['experiment.metrics'],
  },
  {
    id: StageId.Submit,
    title: 'Submit',
  },
]

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    navigation: {
      flexShrink: 0,
      marginRight: theme.spacing(6),
      marginTop: theme.spacing(2),
    },
    formConstrictor: {
      width: '100%',
      overflow: 'hidden',
    },
    form: {
      flex: 1,
      display: 'flex',
    },
    formPart: {
      flexShrink: 0,
      padding: theme.spacing(2, 1),
    },
    formPartActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      '& .MuiButton-root': {
        marginLeft: theme.spacing(2),
      },
    },
    // TODO: Subject to change when we get to polishing overall form UX
    paper: {
      padding: theme.spacing(2, 6),
      marginBottom: theme.spacing(2),
    },
  }),
)

const ExperimentForm = ({
  metrics,
  segments,
  initialExperiment,
}: {
  metrics: MetricBare[]
  segments: Segment[]
  initialExperiment: Partial<ExperimentFullNew>
}) => {
  const classes = useStyles()

  const constrictorRef = useRef<HTMLDivElement>(null)
  const constrictorSizes = useComponentSize(constrictorRef)

  const rootRef = useRef<HTMLDivElement>(null)
  const formPartBeginningRef = useRef<HTMLDivElement>(null)
  const formPartBasicInfoRef = useRef<HTMLDivElement>(null)
  const formPartAudienceRef = useRef<HTMLDivElement>(null)
  const formPartMetricsRef = useRef<HTMLDivElement>(null)
  const formPartSubmitRef = useRef<HTMLDivElement>(null)
  const stageFormPartRefs: Record<StageId, React.RefObject<HTMLDivElement>> = useMemo(
    () => ({
      [StageId.Beginning]: formPartBeginningRef,
      [StageId.BasicInfo]: formPartBasicInfoRef,
      [StageId.Audience]: formPartAudienceRef,
      [StageId.Metrics]: formPartMetricsRef,
      [StageId.Submit]: formPartSubmitRef,
    }),
    [],
  )

  const [currentStageId, setActiveStageId] = useState<StageId>(StageId.Beginning)
  const currentStageIndex = stages.findIndex((stage) => stage.id === currentStageId)

  const [completeStages, setCompleteStages] = useState<StageId[]>([])
  const markStageComplete = (stageId: StageId) => {
    setCompleteStages((prevValue) => {
      return prevValue.includes(stageId) ? prevValue : [...prevValue, stageId]
    })
  }
  const markStageIncomplete = (stageId: StageId) => {
    setCompleteStages((prevValue) => {
      return prevValue.filter((id) => id !== stageId)
    })
  }

  const [errorStages, setErrorStages] = useState<StageId[]>([])
  const markStageError = (stageId: StageId) => {
    setErrorStages((prevValue) => {
      return prevValue.includes(stageId) ? prevValue : [...prevValue, stageId]
    })
  }
  const markStageNoError = (stageId: StageId) => {
    setErrorStages((prevValue) => {
      return prevValue.filter((id) => id !== stageId)
    })
  }

  // TODO: Move this down and validate once the scrolling code is removed.
  const changeStage = useCallback(
    (stageId: StageId) => {
      setActiveStageId(stageId)
      if (stageFormPartRefs[stageId].current && rootRef.current) {
        stageFormPartRefs[stageId].current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' })
      }
    },
    [stageFormPartRefs, setActiveStageId],
  )
  useEffect(() => {
    const onResize = _.debounce(() => {
      changeStage(currentStageId)
    }, 100)

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [changeStage, currentStageId])

  return (
    <Formik
      initialValues={{ experiment: initialExperiment }}
      onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
      validationSchema={yup.object({ experiment: experimentFullNewSchema })}
    >
      {(formikProps) => {
        const isStageValid = async (stageId: StageId): Promise<boolean> => {
          const stage = stages.find((stage) => stage.id === stageId)
          if (!stage) {
            throw new Error('Typeguard: This should never occur')
          }

          const errors = await formikProps.validateForm()
          return !!stage.validatableFields?.some((field) => _.get(errors, field))
        }

        const updateStageState = async (stageId: StageId) => {
          if (await isStageValid(stageId)) {
            markStageError(stageId)
            markStageIncomplete(stageId)
          } else {
            markStageNoError(stageId)
            markStageComplete(stageId)
          }
        }

        const prevStage = () => {
          if (currentStageIndex === 0) {
            return
          }

          updateStageState(currentStageId)
          const prevStageIndex = currentStageIndex - 1
          changeStage(stages[prevStageIndex].id)
        }
        const nextStage = () => {
          if (stages.length <= currentStageIndex) {
            return
          }

          updateStageState(currentStageId)
          const nextStageIndex = currentStageIndex + 1
          changeStage(stages[nextStageIndex].id)
        }

        return (
          <div className={classes.root} ref={rootRef}>
            <div className={classes.navigation}>
              <Stepper nonLinear activeStep={currentStageId} orientation='vertical'>
                {stages.map((stage) => (
                  <Step key={stage.id} completed={completeStages.includes(stage.id)}>
                    <StepButton onClick={() => changeStage(stage.id)}>
                      <StepLabel error={errorStages.includes(stage.id)}>{stage.title}</StepLabel>
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </div>
            <div className={classes.formConstrictor} ref={constrictorRef}>
              <form className={classes.form} onSubmit={formikProps.handleSubmit} noValidate>
                <div className={classes.formPart} ref={formPartBeginningRef} style={{ width: constrictorSizes.width }}>
                  <Beginning />
                  <div className={classes.formPartActions}>
                    <Button onClick={nextStage} variant='contained' color='primary'>
                      Begin
                    </Button>
                  </div>
                </div>
                <div className={classes.formPart} ref={formPartBasicInfoRef} style={{ width: constrictorSizes.width }}>
                  <Paper className={classes.paper}>
                    <BasicInfo />
                  </Paper>
                  <div className={classes.formPartActions}>
                    <Button onClick={prevStage}>Previous</Button>
                    <Button onClick={nextStage} variant='contained' color='primary'>
                      Next
                    </Button>
                  </div>
                </div>
                <div className={classes.formPart} ref={formPartAudienceRef} style={{ width: constrictorSizes.width }}>
                  <Paper className={classes.paper}>
                    <Audience formikProps={formikProps} />
                  </Paper>
                  <div className={classes.formPartActions}>
                    <Button onClick={prevStage}>Previous</Button>
                    <Button onClick={nextStage} variant='contained' color='primary'>
                      Next
                    </Button>
                  </div>
                </div>
                <div className={classes.formPart} ref={formPartMetricsRef} style={{ width: constrictorSizes.width }}>
                  <Paper className={classes.paper}>
                    <Typography variant='body1'>Metrics Form Part</Typography>
                  </Paper>
                  <div className={classes.formPartActions}>
                    <Button onClick={prevStage}>Previous</Button>
                    <Button onClick={nextStage} variant='contained' color='primary'>
                      Next
                    </Button>
                  </div>
                </div>
                <div className={classes.formPart} ref={formPartSubmitRef} style={{ width: constrictorSizes.width }}>
                  <Paper className={classes.paper}>
                    <Typography variant='body1' gutterBottom>
                      This last form-part gives the users a chance to pause and consider.
                      <br />
                      <br />
                      It is good to have a mini-checklist here.
                      <br />
                      <br />
                      Maybe a pre-submission summary.
                      <br />
                      <br />
                      It is also good for the users to know the consequences of submitting so they aren&apos;t afraid of
                      pressing the button.
                    </Typography>
                  </Paper>
                  <div className={classes.formPartActions}>
                    <Button type='submit' variant='contained' color='secondary'>
                      Submit
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

export default ExperimentForm
