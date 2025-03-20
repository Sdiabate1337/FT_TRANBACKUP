import { verifyEmail, resendVerificationCode } from '../../../../services/auth.js';

/**
 * Crée un formulaire de vérification d'email
 * @param {HTMLElement} container Conteneur où insérer le formulaire
 * @param {Object} options Options du formulaire
 */
export function createVerifyEmailForm(container, options = {}) {
    const {
        email = localStorage.getItem('verificationEmail'),
        onSuccess = () => {},
        onCancel = () => {}
    } = options;
    
    container.innerHTML = `
        <div class="cyber-form">
            <div class="verification-info mb-4">
                <p>Un code de vérification a été envoyé à <strong id="verify-email-address">${email || ''}</strong></p>
                <p>Veuillez saisir ce code ci-dessous pour activer votre compte.</p>
            </div>
            
            <div class="input-group">
                <label for="otp-code">Code de vérification</label>
                <input type="text" id="otp-code" class="cyber-input" placeholder="Entrez le code à 6 chiffres" maxlength="6">
                <div class="input-error" id="otp-error"></div>
            </div>
            
            <div class="form-message mt-2" id="verify-email-form-message"></div>
            
            <button class="cyber-btn w-100 mt-3" id="submit-verify-email">
                <i class="bi bi-check-circle-fill me-2"></i>
                VÉRIFIER
            </button>
            
            <div class="text-center mt-3">
                <a href="#" class="cyber-link" id="resend-code">Renvoyer le code</a>
            </div>
            
            <div class="text-center mt-2">
                <a href="#" class="cyber-link" id="back-to-login">Retour à la connexion</a>
            </div>
        </div>
    `;
    
    // Vérifier si on a un email à vérifier
    if (!email) {
        document.getElementById('verify-email-form-message').innerHTML = 
            `<div class="error-message">Session expirée. Veuillez vous réinscrire.</div>`;
        
        setTimeout(() => {
            onCancel();
        }, 2000);
        
        return;
    }
    
    // Récupérer les éléments
    const verifyBtn = document.getElementById('submit-verify-email');
    const resendBtn = document.getElementById('resend-code');
    const cancelBtn = document.getElementById('back-to-login');
    
    // Gérer la vérification
    verifyBtn.addEventListener('click', async () => {
        const codeError = document.getElementById('otp-error');
        const formMessage = document.getElementById('verify-email-form-message');
        
        codeError.textContent = '';
        formMessage.innerHTML = '<div class="loading-message">Vérification en cours...</div>';
        
        const code = document.getElementById('otp-code').value.trim();
        
        // Validation simple
        if (!code) {
            codeError.textContent = 'Le code de vérification est requis';
            formMessage.innerHTML = '';
            return;
        }
        
        try {
            const result = await verifyEmail(email, code);
            
            if (result.status === 200) {
                // Vérification réussie
                formMessage.innerHTML = '<div class="success-message">Email vérifié avec succès!</div>';
                
                // Nettoyer le storage
                localStorage.removeItem('verificationEmail');
                
                // Callback
                setTimeout(() => {
                    onSuccess();
                }, 1500);
                
            } else {
                // Erreur
                formMessage.innerHTML = `<div class="error-message">${result.data?.error || 'Code de vérification invalide'}</div>`;
            }
        } catch (error) {
            console.error('Erreur de vérification d\'email:', error);
            formMessage.innerHTML = `<div class="error-message">Erreur de connexion au serveur</div>`;
        }
    });
    
    // Renvoyer le code
    resendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const formMessage = document.getElementById('verify-email-form-message');
        
        formMessage.innerHTML = '<div class="loading-message">Envoi du code en cours...</div>';
        
        try {
            const result = await resendVerificationCode(email);
            
            if (result.status === 200) {
                formMessage.innerHTML = '<div class="success-message">Un nouveau code a été envoyé!</div>';
            } else {
                formMessage.innerHTML = `<div class="error-message">${result.data?.error || 'Erreur lors de l\'envoi du code'}</div>`;
            }
        } catch (error) {
            console.error('Erreur de renvoi de code:', error);
            formMessage.innerHTML = '<div class="error-message">Erreur de connexion au serveur</div>';
        }
    });
    
    // Annulation
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onCancel();
    });
}