import { renderHome } from './components/home.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { renderRegistration } from './components/registration.js';
import { renderTournament } from './components/tournament.js';
import { renderAbout } from './components/about.js';
import { renderRegister } from './components/register.js';
import { renderVerifyEmail } from './components/verify-email.js';
import { renderVerify2FA } from './components/verify-2fa.js';
import { renderDashboard } from './components/dashboard.js';
import { renderOAuthCallback } from './components/oauth-callback.js';

// Define routes
const routes = {
    '/': renderHome,
    '/leaderboard': renderLeaderboard,
    '/registration': renderRegistration,
    '/tournament': renderTournament,
    '/about': renderAbout,
    '/register': renderRegister,
    '/verify-email': renderVerifyEmail,
    '/2fa-verification': renderVerify2FA,
    '/dashboard': renderDashboard,
    '/oauth-callback': renderOAuthCallback
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
    const renderFunction = routes[path] || routes['/'];
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    renderFunction(contentDiv);
}

// Navigate to a specific path
export function navigateTo(path, params = {}) {
    // Si des paramètres sont fournis, les ajouter à l'URL
    if (Object.keys(params).length > 0) {
        const url = new URL(path, window.location.origin);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        history.pushState(null, null, url);
    } else {
        history.pushState(null, null, path);
    }
    handleRouteChange();
}