import { format } from 'util'

// Throw errors on any console logging.
// Adapted from https://github.com/facebook/jest/issues/6121#issuecomment-529591574
;['error', 'info', 'log', 'warn'].forEach((funcName) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global.console as any)[funcName] = function (message?: any, ...optionalParams: any[]) {
    throw new Error(format(message, optionalParams))
  }
})
