import React, { Component } from 'react'

export default class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="button-wrapper">
          <a href="/.netlify/functions/auth-start">
            Netlify OAuth login
          </a>
        </div>
      </div>
    )
  }
}
