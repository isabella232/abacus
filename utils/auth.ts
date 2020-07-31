import qs from 'querystring'

/**
 * Resolves the OAuth client ID based on the host.
 *
 * @param host
 */
export const getAuthClientId = (host: string) => {
  return host === 'experiments.a8c.com' ? 68795 : 68797
}

/**
 * Experiments authorization info, as returned from OAuth call. See
 * https://developer.wordpress.com/docs/oauth2/.
 */
interface ExperimentsAuthInfo {
  accessToken: string
  expiresAt: number | null
  scope: string
  type: string
}

/**
 * Returns the saved Experiments authorization info if available and has not expired.
 */
export const getExperimentsAuthInfo = (): ExperimentsAuthInfo | null => {
  try {
    const experimentsAuthInfo = JSON.parse(localStorage.getItem('experiments_auth_info') || 'null')
    if (experimentsAuthInfo && experimentsAuthInfo.expiresAt > Date.now()) {
      return experimentsAuthInfo
    }
  } catch (err) {
    /* istanbul ignore next */
    console.error(err)
  }
  return null
}

/**
 * Saves the Experiments authorization info for later retrieval.
 *
 * @param {ExperimentsAuthInfo} experimentsAuthInfo
 */
export const saveExperimentsAuthInfo = (experimentsAuthInfo: ExperimentsAuthInfo | null) => {
  if (experimentsAuthInfo === null) {
    localStorage.removeItem('experiments_auth_info')
  } else {
    localStorage.setItem('experiments_auth_info', JSON.stringify(experimentsAuthInfo))
  }
}

export function initializeExperimentsAuthentication() {
  if (typeof window !== 'undefined') {
    // Inject a fake auth token to skip authentication in non-production contexts.
    // This is a temporary solution. Ideally, we should test the full authentication flow in every environment.
    if (window.location.host !== 'experiments.a8c.com') {
      saveExperimentsAuthInfo({
        accessToken: 'fake_token',
        expiresAt: Date.parse('2100-01-01'),
        scope: 'global',
        type: 'bearer',
      })
    }

    // Prompt user for authorization if we don't have auth info.
    const experimentsAuthInfo = getExperimentsAuthInfo()
    if (!experimentsAuthInfo) {
      const authPath = 'https://public-api.wordpress.com/oauth2/authorize'
      const authQuery = {
        client_id: getAuthClientId(window.location.host),
        redirect_uri: `${window.location.origin}/auth`,
        response_type: 'token',
        scope: 'global',
      }

      const authUrl = `${authPath}?${qs.stringify(authQuery)}`
      window.location.replace(authUrl)
    }
  }
}
