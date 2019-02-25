const querystring = require('querystring')
const { config, oauth } = require('./utils/auth')
const { getUser } = require('./utils/netlify-api')

/* Function to handle netlify auth callback */
exports.handler = async (event, context) => {
  // Exit early
  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Not authorized',
      })
    }
  }

  /* Grant the grant code */
  const code = event.queryStringParameters.code
  /* state helps mitigate CSRF attacks & Restore the previous state of your app */
  const state = querystring.parse(event.queryStringParameters.state)

  try {
    /* Take the grant code and exchange for an accessToken */
    const authorizationToken = await oauth.authorizationCode.getToken({
      code: code,
      redirect_uri: config.redirect_uri,
      client_id: config.clientId,
      client_secret: config.clientSecret
    })

    const authResult = oauth.accessToken.create(authorizationToken)

    const token = authResult.token.access_token

    const user = await getUser(token)

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: user,
        authResult: authResult,
        state: state,
        encode: Buffer.from(token, 'binary').toString('base64')
      })
    }
  } catch (e) {
    console.log('Access Token Error', e.message)
    console.log(e)
    return {
      statusCode: e.statusCode || 500,
      body: JSON.stringify({
        error: e.message,
      })
    }
  }
}
