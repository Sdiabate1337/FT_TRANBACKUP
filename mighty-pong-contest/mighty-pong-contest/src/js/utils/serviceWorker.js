// Configuration du Service Worker pour PWA

export function setupServiceWorker() {
    // Vérifier si les service workers sont supportés
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker enregistré avec succès:', registration);
                })
                .catch(error => {
                    console.log('Échec d\'enregistrement du Service Worker:', error);
                });
        });
    }
}