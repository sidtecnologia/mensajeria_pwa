import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.__pwaPrompt = null
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault()
  window.__pwaPrompt = e
  window.dispatchEvent(new Event('pwaPromptReady'))
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function() {})
  })
}
