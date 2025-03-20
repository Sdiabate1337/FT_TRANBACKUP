import { verify2FA } from '../../../../services/auth.js';
import { navigateTo } from '../../../router.js';

/**
 * Crée un formulaire de vérification 2FA
 * @param {HTMLElement} container Conteneur où insérer le formulaire
 * @param {Object} options Options du formulaire
 */
export function createVerify2FAForm(container, options = {}) {
    const {
        tempToken = localStorage.getItem('tempToken'),
        onSuccess = () => {},
        onCancel = () => {}
    } = options;
    
    container.innerHTML = `
        <div class="cyber-form">
            <div class="verification-info mb-4">
                <p>Une authentification à deux facteurs est requise pour accéder à votre compte.</p>
                <p>Veuillez entrer le code généré par votre application d'authentification.</p>
            </div>
            
            <div class="input-group">
                <label for="twofa-code">Code 2FA</label>
                <input type="text" id="twofa-code" class="cyber-input" placeholder="Entrez le code à 6 chiffres" maxlength="6">
                <div class="input-error" id="twofa-error"></div>
            </div>
            
            <div class="form-message mt-2" id="verify-2fa-form-message"></div>
            
            <button class="cyber-btn w-100 mt-3" id="submit-verify-2fa">
                <i class="bi bi-shield-lock-fill me-2"></i>
                VÉRIFIER
            </button>
            
            <div class="text-center mt-3">
                <a href="#" class="cyber-link" id="back-to-login-2fa">Annuler</a>
            </div>
        </div>
    `;
    
    // Récupérer les éléments
    const verifyBtn = document.getElementById('submit-verify-2fa');
    const cancelBtn = document.getElementById('back-to-login-2fa');
    
    // Vérifier si on a un token temporaire
    if (!tempToken) {
        document.getElementById('verify-2fa-form-message').innerHTML = 
            `<div class="error-message">Session expirée. Veuillez vous reconnecter.</div>`;
        
        setTimeout(() => {
            onCancel();
        }, 2000);
        
        return;
    }
    
    // Gérer la soumission du code 2FA
    verifyBtn.addEventListener('click', async () => {
        const codeError = document.getElementById('twofa-error');
        const formMessage = document.getElementById('verify-2fa-form-message');
        
        codeError.textContent = '';
        formMessage.innerHTML = '<div class="loading-message">Vérification en cours...</div>';
        
        const code = document.getElementById('twofa-code').value.trim();
        
        // Validation simple
        if (!code) {
            codeError.textContent = 'Le code 2FA est requis';
            formMessage.innerHTML = '';
            return;
        }
        
        try {
            const result = await verify2FA(code, tempToken);
            
            if (result.status === 200) {
                // 2FA réussie
                formMessage.innerHTML = '<div class="success-message">Vérification réussie!</div>';
                
                // Stocker le token d'accès
                localStorage.setItem('accessToken', result.data.token);
                localStorage.removeItem('tempToken');
                
                if (result.data.user) {
                    localStorage.setItem('userId', result.data.user.id);
                    localStorage.setItem('userEmail', result.data.user.email);
                }
                
                // Callback
                onSuccess(result.data);
                
                // Redirection
                setTimeout(() => {
                    navigateTo('/dashboard');
                }, 1000);
                
            } else {
                // Erreur
                formMessage.innerHTML = `<div class="error-message">${result.data?.error || 'Code 2FA invalide'}</div>`;
            }
        } catch (error) {
            console.error('Erreur de vérification 2FA:', error);
            formMessage.innerHTML = `<div class="error-message">Erreur de connexion au serveur</div>`;
        }
    });
    
    // Annulation
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onCancel();
    });
}