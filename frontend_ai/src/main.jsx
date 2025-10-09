import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';

// Replace with your actual client ID
const GOOGLE_CLIENT_ID = '532809781253-39iuhvpkej6b2s3i17aqeiukrfl324el.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
