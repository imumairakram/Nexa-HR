import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { RegionalSettingsProvider } from './context/RegionalSettingsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RegionalSettingsProvider>
        <App />
      </RegionalSettingsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
