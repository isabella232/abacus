import { Box, createStyles, Link, makeStyles, Paper, Tab, Tabs, Theme, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import Highlight from 'react-syntax-highlighter'

import { ExperimentFull, Platform } from '../lib/schemas'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },
  }),
)

export default function ExperimentCodeSetup({ experiment }: { experiment: ExperimentFull }): JSX.Element {
  const classes = useStyles()
  const [tabValue, setTabValue] = useState(() => {
    switch (experiment.platform) {
      case Platform.Calypso:
        return 0
      default:
        // most likely a landing page experiment
        if (experiment.name.startsWith('lohp')) {
          return 2
        }
        return 1
    }
  })

  const defaultVariation = experiment.variations.flatMap((x) => (x.isDefault ? x.name : null))[0] ?? 'control'
  const treatmentVariation = experiment.variations.flatMap((x) => (x.isDefault ? null : x.name))[0] ?? 'treatment'

  const react = `import React from 'react';
import Experiment, {
    DefaultVariation,
    Variation,
    LoadingVariations,
} from 'client/components/experiment';
function SomeExperiment( props ) {
    return (
        <Experiment name={ ${experiment.name} }>
            <DefaultVariation name="${defaultVariation}">
                Shows this variation when:
                <ol>
                    <li>The user doesn't have a variation assigned to them.</li>
                    <li>The experiment doesn't exist.</li>
                    <li>Before the experiment goes live</li>
                </ol>
            </DefaultVariation>
            <Variation name="${treatmentVariation}">Show variation B if the user is assigned this variation.</Variation>
            <LoadingVariations>
                Show this when we don't know the variation because we haven't called the API yet to get
                variations.
                <br />
                Protip: If this experiment is in the middle or end of a flow, try putting
                <code>&lt;QueryExperiments&gt;</code> at the beginning of your flow to ensure the variation
                assignments are preloaded.
            </LoadingVariations>
        </Experiment>
    );
}
`

  const wordpressPhp = `<?php

require_lib( 'wpcom-abtest/wpcom-experiment' );
$experiment = WPCOM_Experiment::instance( '${experiment.name}' );
$experiment->set_user( get_current_user_id(), $_COOKIE['tk_ai'] );
switch( $experiment->get_variation() ) {
    case '${treatmentVariation}':
        // do something with this variation
        break;
    default:
        // handle the default/control case
        break;
}
`

  const wordPressLanding = `<?php

require_once __DIR__ . '/../wp-content/lib/wpcom-abtest/wpcom-experiment-client.php';
$experiment = WPCOM_Experiment_Client::instance( '${experiment.name}' );
$experiment->set_user( null, $_COOKIE['tk_ai'] );
switch( $experiment->get_variation() ) {
    case '${treatmentVariation}'
        // do something with this variation
        break;
    default:
        // handle the default/control case
        break;
}
`
  return (
    <Paper className={classes.root}>
      <Typography variant='h4'>Experiment Code Setup</Typography>
      <Typography variant='subtitle1' gutterBottom>
        Connect this experiment to your code.
      </Typography>
      <br />
      <Tabs centered value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label={'React'} />
        <Tab label={'WordPress.com'} />
        <Tab label={'Logged Out Homepages'} />
        <Tab label={'Raw HTTP'} />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <Typography variant={'h5'}>Example Code</Typography>
        <Highlight language='tsx'>{react}</Highlight>
        <Typography variant={'h5'}>Documentation</Typography>
        <Link href='https://github.com/Automattic/wp-calypso/tree/master/client/components/experiment'>
          See this Readme
        </Link>
      </TabPanel>
      <TabPanel index={1} value={tabValue}>
        <Typography variant={'h5'}>Example Code</Typography>
        <Highlight language='php'>{wordpressPhp}</Highlight>
      </TabPanel>
      <TabPanel index={2} value={tabValue}>
        <Typography variant={'h5'}>Example Code</Typography>
        <Highlight language='php'>{wordPressLanding}</Highlight>
      </TabPanel>
      <TabPanel index={3} value={tabValue}>
        <Typography variant={'h5'}>Example curl</Typography>
        <Highlight language={''}>
          {`curl 'https://public-api.wordpress.com/wpcom/v2/experiments/0.1.0/assignments/${experiment.platform}?anon_id=123&user_id=1&_locale=en-US&geo=NL&_envelope=1'`}
        </Highlight>
        <Typography variant={'h5'}>Example Response</Typography>
        <Highlight langue={'HTTP'}>
          {`HTTP/2 200 
server: nginx
date: Wed, 14 Oct 2020 13:34:15 GMT
content-type: application/json; charset=UTF-8
vary: Accept-Encoding
x-hacker: Oh, Awesome: I/Opossum
x-robots-tag: noindex
link: <https://public-api.wordpress.com/>; rel="https://api.w.org/"
x-content-type-options: nosniff
access-control-expose-headers: X-WP-Total, X-WP-TotalPages, Link
set-cookie: ${experiment.name}=${treatmentVariation}; expires=Wed, 04-Nov-2020 00:00:00 GMT; Max-Age=1765545; path=/; domain=.wordpress.com; secure; SameSite=None
vary: Origin
access-control-allow-headers: Authorization, Content-Type
x-ac: 2.dfw _dfw 
strict-transport-security: max-age=15552000

{
    "body": {
        "variations": {
            "${experiment.name}": "${treatmentVariation}"
        },
        "ttl": 3600
    },
    "status": 200,
    "headers": {
        "Allow": "GET"
    }
}`}
        </Highlight>
      </TabPanel>
    </Paper>
  )
}
