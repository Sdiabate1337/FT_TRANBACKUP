import { registerUser } from '../services/auth.js';
import { navigateTo } from '../router.js';
import { generateParticles } from '../utils/particles.js';

export function renderRegister(container) {
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
                <div class="register-container">
                    <!-- Panneau d'inscription -->
                    <div class="holo-panel" style="max-width: 600px; margin: 0 auto;">
                        <h1 class="cyber-title">INSCRIPTION</h1>
                        
                        <div class="info-box mb-4">
                            <p>Créez votre profil pour accéder à l'arène de <strong>PONG</strong> la plus évoluée. Un code de vérification sera envoyé à votre email.</p>
                        </div>
                        
                        <div class="cyber-form">
                            <div class="input-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" class="cyber-input" placeholder="Entrez votre email">
                                <div class="input-error" id="email-error"></div>
                            </div>
                            
                            <div class="form-row">
                                <div class="input-group">
                                    <label for="firstName">Prénom</label>
                                    <input type="text" id="firstName" class="cyber-input" placeholder="Prénom">
                                    <div class="input-error" id="firstName-error"></div>
                                </div>
                                
                                <div class="input-group">
                                    <label for="lastName">Nom</label>
                                    <input type="text" id="lastName" class="cyber-input" placeholder="Nom">
                                    <div class="input-error" id="lastName-error"></div>
                                </div>
                            </div>
                            
                            <div class="input-group">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password" class="cyber-input" placeholder="Minimum 8 caractères">
                                <div class="input-error" id="password-error"></div>
                            </div>
                            
                            <div class="input-group">
                                <label for="password2">Confirmation</label>
                                <input type="password" id="password2" class="cyber-input" placeholder="Confirmez votre mot de passe">
                                <div class="input-error" id="password2-error"></div>
                            </div>
                            
                            <button class="cyber-btn" id="btn-register" style="width: 100%; margin-top: 1rem;">
                                <i class="bi bi-person-plus-fill me-2"></i>
                                CRÉER MON COMPTE
                            </button>
                            
                            <div class="text-center mt-3">
                                <a href="/" class="cyber-link">Retour à l'accueil</a>
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
    document.getElementById('btn-register').addEventListener('click', handleRegister);
}

// Validation simple du formulaire
function validateForm() {
    let isValid = true;
    
    // Réinitialiser les messages d'erreur
    document.querySelectorAll('.input-error').forEach(el => el.textContent = '');
    
    // Valider l'email
    const email = document.getElementById('email').value.trim();
    if (!email) {
        document.getElementById('email-error').textContent = 'L\'email est requis';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email-error').textContent = 'Format d\'email invalide';
        isValid = false;
    }
    
    // Valider le prénom
    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) {
        document.getElementById('firstName-error').textContent = 'Le prénom est requis';
        isValid = false;
    }
    
    // Valider le nom
    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName) {
        document.getElementById('lastName-error').textContent = 'Le nom est requis';
        isValid = false;
    }
    
    // Valider le mot de passe
    const password = document.getElementById('password').value;
    if (!password) {
        document.getElementById('password-error').textContent = 'Le mot de passe est requis';
        isValid = false;
    } else if (password.length < 8) {
        document.getElementById('password-error').textContent = 'Le mot de passe doit contenir au moins 8 caractères';
        isValid = false;
    }
    
    // Valider la confirmation du mot de passe
    const password2 = document.getElementById('password2').value;
    if (password !== password2) {
        document.getElementById('password2-error').textContent = 'Les mots de passe ne correspondent pas';
        isValid = false;
    }
    
    return isValid;
}

// Gérer la soumission du formulaire
async function handleRegister() {
    if (!validateForm()) return;
    
    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    
    try {
        const btn = document.getElementById('btn-register');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> TRAITEMENT...';
        
        const result = await registerUser(email, firstName, lastName, password, password2);
        
        if (!result.error) {
            // Redirection vers la page de vérification d'email est gérée dans la fonction registerUser
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
    } finally {
        const btn = document.getElementById('btn-register');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i> CRÉER MON COMPTE';
    }
}