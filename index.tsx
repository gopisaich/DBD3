
import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * CRITICAL: Global process shim.
 * Many libraries (including parts of the GenAI SDK or its dependencies) 
 * might expect a global 'process' object. We define it here at the 
 * absolute entry point to prevent "ReferenceError: process is not defined".
 */
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
  if (!(window as any).process.env) {
    (window as any).process.env = {};
  }
  // Ensure API_KEY is at least an empty string to avoid undefined checks crashing
  (window as any).process.env.API_KEY = (window as any).process.env.API_KEY || '';
}

// Now we can safely import modules that might use process.env
import App from './App';
import { registerServiceWorker } from './public';

// Register Service Worker with origin safety checks
registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("SUBZS: Critical render error:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; text-align: center;">
      <h1 style="color: #4f46e5;">SUBZS</h1>
      <p>Oops! Something went wrong while starting the app.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 10px;">Retry</button>
    </div>
  `;
}
