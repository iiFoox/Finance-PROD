import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Forçar recarregamento do favicon
const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
if (link) {
  link.href = link.href.split('?')[0] + '?v=' + new Date().getTime();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
