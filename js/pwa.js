export function initializePWA() {
    // PWA caching has been disabled to ensure the latest CSS and JS always load
    // after a page refresh.
    if (!("serviceWorker" in navigator)) {
        return;
    }

    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(registration) {
            registration.unregister();
        });
    }).catch(function() {
        // Ignore unregister failures; the app should still work without caching.
    });
}