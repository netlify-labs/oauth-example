
export function matchText(search, text) {
  if (!text || !search) {
    return false
  }
  return text.toLowerCase().indexOf(search.toLowerCase()) > -1
}

export function sortByDate(dateType, order) {
  return function (a, b) {
    const timeA = new Date(a[dateType]).getTime()
    const timeB = new Date(b[dateType]).getTime()
    if (order === 'asc') {
      return timeA - timeB
    }
    // default 'desc' descending order
    return timeB - timeA
  }
}

const oldNumber = '2012-02-25T22:21:57.581Z'
export function sortByPublishDate(order) {
  return function (a, b) {
    const timeOne = (!a.published_deploy) ? oldNumber : a.published_deploy.published_at
    const timeTwo = (!b.published_deploy) ? oldNumber : b.published_deploy.published_at
    const timeA = new Date(timeOne).getTime()
    const timeB = new Date(timeTwo).getTime()
    if (order === 'asc') {
      return timeA - timeB
    }
    // default 'desc' descending order
    return timeB - timeA
  }
}

export function sortByName(key, order) {
  return function (a, b) {
    if (order === 'asc') {
      if (a[key] < b[key]) return -1
      if (a[key] > b[key]) return 1
    }
    if (a[key] > b[key]) return -1
    if (a[key] < b[key]) return 1
    return 0
  }
}

export function sortByFunctions(order) {
  return function (a, b) {
    const functionsOne = (!a.published_deploy) ? [] : a.published_deploy.available_functions
    const functionsTwo = (!b.published_deploy) ? [] : b.published_deploy.available_functions
    if (order === 'desc') {
      if (functionsOne.length < functionsTwo.length) return -1
      if (functionsOne.length > functionsTwo.length) return 1
    }
    if (functionsOne.length > functionsTwo.length) return -1
    if (functionsOne.length < functionsTwo.length) return 1
    return 0
  }
}

export function sortByRepo(order) {
  return function (a, b) {
    const settingsOne = a.build_settings || { repo_url: 'a' }
    const settingsTwo = b.build_settings || { repo_url: 'a' }
    if (order === 'asc') {
      if (settingsOne.repo_url < settingsTwo.repo_url) return -1
      if (settingsOne.repo_url > settingsTwo.repo_url) return 1
    }
    if (settingsOne.repo_url > settingsTwo.repo_url) return -1
    if (settingsOne.repo_url < settingsTwo.repo_url) return 1
    return 0
  }
}
