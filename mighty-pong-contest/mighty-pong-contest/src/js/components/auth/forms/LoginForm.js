import { loginWithCredentials, loginWith42 } from '../../../../services/auth.js';
import { navigateTo } from '../../../router.js';
import { showNotification } from '../../../utils/notifications.js';

/**
 * Crée un formulaire de connexion
 * @param {HTMLElement} container Conteneur où insérer le formulaire
 * @param {Object} options Options du formulaire
 * @returns {Object} API du formulaire
 */
export function createLoginForm(container, options = {}) {
    const {
        onSuccess = () => {},
        onNeed2FA = () => {},
        onRegisterClick = () => {},
        onForgotPasswordClick = () => {}
    } = options;
    
    // Injecter le HTML du formulaire
    container.innerHTML = `
        <div class="cyber-form">
            <div class="input-group">
                <label for="email">Email</label>
                <input type="email" id="email" class="cyber-input" placeholder="Entrez votre email">
                <div class="input-error" id="email-error"></div>
            </div>
            <div class="input-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" class="cyber-input" placeholder="Entrez votre mot de passe">
                <div class="input-error" id="password-error"></div>
            </div>
            
            <div class="form-message mt-2" id="login-form-message"></div>
            
            <button class="cyber-btn w-100 mt-3" id="submit-login">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                CONNEXION
            </button>
            
            <div class="d-flex justify-content-between mt-3">
                <a href="#" class="cyber-link" id="forgot-password-link">Mot de passe oublié?</a>
            </div>
            
            <div class="text-center mt-3">
                <div class="cyber-divider"><span>OU</span></div>
            </div>
            
            <button class="cyber-btn cyber-btn-42 w-100 mt-3" id="login-with-42">
                <i class="bi bi-42-circle me-2"></i>
                CONNEXION 42
            </button>
            
            <div class="text-center mt-4">
                <a href="#" class="cyber-link" id="register-link">Pas encore de compte? S'inscrire</a>
            </div>
        </div>
    `;
    
    // Récupérer les éléments
    const submitBtn = document.getElementById('submit-login');
    const loginWith42Btn = document.getElementById('login-with-42');
    const registerLink = document.getElementById('register-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    
    // Gérer la connexion standard
    submitBtn.addEventListener('click', async () => {
        // Réinitialiser les erreurs
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';
        const formMessage = document.getElementById('login-form-message');
        formMessage.innerHTML = '<div class="loading-message">Connexion en cours...</div>';
        
        // Récupérer les valeurs
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation simple
        let isValid = true;
        if (!email) {
            document.getElementById('email-error').textContent = 'L\'email est requis';
            isValid = false;
        }
        
        if (!password) {
            document.getElementById('password-error').textContent = 'Le mot de passe est requis';
            isValid = false;
        }
        
        if (!isValid) {
            formMessage.innerHTML = '';
            return;
        }
        
        try {
            const result = await loginWithCredentials(email, password);
            
            if (result.status === 200) {
                // Connexion réussie
                formMessage.innerHTML = '<div class="success-message">Connexion réussie!</div>';
                
                // Stocker les tokens
                localStorage.setItem('accessToken', result.data.token);
                if (result.data.user) {
                    localStorage.setItem('userId', result.data.user.id);
                    localStorage.setItem('userEmail', result.data.user.email);
                }
                
                // Notification et callback
                showNotification('Connexion réussie!', 'success');
                onSuccess(result.data);
                
                // Redirection au dashboard
                setTimeout(() => {
                    navigateTo('/dashboard');
                }, 1000);
                
            } else if (result.status === 202) {
                // 2FA requis
                formMessage.innerHTML = '<div class="info-message">Vérification à deux facteurs requise</div>';
                localStorage.setItem('tempToken', result.data.temp_token);
                
                // Callback pour ouvrir la modale 2FA
                onNeed2FA(result.data);
                
            } else {
                // Erreur de connexion
                if (result.data && result.data.error) {
                    formMessage.innerHTML = `<div class="error-message">${result.data.error}</div>`;
                } else {
                    formMessage.innerHTML = `<div class="error-message">Identifiants invalides</div>`;
                }
                
                // Animation d'erreur
                container.classList.add('error');
                setTimeout(() => {
                    container.classList.remove('error');
                }, 500);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            formMessage.innerHTML = `<div class="error-message">Erreur de connexion au serveur</div>`;
        }
    });
    
    // Connexion avec 42
    loginWith42Btn.addEventListener('click', () => {
        loginWith42();
    });
    
    // Liens de navigation
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        onRegisterClick();
    });
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        onForgotPasswordClick();
    });
    
    // API publique
    return {
        getEmail: () => document.getElementById('email').value.trim(),
        getPassword: () => document.getElementById('password').value,
        setEmail: (value) => { document.getElementById('email').value = value; },
        setError: (message) => {
            document.getElementById('login-form-message').innerHTML = 
                `<div class="error-message">${message}</div>`;
        },
        setLoading: () => {
            document.getElementById('login-form-message').innerHTML = 
                '<div class="loading-message">Connexion en cours...</div>';
        },
        reset: () => {
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('email-error').textContent = '';
            document.getElementById('password-error').textContent = '';
            document.getElementById('login-form-message').innerHTML = '';
        }
    };
}