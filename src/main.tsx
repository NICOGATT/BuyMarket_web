// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from 'react'; 
import ReactDOM from 'react-dom/client'
import "./App.css"
import { GoogleOAuthProvider } from '@react-oauth/google';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
