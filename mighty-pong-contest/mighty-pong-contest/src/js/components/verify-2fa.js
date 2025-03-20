import { verify2FA } from '../services/auth.js';

export function renderVerify2FA(container) {
    // Contenu HTML principal
    container.innerHTML = `
        <div class="cyber-arena">
            <!-- Effets d'arrière-plan -->
            <div class="arena-bg">
                <div class="cyber-grid"></div>
                <div class="particles" id="particles-container">
                    <!-- Les particules seront générées en JS -->
                </div>
            </div>
            
            <!-- Effet scanline -->
            <div class="scan-effect"></div>
            
            <!-- Contenu principal -->
            <div class="main-container">
                <div class="verify-2fa-container">
                    <!-- Panneau de vérification 2FA -->
                    <div class="holo-panel" style="max-width: 500px; margin: 0 auto;">
                        <div class="cyber-shield-icon mb-4">
                            <i class="bi bi-shield-lock-fill"></i>
                        </div>
                        
                        <h1 class="cyber-title">AUTHENTIFICATION À DEUX FACTEURS</h1>
                        
                        <div class="info-box mb-4">
                            <p>Veuillez saisir le code à 6 chiffres généré par votre application d'authentification.</p>
                        </div>
                        
                        <div class="cyber-form">
                            <div class="otp-input-group">
                                <input type="text" id="code-2fa" class="cyber-input" placeholder="Code à 6 chiffres" maxlength="6" autocomplete="one-time-code">
                                <div class="input-error" id="code-error"></div>
                            </div>
                            
                            <button class="cyber-btn" id="btn-verify-2fa" style="width: 100%; margin-top: 2rem;">
                                <i class="bi bi-check-circle me-2"></i>
                                VÉRIFIER
                            </button>
                            
                            <div class="text-center mt-4">
                                <a href="/" class="cyber-link">
                                    <i class="bi bi-arrow-left me-1"></i>
                                    Retour à l'accueil
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Générer les particules
    generateParticles();
    
    // Attacher les événements
    document.getElementById('btn-verify-2fa').addEventListener('click', handleVerify2FA);
    
    // Focus sur le champ de saisie
    document.getElementById('code-2fa').focus();
}

// Générer des particules aléatoires
function generateParticles() {
    const particlesContainer = document.getElementById('particles-container');
    if (!particlesContainer) return;
    
    let particles = '';
    for (let i = 0; i < 50; i++) {
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;
        const drift = Math.random() * 20 - 10;
        const opacity = Math.random() * 0.5 + 0.1;
        
        particles += `<div class="particle" style="left: ${posX}%; --duration: ${duration}s; --drift: ${drift}; width: ${size}px; height: ${size}px; opacity: ${opacity}; animation-delay: -${delay}s;"></div>`;
    }
    particlesContainer.innerHTML = particles;
}

// Gérer la vérification 2FA
async function handleVerify2FA() {
    const code = document.getElementById('code-2fa').value.trim();
    
    // Validation simple
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        document.getElementById('code-error').textContent = 'Veuillez entrer un code à 6 chiffres valide';
        return;
    }
    
    // Récupérer le token temporaire du localStorage
    const tempToken = localStorage.getItem('temp_token');
    
    if (!tempToken) {
        document.getElementById('code-error').textContent = 'Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    try {
        const btn = document.getElementById('btn-verify-2fa');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> VÉRIFICATION...';
        
        // Appel à l'API pour vérifier le code 2FA
        const result = await verify2FA(code, tempToken);
        
        if (!result.error) {
            // La redirection vers le dashboard est gérée dans la fonction verify2FA
        }
    } catch (error) {
        console.error('Erreur lors de la vérification 2FA:', error);
    } finally {
        const btn = document.getElementById('btn-verify-2fa');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle me-2"></i> VÉRIFIER';
    }
}