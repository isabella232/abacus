import debugFactory from 'debug'
import { toIntOrNull } from 'qc-to_int'
import React from 'react'

import ExperimentPageView, { ExperimentView } from '@/components/ExperimentPageView'
import { isDebugMode } from '@/utils/general'
import { useParams } from 'react-router-dom'

const debug = debugFactory('abacus:pages/experiments/[id]/debug.tsx')

export default function Experiment(): JSX.Element | null {
  const { experimentId: experimentIdRaw, view = ExperimentView.Overview } = useParams<{ experimentId: string, view: string}>()
  const experimentId = toIntOrNull(experimentIdRaw) as number | null
  const debugMode = isDebugMode()

  debug(`ExperimentPage#render experimentId:%o view:%o debugMode:%o`, experimentId, view, debugMode)

  if (!experimentId) {
    throw new Error('Invalid experimentId')
  }

  if (!(Object.values(ExperimentView) as string[]).includes(view)) {
    throw new Error('Invalid ExperimentView')
  }

  return <ExperimentPageView {...{ experimentId, debugMode, view: view as ExperimentView }} />
}
