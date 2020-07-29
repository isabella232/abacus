import React from 'react'

import LabelValuePanel from '@/components/LabelValuePanel'
import * as Experiments from '@/lib/experiments'
import { ExperimentFullNormalizedData } from '@/lib/schemas'

/**
 * Renders the conclusion information of an experiment in a panel component.
 *
 * @param props.experiment - The experiment with the conclusion information.
 */
function ConclusionsPanel({ normalizedExperimentData }: { normalizedExperimentData: ExperimentFullNormalizedData }) {
  const normalizedExperiment = normalizedExperimentData.entities.experiments[normalizedExperimentData.result]
  const deployedVariation = Experiments.getDeployedVariation(normalizedExperimentData)
  const data = [
    { label: 'Reason the experiment ended', value: normalizedExperiment.endReason },
    {
      label: 'Conclusion URL',
      value: !!normalizedExperiment.conclusionUrl && (
        <a href={normalizedExperiment.conclusionUrl} rel='noopener noreferrer' target='_blank'>
          {normalizedExperiment.conclusionUrl}
        </a>
      ),
    },
    { label: 'Deployed variation', value: deployedVariation?.name },
  ]
  return <LabelValuePanel data={data} title='Conclusions' />
}

export default ConclusionsPanel
