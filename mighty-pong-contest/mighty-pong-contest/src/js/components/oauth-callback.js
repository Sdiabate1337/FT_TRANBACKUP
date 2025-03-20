import { handleOAuthCallback } from '../../services/auth.js';
import { navigateTo } from '../router.js';

export async function renderOAuthCallback(container) {
    container.innerHTML = `
        <div class="cyber-arena">
            <div class="arena-bg">
                <div class="cyber-grid"></div>
            </div>
            <div class="scan-effect"></div>
            <div class="main-container">
                <div class="holo-panel" style="max-width: 500px; margin: 0 auto;">
                    <h1 class="cyber-title">AUTHENTIFICATION EN COURS</h1>
                    <div class="info-box mb-4">
                        <p>Connexion avec 42 en cours, veuillez patienter...</p>
                    </div>
                    <div id="auth-status" class="text-center">
                        <div class="spinner-border text-info" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Extraire le code d'autorisation de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        try {
            // Traiter le code d'autorisation
            await handleOAuthCallback(code);
            // Note: handleOAuthCallback gèrera la navigation vers dashboard ou 2FA
        } catch (error) {
            console.error("Erreur lors du traitement du callback OAuth:", error);
            document.getElementById('auth-status').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Erreur d'authentification: ${error.message || 'Une erreur est survenue'}
                </div>
                <button class="cyber-btn mt-3" onclick="navigateTo('/')">
                    <i class="bi bi-house-door me-2"></i>
                    RETOUR À L'ACCUEIL
                </button>
            `;
        }
    } else {
        console.error("Aucun code d'autorisation trouvé dans l'URL");
        document.getElementById('auth-status').innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Aucun code d'autorisation trouvé
            </div>
            <button class="cyber-btn mt-3" onclick="window.location.href='/'">
                <i class="bi bi-house-door me-2"></i>
                RETOUR À L'ACCUEIL
            </button>
        `;
    }
}