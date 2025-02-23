// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

import './assets/styles/style.scss';
import './assets/styles/index.css';

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
