import {
    UserCompletions,
    autocompleteSchema,
    EventCompletions,
    AutocompleteItem,
    Autocompletions,
    EventDetails, eventDetailsSchema
} from "@/lib/schemas"
import {fetchApi} from "@/api/utils"

async function getCompletion<T extends Autocompletions>(name: string) {
    const autocompleteData = await fetchApi<T>('GET', `/autocomplete/${name}`)
    return await autocompleteSchema.validate(autocompleteData, {abortEarly: false})
}

export async function getUserCompletions(): Promise<UserCompletions> {
    return getCompletion('users')
}

export async function getEventNameCompletions(): Promise<EventCompletions> {
    const options = await getCompletion('events')
    // todo: remove this
    return {
        completions: options.completions.map(v => {
            return {
                name: v.name,
                value: v.name
            }
        })
    }
}

export async function getEventDetails(eventName: string): Promise<EventDetails> {
    const eventDetails = await fetchApi('GET', `/autocomplete/events/${eventName}`)
    return await eventDetailsSchema.validate(eventDetails, {abortEarly: false})
}