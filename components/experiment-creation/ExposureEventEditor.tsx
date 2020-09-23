import React, {useCallback, useEffect, useState} from "react";
import {Button, IconButton, TableCell, TableRow} from "@material-ui/core";
import {Field, FieldArray} from "formik";
import Autocomplete from "@/components/Autocomplete";
import {getEventNameCompletions, getPropCompletions} from "@/api/AutocompleteApi";
import {Add, Clear} from "@material-ui/icons";
import {TextField} from "formik-material-ui";
import {EventNew} from "@/lib/schemas";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

interface Props {
    index: number
    exposureEvent: EventNew
    onRemoveExposureEvent: () => void
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        exposureEventsEventNameCell: {
            display: 'flex',
            alignItems: 'center',
        },
        exposureEventsEventName: {
            flexGrow: 1,
        },
        exposureEventsEventRemoveButton: {
            marginLeft: theme.spacing(1),
        },
        exposureEventsEventPropertiesRow: {
            marginTop: theme.spacing(3),
            marginLeft: theme.spacing(3),
        },
        exposureEventsEventPropertiesKey: {
            marginRight: theme.spacing(1),
        },
        addMetric: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            margin: theme.spacing(3, 0, 2),
        },
        addMetricAddSymbol: {
            position: 'relative',
            top: -3,
            marginRight: theme.spacing(2),
            color: theme.palette.text.disabled,
        },
    }),
)

export default function ExposureEventEditor({exposureEvent, index, onRemoveExposureEvent}: Props) {
    const classes = useStyles()
    const propRetriever = useCallback(getPropCompletions(exposureEvent.event), [exposureEvent])
    const [lastEvent, setLastEvent] = useState(exposureEvent.event)
    const eventChanged = exposureEvent.event !== lastEvent

    useEffect(() => {
        if(eventChanged) {
            setLastEvent(exposureEvent.event)
        }
    }, [eventChanged, exposureEvent])

    console.log(eventChanged, lastEvent, exposureEvent)

    return <TableRow key={index}>
        <TableCell>
            <div className={classes.exposureEventsEventNameCell}>
                <Field
                    component={Autocomplete}
                    name={`experiment.exposureEvents[${index}].event`}
                    className={classes.exposureEventsEventName}
                    id={`experiment.exposureEvents[${index}].event`}
                    type='text'
                    variant='outlined'
                    placeholder='event_name'
                    label='Event'
                    freeSolo
                    InputProps={{
                        'aria-label': 'Event Name',
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    getCompletionData={getEventNameCompletions}
                />
                <IconButton
                    className={classes.exposureEventsEventRemoveButton}
                    onClick={onRemoveExposureEvent}
                    aria-label='Remove exposure event'
                >
                    <Clear />
                </IconButton>
            </div>
            <FieldArray
                name={`experiment.exposureEvents[${index}].props`}
                render={(arrayHelpers) => {
                    const onAddExposureEventProperty = () => {
                        arrayHelpers.push({
                            key: '',
                            value: '',
                        })
                    }

                    return (
                        <div>
                            <div>
                                {exposureEvent.props &&
                                exposureEvent.props.map((_prop: unknown, propIndex: number) => {
                                    const onRemoveExposureEventProperty = () => {
                                        arrayHelpers.remove(propIndex)
                                    }

                                    return (
                                        <div className={classes.exposureEventsEventPropertiesRow} key={propIndex}>
                                            <Field
                                                component={Autocomplete}
                                                className={classes.exposureEventsEventPropertiesKey}
                                                name={`experiment.exposureEvents[${index}].props[${propIndex}].key`}
                                                id={`experiment.exposureEvents[${index}].props[${propIndex}].key`}
                                                type='text'
                                                variant='outlined'
                                                placeholder='key'
                                                label='Key'
                                                size='small'
                                                reloadData={eventChanged}
                                                freeSolo
                                                fullWidth={false}
                                                getCompletionData={propRetriever}
                                                InputProps={{
                                                    'aria-label': 'Property Key',
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                            <Field
                                                component={TextField}
                                                name={`experiment.exposureEvents[${index}].props[${propIndex}].value`}
                                                id={`experiment.exposureEvents[${index}].props[${propIndex}].value`}
                                                type='text'
                                                variant='outlined'
                                                placeholder='value'
                                                label='Value'
                                                size='small'
                                                inputProps={{
                                                    'aria-label': 'Property Value',
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                            <IconButton
                                                className={classes.exposureEventsEventRemoveButton}
                                                onClick={onRemoveExposureEventProperty}
                                                aria-label='Remove exposure event property'
                                            >
                                                <Clear />
                                            </IconButton>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className={classes.addMetric}>
                                <Add className={classes.addMetricAddSymbol} />
                                <Button
                                    variant='contained'
                                    onClick={onAddExposureEventProperty}
                                    disableElevation
                                    size='small'
                                    aria-label='Add Property'
                                >
                                    Add Property
                                </Button>
                            </div>
                        </div>
                    )
                }}
            />
        </TableCell>
    </TableRow>
}