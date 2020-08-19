import React from 'react'
import _ from 'lodash'

import LabelValuePanel from '@/components/LabelValuePanel'
import { ExperimentFullNormalized, ExperimentFullNormalizedData } from '@/lib/schemas'

/**
 * Renders the conclusion information of an experiment in a panel component.
 *
 * @param props.experiment - The experiment with the conclusion information.
 */
function ConclusionsPanel({ normalizedExperiment, normalizedExperimentData }: { normalizedExperiment: ExperimentFullNormalized, normalizedExperimentData: ExperimentFullNormalizedData }) {
  const deployedVariation = _.isNumber(normalizedExperiment.deployedVariationId) ? normalizedExperimentData.entities.variations[normalizedExperiment.deployedVariationId] : null


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
