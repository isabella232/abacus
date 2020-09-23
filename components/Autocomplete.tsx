import {Autocomplete as FAutocomplete, AutocompleteProps, AutocompleteRenderInputParams} from 'formik-material-ui-lab'
import React, {useEffect, useState} from 'react'

import {AutocompleteItem, Autocompletions} from "@/lib/schemas";
import {CircularProgress, TextField} from "@material-ui/core";
import _ from 'lodash';
import {TextFieldProps} from "@material-ui/core/TextField/TextField";
//import {TextField} from "formik-material-ui";

interface Props<
        T extends AutocompleteItem,
        Multiple extends boolean | undefined,
        DisableClearable extends boolean | undefined,
        FreeSolo extends boolean | undefined
    > extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
    getCompletionData: () => Promise<T[]>
    reloadData: boolean
}

export default function Autocomplete<
        T extends AutocompleteItem,
        Multiple extends boolean | undefined,
        DisableClearable extends boolean | undefined,
        FreeSolo extends boolean | undefined
    >({getCompletionData, reloadData, ...props}: Props<T, Multiple, DisableClearable, FreeSolo>) {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<T[]>([])
    const loading = open && options.length === 0

    console.log('rendered', reloadData, options)

    useEffect(() => {
        if(reloadData) {
            setOptions([])
            console.log('cleared options')
        }
    }, [reloadData])

    useEffect(() => {
        let active = true
        if (!loading) {
            return undefined
        }

        (async () => {
            const response = await getCompletionData()
            console.table(response)
            if (active) {
                setOptions(response)
            }
        })()

        return () => {
            active = false
        }
    }, [loading])

    const inputProps = props as TextFieldProps;

    return <FAutocomplete
        {...props}
        open={open}
        onOpen={() => {
            setOpen(true)
        }}
        onClose={() => {
            setOpen(false)
        }}
        options={options}
        loading={loading}
        getOptionLabel={(option: AutocompleteItem | string) => typeof option === 'string' ? option : (option.name ?? "")}
        getOptionSelected={(option, value) => typeof value === 'string' ? value === option.value : option.value === value.value}
        renderInput={(params: AutocompleteRenderInputParams) => {
            return <TextField
                {...params}
                {...inputProps}
                InputProps={{
                    ...params.InputProps,
                    ...inputProps.InputProps,
                    endAdornment: <>
                        {loading ? <CircularProgress color="inherit" size={20}/> : null}
                        {params.InputProps.endAdornment}
                    </>
                }}
            />
        }}
    />
}