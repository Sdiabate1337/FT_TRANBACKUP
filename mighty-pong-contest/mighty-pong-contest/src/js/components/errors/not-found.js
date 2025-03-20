import { navigateTo } from '../../router.js';

export function renderNotFound(container) {
    container.innerHTML = `
        <div class="cyber-arena">
            <div class="arena-bg">
                <div class="cyber-grid"></div>
                <div class="particles" id="particles-container"></div>
            </div>
            
            <div class="main-container error-container">
                <div class="holo-panel error-panel">
                    <h1 class="cyber-title glitch-text">ERREUR 404</h1>
                    <div class="cyber-subtitle mb-4">PAGE NON TROUVÉE</div>
                    
                    <div class="error-description mb-4">
                        <p>La page que vous recherchez a été déconnectée du Cyberspace...</p>
                        <p>Ou peut-être n'a-t-elle jamais existé.</p>
                    </div>
                    
                    <div class="error-code">
                        <pre class="cyber-code">
                            <code>
ERROR: SEGMENT_NOT_FOUND
MEMORY_SECTOR: 0x4F4F5420
TRACE: Protocol breach at node C137
STATUS: Critical
                            </code>
                        </pre>
                    </div>
                    
                    <button class="cyber-btn cyber-btn-42 w-100 mt-4" id="back-home-btn">
                        <i class="bi bi-house-fill me-2"></i>
                        RETOUR À L'ACCUEIL
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Animation glitch pour le texte d'erreur
    const glitchText = container.querySelector('.glitch-text');
    setInterval(() => {
        glitchText.classList.add('shake');
        setTimeout(() => glitchText.classList.remove('shake'), 500);
    }, 3000);
    
    // Gérer le clic sur le bouton de retour
    const backHomeBtn = document.getElementById('back-home-btn');
    backHomeBtn?.addEventListener('click', () => {
        navigateTo('/');
    });
    
    // Réinitialiser les particules si nécessaire
    if (typeof initParticles === 'function') {
        initParticles();
    }
}

export function cleanupNotFound() {
    // Supprimer les éventeurs d'événements
    const backHomeBtn = document.getElementById('back-home-btn');
    backHomeBtn?.removeEventListener('click', () => {
        navigateTo('/');
    });
}