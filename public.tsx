
// Service worker registration module to handle sw.js activation
export const registerServiceWorker = () => {
  // Guard for environments without service worker support or SSR
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    /**
     * In restricted environments like sandboxed iframes or certain preview tools, 
     * explicit URL construction using window.location.href as a base can fail 
     * if the location is not a standard absolute URL (e.g., 'about:blank').
     * 
     * Using a standard relative path './sw.js' is the most compatible approach.
     */
    const swPath = './sw.js';

    // We only attempt registration once the page is fully loaded to ensure a smooth start.
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swPath)
        .then((registration) => {
          console.log('SUBZS: Service Worker registered successfully');
        })
        .catch((error) => {
          /**
           * Registration failures are common in framed previews, local development 
           * without HTTPS, or private windows. We handle these gracefully by logging 
           * a warning rather than throwing an error that could crash the UI.
           */
          console.warn('SUBZS: Service Worker registration skipped or failed:', error.message);
        });
    });
  } catch (err) {
    /**
     * Robustness: Ensure no unexpected error in this module blocks the main 
     * application thread, preventing white screen issues.
     */
    console.error('SUBZS: Service Worker setup encountered an error:', err);
  }
};
