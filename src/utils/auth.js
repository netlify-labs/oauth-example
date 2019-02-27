/**
 * Generate uuid
 * @return {String} - uuidv4
 */
export function csrfToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8) // eslint-disable-line
    return v.toString(16)
  })
}

/**
 * Parse url hash
 * @param  {String} hash - Hash of URL
 * @return {Object} parsed key value object
 */
export function parseHash(hash) {
  if (!hash) return {}
  return hash.replace(/^#/, '').split('&').reduce((result, pair) => {
    const keyValue = pair.split('=')
    result[keyValue[0]] = decode(keyValue[1])
    return result
  }, {})
}

/**
 * Remove hash from URL
 * @return {null}
 */
export function removeHash() {
  const { history, location } = window
  document.location.hash = ''
  history.pushState("", document.title, `${location.pathname}${location.search}`)
}

function decode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ')
}
