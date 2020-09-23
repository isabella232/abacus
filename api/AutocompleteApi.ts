import {
    UserCompletions,
    autocompleteSchema,
    EventCompletions,
    AutocompleteItem,
    Autocompletions,
    EventDetails, eventDetailsSchema
} from "@/lib/schemas"
import {fetchApi} from "@/api/utils"
import NotFoundError from "@/api/NotFoundError";

async function getCompletion<T extends Autocompletions>(name: string) {
    const autocompleteData = await fetchApi<T>('GET', `/autocomplete/${name}`)
    return await autocompleteSchema.validate(autocompleteData, {abortEarly: false})
}

const sessionCache: {
    userCompletions: null | UserCompletions
    eventCompletions: null | EventCompletions
    eventDetails: any
} = {
    userCompletions: null,
    eventCompletions: null,
    eventDetails: {}
}

export async function getUserCompletions(): Promise<AutocompleteItem[]> {
    return (sessionCache.userCompletions = sessionCache.userCompletions ?? await getCompletion('users')).completions
}

export async function getEventNameCompletions(): Promise<AutocompleteItem[]> {
    // todo: change swagger file so this isn't necessary
    return (sessionCache.eventCompletions = sessionCache.eventCompletions ?? await getCompletion('events')).completions.map(v => ({
        name: v.name,
        value: v.name
    }))
}

export function getPropCompletions(eventName: string): () => Promise<AutocompleteItem[]> {
    console.log('setting up', eventName)
    const noEventFound = {
        props: [
            {
                name: 'No props found for this event',
                value: ''
            }
        ]
    }

    if(eventName === '') {
        console.log('will not request props')
        return async () => noEventFound.props
    }

    return async () => {
        console.log('requesting', eventName)
        if (typeof sessionCache.eventDetails[eventName] === 'undefined') {
            try {
                const apiResponse = await fetchApi('GET', `/autocomplete/events/${eventName}`)
                sessionCache.eventDetails[eventName] = apiResponse
            } catch (er) {
                sessionCache.eventDetails[eventName] = noEventFound
            }
        }
        return sessionCache.eventDetails[eventName].props.map((v: any) => ({
            name: v.name,
            value: v.name
        }))
    }
}