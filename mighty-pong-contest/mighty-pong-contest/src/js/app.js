// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom CSS
import '../css/custom.css';
import '../css/transitions.css';
import '../css/background.css';
import '../css/dashboard.css';
import '../css/modals.css';
// Ajouter les fichiers manquants lorsqu'ils seront créés
// import '../css/reset.css';
// import '../css/game.css';

// Après vos imports CSS existants
import '../css/modals.css';

// Import utils
// Ces imports seront activés lorsque les fichiers seront créés
// import { initParticles } from './effects/particles.js';
// import { setupServiceWorker } from './utils/serviceWorker.js';
// import { setupAuthInterceptors } from './services/authService.js';

// Import router
import { initRouter } from './router.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Créer la structure de base de l'application
    setupAppStructure();
    
    // Initialiser le routeur
    initRouter();
});

// Crée la structure de base de l'application
function setupAppStructure() {
    const app = document.getElementById('app');
    
    // Si un conteneur app n'existe pas déjà, on en crée un
    if (!app) {
        console.error("L'élément #app n'existe pas. Création d'un nouvel élément...");
        const newApp = document.createElement('div');
        newApp.id = 'app';
        document.body.appendChild(newApp);
    }
    
    // Insérer la structure de base simplifiée (sans header ni footer)
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <main id="content" class="cyber-main-content"></main>
        <div id="notifications-container" class="notifications-container"></div>
        <div id="modal-container" class="modal-container"></div>
    `;
}