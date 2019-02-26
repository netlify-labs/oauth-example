import React, { Component } from 'react'
import NetlifyAPI from 'netlify'
import { csrfToken, parseHash, removeHash, matchText } from './utils'
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
      loading: false
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
  renderSites = () => {
    const { sites, filterText, loading } = this.state

    if (loading) {
      return (
        <div>Loading sites...</div>
      )
    }

    let matchingSites = sites.filter(site => {
       // No search query. Show all
       if (!filterText) {
         return true
       }

       const { name, site_id, ssl_url } = site
       if (
         matchText(filterText, name) ||
         matchText(filterText, site_id) ||
         matchText(filterText, ssl_url)
        ) {
         return true
       }
       // no match!
       return false
     }).map((site, i) => {
       return (
         <div className='site-wrapper' key={i}>
           <div className='site-screenshot'>
             <img src={site.screenshot_url} alt='hi' />
           </div>
           <div className='site-info'>
             <h2>
               <a href={site.admin_url}>
                 {site.name}
               </a>
             </h2>
             <div className='site-meta'>
               <a href={site.ssl_url}>
                 {site.ssl_url}
               </a>
             </div>
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
            placeholder='Search for sites'
          />
          {this.renderSites()}
        </div>
      </div>
    )
  }
}
