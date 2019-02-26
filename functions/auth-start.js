const { config, oauth } = require('./utils/auth')

/* Do initial auth redirect */
exports.handler = async (event, context) => {

  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'No token found',
      })
    }
  }

  const csrfToken = event.queryStringParameters.csrf
  const redirectUrl = event.queryStringParameters.url

  /* Generate authorizationURI */
  const authorizationURI = oauth.authorizationCode.authorizeURL({
    redirect_uri: config.redirect_uri,
    /* Specify how your app needs to access the user’s account. */
    scope: '',
    /* State helps mitigate CSRF attacks & Restore the previous state of your app */
    state: `url=${redirectUrl}&csrf=${csrfToken}`,
  })

  /* Redirect user to authorizationURI */
  return {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      'Cache-Control': 'no-cache' // Disable caching of this response
    },
    body: '' // return body for local dev
  }
}
