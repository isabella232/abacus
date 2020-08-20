import _ from 'lodash'
import React from 'react'

import LabelValuePanel from '@/components/LabelValuePanel'
import { ExperimentFullNormalized, ExperimentFullNormalizedEntities } from '@/lib/schemas'

/**
 * Renders the conclusion information of an experiment in a panel component.
 *
 * @param props.experiment - The experiment with the conclusion information.
 */
function ConclusionsPanel({
  normalizedExperiment,
  normalizedExperimentEntities,
}: {
  normalizedExperiment: ExperimentFullNormalized
  normalizedExperimentEntities: ExperimentFullNormalizedEntities
}) {
  const deployedVariation = _.isNumber(normalizedExperiment.deployedVariationId)
    ? normalizedExperimentEntities.variations[normalizedExperiment.deployedVariationId]
    : null

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
