import { registerUser } from '../../../../services/auth.js';

/**
 * Crée un formulaire d'inscription
 * @param {HTMLElement} container Conteneur où insérer le formulaire
 * @param {Object} options Options du formulaire
 */
export function createRegisterForm(container, options = {}) {
    const {
        onSuccess = () => {},
        onLoginClick = () => {}
    } = options;
    
    container.innerHTML = `
        <div class="cyber-form">
            <div class="form-row">
                <div class="input-group">
                    <label for="first_name">Prénom</label>
                    <input type="text" id="first_name" class="cyber-input" placeholder="Votre prénom" required>
                    <div class="input-error" id="first-name-error"></div>
                </div>
                
                <div class="input-group">
                    <label for="last_name">Nom</label>
                    <input type="text" id="last_name" class="cyber-input" placeholder="Votre nom" required>
                    <div class="input-error" id="last-name-error"></div>
                </div>
            </div>
            
            <div class="input-group">
                <label for="reg-email">Email</label>
                <input type="email" id="reg-email" class="cyber-input" placeholder="votre@email.com" required>
                <div class="input-error" id="reg-email-error"></div>
            </div>
            
            <div class="input-group">
                <label for="reg-password">Mot de passe</label>
                <input type="password" id="reg-password" class="cyber-input" placeholder="Minimum 8 caractères" required>
                <div class="input-error" id="reg-password-error"></div>
            </div>
            
            <div class="input-group">
                <label for="reg-password2">Confirmer le mot de passe</label>
                <input type="password" id="reg-password2" class="cyber-input" placeholder="Confirmer votre mot de passe" required>
                <div class="input-error" id="reg-password2-error"></div>
            </div>
            
            <div class="form-message mt-2" id="register-form-message"></div>
            
            <button type="button" class="cyber-btn w-100 mt-3" id="submit-register">
                <i class="bi bi-person-plus-fill me-2"></i>
                CRÉER COMPTE
            </button>
            
            <div class="text-center mt-3">
                <p>Déjà un compte? <a href="#" class="cyber-link" id="login-link">Connectez-vous</a></p>
            </div>
        </div>
    `;
    
    // Initialiser les événements
    const registerBtn = document.getElementById('submit-register');
    const loginLink = document.getElementById('login-link');
    
    // Gérer la soumission du formulaire
    registerBtn.addEventListener('click', async () => {
        // Réinitialiser les messages d'erreur
        const formMessage = document.getElementById('register-form-message');
        document.getElementById('first-name-error').innerHTML = '';
        document.getElementById('last-name-error').innerHTML = '';
        document.getElementById('reg-email-error').innerHTML = '';
        document.getElementById('reg-password-error').innerHTML = '';
        document.getElementById('reg-password2-error').innerHTML = '';
        
        // Animation de chargement
        formMessage.innerHTML = '<div class="loading-message">Création du compte en cours...</div>';
        
        // Récupérer les valeurs des champs
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const password2 = document.getElementById('reg-password2').value;
        
        // Validation simple
        let isValid = true;
        
        if (!first_name) {
            document.getElementById('first-name-error').innerHTML = 'Le prénom est requis';
            isValid = false;
        }
        
        if (!last_name) {
            document.getElementById('last-name-error').innerHTML = 'Le nom est requis'; 
            isValid = false;
        }
        
        if (!email) {
            document.getElementById('reg-email-error').innerHTML = 'L\'email est requis';
            isValid = false;
        }
        
        if (!password) {
            document.getElementById('reg-password-error').innerHTML = 'Le mot de passe est requis';
            isValid = false;
        } else if (password.length < 8) {
            document.getElementById('reg-password-error').innerHTML = 'Le mot de passe doit contenir au moins 8 caractères';
            isValid = false;
        }
        
        if (!password2) {
            document.getElementById('reg-password2-error').innerHTML = 'Veuillez confirmer votre mot de passe';
            isValid = false;
        } else if (password !== password2) {
            document.getElementById('reg-password2-error').innerHTML = 'Les mots de passe ne correspondent pas';
            isValid = false;
        }
        
        if (!isValid) {
            formMessage.innerHTML = '';
            return;
        }
        
        try {
            const result = await registerUser(first_name, last_name, email, password);
            
            if (result.status === 201) {
                // Stocker l'email pour la vérification
                localStorage.setItem('verificationEmail', email);
                
                // Afficher le message de succès
                formMessage.innerHTML = '<div class="success-message">Compte créé avec succès!</div>';
                
                // Appeler le callback de succès
                setTimeout(() => {
                    onSuccess(email);
                }, 1000);
            } else {
                // Gérer les erreurs
                formMessage.innerHTML = `<div class="error-message">${result.data?.error || 'Erreur lors de la création du compte'}</div>`;
                
                // Afficher les erreurs spécifiques aux champs
                if (result.data?.details) {
                    const details = result.data.details;
                    if (details.email) document.getElementById('reg-email-error').innerHTML = details.email;
                    if (details.password) document.getElementById('reg-password-error').innerHTML = details.password;
                    if (details.first_name) document.getElementById('first-name-error').innerHTML = details.first_name;
                    if (details.last_name) document.getElementById('last-name-error').innerHTML = details.last_name;
                }
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            formMessage.innerHTML = '<div class="error-message">Erreur de connexion au serveur</div>';
        }
    });
    
    // Navigation
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        onLoginClick();
    });
}