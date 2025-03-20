import { requestPasswordReset } from '../../../../services/auth.js';

/**
 * Crée un formulaire de récupération de mot de passe
 * @param {HTMLElement} container Conteneur où insérer le formulaire
 * @param {Object} options Options du formulaire
 */
export function createForgotPasswordForm(container, options = {}) {
    const {
        onSuccess = () => {},
        onCancel = () => {}
    } = options;
    
    container.innerHTML = `
        <div class="cyber-form">
            <div class="verification-info mb-4">
                <p>Entrez votre adresse email pour recevoir un lien de réinitialisation du mot de passe.</p>
            </div>
            
            <div class="input-group">
                <label for="forgot-email">Email</label>
                <input type="email" id="forgot-email" class="cyber-input" placeholder="votre@email.com">
                <div class="input-error" id="forgot-email-error"></div>
            </div>
            
            <div class="form-message mt-2" id="forgot-form-message"></div>
            
            <button class="cyber-btn w-100 mt-3" id="submit-forgot-password">
                <i class="bi bi-envelope-fill me-2"></i>
                ENVOYER
            </button>
            
            <div class="text-center mt-3">
                <a href="#" class="cyber-link" id="back-to-login-forgot">Retour à la connexion</a>
            </div>
        </div>
    `;
    
    // Récupérer les éléments
    const submitBtn = document.getElementById('submit-forgot-password');
    const cancelBtn = document.getElementById('back-to-login-forgot');
    
    // Gérer l'envoi du lien de réinitialisation
    submitBtn.addEventListener('click', async () => {
        const emailError = document.getElementById('forgot-email-error');
        const formMessage = document.getElementById('forgot-form-message');
        
        emailError.textContent = '';
        formMessage.innerHTML = '<div class="loading-message">Envoi en cours...</div>';
        
        const email = document.getElementById('forgot-email').value.trim();
        
        // Validation simple
        if (!email) {
            emailError.textContent = 'L\'email est requis';
            formMessage.innerHTML = '';
            return;
        }
        
        try {
            // Ici nous utiliserions normalement un vrai service de réinitialisation
            // Pour l'instant, simulons une réponse positive
            setTimeout(() => {
                formMessage.innerHTML = '<div class="success-message">Si ce compte existe, un email de réinitialisation a été envoyé.</div>';
                
                // Callback de succès après un délai
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }, 1500);
            
            // Version réelle avec API:
            // const result = await requestPasswordReset(email);
            // if (result.status === 200) {
            //     formMessage.innerHTML = '<div class="success-message">Si ce compte existe, un email de réinitialisation a été envoyé.</div>';
            //     setTimeout(() => onSuccess(), 2000);
            // } else {
            //     formMessage.innerHTML = `<div class="error-message">${result.data?.error || 'Erreur lors de l\'envoi'}</div>`;
            // }
            
        } catch (error) {
            console.error('Erreur de demande de réinitialisation:', error);
            formMessage.innerHTML = `<div class="error-message">Erreur de connexion au serveur</div>`;
        }
    });
    
    // Annulation
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onCancel();
    });
}