import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { AppThemeProvider } from './components/ThemeProvider.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppThemeProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AppThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
