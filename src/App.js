import React, { Component } from 'react'
import NetlifyAPI from 'netlify'
import timeAgo from 'time-ago'
import { csrfToken, parseHash, removeHash } from './utils/auth'
import { sortByDate, sortByPublishDate, sortByName, sortByFunctions, sortByRepo, matchText } from './utils/sort'
// import stub from './stub'
import './App.css'

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    const response = parseHash(window.location.hash)
    /* Clear hash */
    removeHash()

    /* Protect against csrf (cross site request forgery https://bit.ly/1V1AvZD) */
    if (response.token && !localStorage.getItem(response.csrf)) {
      alert("Token invalid. Please try to login again")
      return
    }

    /* Clean up csrfToken */
    localStorage.removeItem(response.csrf)

    /* Set initial app state */
    this.state = {
      user: response,
      sites: [],
      filterText: '',
      loading: false,
      sortBy: 'published_at',
      sortOrder: 'desc'
    }
  }
  async componentDidMount() {
    const { user } = this.state
    if (!user.token) return

    /* Set request loading state */
    this.setState({
      loading: true
    })

    /* Fetch sites from netlify API */
    const client = new NetlifyAPI(window.atob(user.token))
    const sites = await client.listSites({
      filter: 'all'
    })

    /* Set sites and turn off loading state */
    this.setState({
      sites: sites,
      loading: false
    })
  }
  handleAuth = (e) => {
    e.preventDefault()
    const state = csrfToken()
    const { location, localStorage } = window
    /* Set csrf token */
    localStorage.setItem(state, 'true')
    /* Do redirect */
    const redirectTo = `${location.origin}${location.pathname}`
    window.location.href = `/.netlify/functions/auth-start?url=${redirectTo}&csrf=${state}`
  }
  handleLogout = (e) => {
    e.preventDefault()
    window.location.href = `/`
  }
  handleFilterInput = e => {
    this.setState({
      filterText: e.target.value
    })
  }
  handleSort = (e) => {
    const { sortOrder } = this.state
    if (e.target && e.target.dataset) {
      this.setState({
        sortBy: e.target.dataset.sort,
        // invert sort order
        sortOrder: (sortOrder === 'desc') ? 'asc' : 'desc'
      })
    }
  }
  renderSites = () => {
    const { sites, filterText, loading, sortBy, sortOrder } = this.state
    console.log('sortOrder', sortOrder)

    if (loading) {
      return (
        <div>Loading sites...</div>
      )
    }

    let order
    if (sortBy === 'published_at') {
      order = sortByPublishDate(sortOrder)
    } else if (sortBy === 'name' || sortBy === 'account_name') {
      order = sortByName(sortBy, sortOrder)
    } else if (sortBy === 'updated_at' || sortBy === 'created_at') {
      order = sortByDate(sortBy, sortOrder)
    } else if (sortBy === 'functions') {
      order = sortByFunctions(sortOrder)
    } else if (sortBy === 'repo') {
      order = sortByRepo(sortOrder)
    }

    const sortedSites = sites.sort(order)

    let matchingSites = sortedSites.filter(site => {
      console.log('site', site)
       // No search query. Show all
       if (!filterText) {
         return true
       }

       const { name, site_id, ssl_url, build_settings } = site
       console.log('build_settings', build_settings)
       if (
         matchText(filterText, name) ||
         matchText(filterText, site_id) ||
         matchText(filterText, ssl_url)
        ) {
         return true
       }

       if (build_settings && build_settings.repo_url && matchText(filterText, build_settings.repo_url)) {
         console.log('Build match')
         return true
       }

       // no match!
       return false
     }).map((site, i) => {
       const { name, account_name, account_slug, admin_url, ssl_url,  screenshot_url, created_at } = site
       const published_deploy = site.published_deploy || {}
       const functions = published_deploy.available_functions || []
       const functionsNames = functions.map((f) => { return f.n }).join(', ')
       const build_settings = site.build_settings || {}
       const { provider, repo_url, repo_branch } = build_settings
       const time = published_deploy.published_at ? timeAgo.ago(new Date(published_deploy.published_at).getTime()) : 'NA'
       const createdAt = created_at ? timeAgo.ago(new Date(created_at).getTime()) : 'NA'
       return (
         <div className='site-wrapper' key={i}>
           <div className='site-screenshot'>
             <a href={admin_url} target='_blank' rel='noopener noreferrer'>
               <img src={screenshot_url} alt='' />
             </a>
           </div>
           <div className='site-info'>
             <h2>
               <a href={admin_url} target='_blank' rel='noopener noreferrer'>
                 {name}
               </a>
             </h2>
             <div className='site-meta'>
               <a href={ssl_url} target='_blank' rel='noopener noreferrer'>
                 {ssl_url}
               </a>
             </div>
           </div>
           <div className='site-team'>
             <a href={`https://app.netlify.com/teams/${account_slug}/sites/`} target='_blank' rel='noopener noreferrer'>
               {account_name}
             </a>
           </div>
           <div className='site-publish-time'>
              {time}
           </div>
           <div className='site-functions'>
             <div title={functionsNames}>
               <a href={`${admin_url}/functions`} target='_blank' rel='noopener noreferrer'>
                 {functions.length}
               </a>
             </div>
           </div>
           <div className='site-create-time'>
              {createdAt}
           </div>
           <div className='site-repo-link'>
              {(repo_url) ?
                <a href={repo_url} target='_blank' rel='noopener noreferrer'>
                  {repo_url.replace(/^https:\/\//, '')}
                </a>
                : ''
              }
           </div>
         </div>
       )
     })

     if (!matchingSites.length) {
     matchingSites = (
       <div>
         <h3>
           No "{filterText}" examples found. Clear your search and try again.
         </h3>
       </div>
     )
   }
   return matchingSites
  }
  render() {
    const { user } = this.state

    /* Not logged in. Show login button */
    if (user && !user.token) {
      return (
        <div className="app">
          <h1>Please Login</h1>
          <button onClick={this.handleAuth}>
            Netlify OAuth login
          </button>
        </div>
      )
    }

    /* Show admin UI */
    return (
      <div className="app">
        <h1>
          <span className='title-inner'>
            Hi {user.full_name || 'Friend'}
            <button onClick={this.handleLogout}>
              Logout
            </button>
          </span>
        </h1>
        <div>
          <input
            className="search"
            onChange={this.handleFilterInput}
            placeholder='Search for sites by name, id, url or repo'
          />
        <div className='site-wrapper-header'>
            <div
              className='site-screenshot-header header'
              data-sort='name'
              onClick={this.handleSort}
              title='Click to sort by site name'
              >
              Site Info
            </div>
            <div className='site-info header' data-sort='name' onClick={this.handleSort}>

            </div>
            <div
              className='site-team header'
              data-sort='account_name'
              onClick={this.handleSort}
              title='Click to sort by team name'
              >
              Team
            </div>
            <div
              className='site-publish-time header'
              data-sort='published_at'
              onClick={this.handleSort}
              title='Click to sort by last publish date'
              >
              Last published
            </div>
            <div
              className='site-functions header'
              data-sort='functions'
              onClick={this.handleSort}
              title='Click to sort by number of Functions'
              >
              Functions
            </div>
            <div
              className='site-create-time header'
              data-sort='created_at'
              onClick={this.handleSort}
              title='Click to sort by site creation date'
              >
              Created At
            </div>
            <div
              className='site-repo-link header'
              data-sort='repo'
              onClick={this.handleSort}
              title='Click to sort by repo link'
              >
              Repo
            </div>
          </div>
          {this.renderSites()}
        </div>
      </div>
    )
  }
}
