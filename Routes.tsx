import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'

import Experiment from '@/pages-real/experiments/Experiment'
import ExperimentNew from '@/pages-real/experiments/ExperimentNew'
import ExperimentWizardEdit from '@/pages-real/experiments/ExperimentWizardEdit'
import Experiments from '@/pages-real/experiments/Experiments'

import Metrics from '@/pages-real/Metrics'

/**
 * Let's keep routing simple and minimal.
 * - Do not use dynamic or nested routing!
 * - Get all your route information at the top level.
 * - Try not to delete or change an existing route: comment a route as deprecated and redirect.
 */
export default function Routes() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/experiments" />
                </Route>

                <Route path="/experiments" exact>
                    <Experiments />
                </Route>

                <Route path="/experiments/new" exact>
                    <ExperimentNew />
                </Route>
                <Route path="/experiments/:experimentId" exact>
                    {/* Relative redirecting is buggy because of NextJS: */}
                    {/* <Redirect to="./overview" /> */}
                    <Experiment />
                </Route>
                <Route path="/experiments/:experimentId/wizard-edit" exact>
                    <ExperimentWizardEdit />
                </Route>
                <Route path="/experiments/:experimentId/:view" exact>
                    <Experiment />
                </Route>


                <Route path="/metrics" exact>
                    <Metrics />
                </Route>
            </Switch>
        </Router>
    )
}