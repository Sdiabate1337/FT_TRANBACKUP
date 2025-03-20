import { renderHome } from './components/home.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderRegistration } from './components/registration.js';
import { renderTournament } from './components/tournament.js';
import { renderAbout } from './components/about.js';
import { renderDashboard } from './components/dashboard.js';
import { renderOAuthCallback } from './components/oauth-callback.js';
import { renderNotFound } from './components/errors/not-found.js';
import { showNotification } from './utils/notifications.js';

// Route actuelle
let currentRoute = null;

// Routes avec fonctions de rendu et nettoyage
const routes = {
    '/': { render: renderHome, cleanup: null },
    '/leaderboard': { render: renderLeaderboard, cleanup: null },
    '/registration': { render: renderRegistration, cleanup: null },
    '/tournament': { render: renderTournament, cleanup: null },
    '/about': { render: renderAbout, cleanup: null },
    '/dashboard': { render: renderDashboard, cleanup: null, requiresAuth: false },
    '/oauth-callback': { render: renderOAuthCallback, cleanup: null },
    '/404': { render: renderNotFound, cleanup: null }
};

// Initialize router
export function initRouter() {
    // Handle initial page load
    handleRouteChange();
    
    // Handle popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Delegate click events on links
    document.body.addEventListener('click', (e) => {
        // Find the closest 'a' tag if the click was on a child element
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target || target === document.body) break;
        }
        
        // If we found a link and it's an internal link
        if (target && target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
            e.preventDefault();
            navigateTo(target.getAttribute('href'));
        }
    });
}

// Handle route changes
function handleRouteChange() {
    const path = window.location.pathname;
    const routeObj = routes[path] || routes['/404'];
    
    // Vérifier l'authentification pour les routes protégées
    if (routeObj.requiresAuth && !isAuthenticated()) {
        showNotification('Vous devez être connecté pour accéder à cette page', 'warning');
        navigateTo('/');
        return;
    }
    
    const contentDiv = document.getElementById('content');
    
    // Animation de sortie
    contentDiv.classList.add('page-transition-out');
    
    // Exécuter la fonction de nettoyage pour la route actuelle
    if (currentRoute && routes[currentRoute]?.cleanup) {
        try {
            routes[currentRoute].cleanup();
        } catch (error) {
            console.error(`Erreur lors du nettoyage de la route ${currentRoute}:`, error);
        }
    }
    
    // Mettre à jour la route actuelle
    currentRoute = path;
    
    // Après l'animation de sortie, rendre la nouvelle vue
    setTimeout(() => {
        contentDiv.innerHTML = '';
        
        try {
            routeObj.render(contentDiv);
        } catch (error) {
            console.error(`Erreur lors du rendu de la route ${path}:`, error);
            contentDiv.innerHTML = `<div class="error-container">
                <h1>Erreur de chargement</h1>
                <p>Une erreur est survenue lors du chargement de cette page.</p>
                <button onclick="window.location.reload()">Recharger</button>
            </div>`;
        }
        
        // Animation d'entrée
        contentDiv.classList.remove('page-transition-out');
        contentDiv.classList.add('page-transition-in');
        
        // Supprimer la classe d'animation après la fin
        setTimeout(() => {
            contentDiv.classList.remove('page-transition-in');
        }, 500);
        
        // Faire défiler vers le haut de la page
        window.scrollTo(0, 0);
    }, 300);
}

// Navigate to a specific path
export function navigateTo(path, params = {}, options = {}) {
    const { silent = false, replace = false } = options;
    
    // Si des paramètres sont fournis, les ajouter à l'URL
    let url = path;
    if (Object.keys(params).length > 0) {
        const urlObj = new URL(path, window.location.origin);
        Object.keys(params).forEach(key => {
            urlObj.searchParams.set(key, params[key]);
        });
        url = urlObj.pathname + urlObj.search;
    }
    
    // Mettre à jour l'historique
    if (replace) {
        history.replaceState(null, null, url);
    } else {
        history.pushState(null, null, url);
    }
    
    // Ne pas déclencher la navigation si l'option silent est true
    if (!silent) {
        handleRouteChange();
    }
}

// Rediriger avec un message
export function redirectWithMessage(path, message, type = 'info', params = {}) {
    navigateTo(path, params, { silent: true });
    showNotification(message, type);
    handleRouteChange();
}

// Vérifier si l'utilisateur est authentifié
function isAuthenticated() {
    return localStorage.getItem('accessToken') !== null;
}

// Obtenir les paramètres de requête sous forme d'objet
export function getQueryParams() {
    const queryParams = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
        queryParams[key] = value;
    }
    
    return queryParams;
}

// Mettre à jour les paramètres d'URL sans recharger la page
export function updateQueryParams(params = {}, options = { replace: true }) {
    const currentParams = getQueryParams();
    const updatedParams = { ...currentParams, ...params };
    
    // Supprimer les paramètres avec valeur null ou undefined
    Object.keys(updatedParams).forEach(key => {
        if (updatedParams[key] === null || updatedParams[key] === undefined) {
            delete updatedParams[key];
        }
    });
    
    navigateTo(window.location.pathname, updatedParams, options);
}