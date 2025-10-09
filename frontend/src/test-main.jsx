// Test main.jsx to verify the basic setup
import React from 'react'
import ReactDOM from 'react-dom/client'
import TestApp from './TestApp.jsx'

console.log('main.jsx is loading...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)

console.log('TestApp should be rendered');