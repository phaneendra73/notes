import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { AppThemeProvider } from './components/ThemeProvider.jsx';
import { Toaster } from './components/Toaster.jsx';
import './index.css';

const basename = import.meta.env.MODE === 'production' ? '/kadha2.0' : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppThemeProvider>
        <BrowserRouter basename={basename}>
          <Toaster>
            <App />
          </Toaster>
        </BrowserRouter>
      </AppThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
