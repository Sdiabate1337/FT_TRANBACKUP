import { createAuthModal } from './AuthModal.js';
import { createLoginForm } from '../forms/LoginForm.js';
import { createRegisterForm } from '../forms/RegisterForm.js';
import { createVerify2FAForm } from '../forms/Verify2FAForm.js';
import { createVerifyEmailForm } from '../forms/VerifyEmailForm.js';
import { createForgotPasswordForm } from '../forms/ForgotPasswordForm.js';

// État actuel
let currentModal = null;

/**
 * Ouvre une modale de connexion
 */
export function openLoginModal() {
    // Fermer la modale précédente si elle existe
    if (currentModal) currentModal.close();
    
    // Créer une nouvelle modale
    currentModal = createAuthModal({
        id: 'login-modal',
        title: 'Connexion',
        onClose: () => { currentModal = null; }
    });
    
    // Créer le formulaire de connexion
    createLoginForm(currentModal.content, {
        onRegisterClick: () => switchToRegisterModal(),
        onForgotPasswordClick: () => switchToForgotPasswordModal(),
        onNeed2FA: (data) => switchTo2FAModal(data),
    });
    
    // Ouvrir la modale
    currentModal.open();
}

/**
 * Ouvre une modale d'inscription
 */
export function openRegisterModal() {
    if (currentModal) currentModal.close();
    
    currentModal = createAuthModal({
        id: 'register-modal',
        title: 'Créer un compte',
        onClose: () => { currentModal = null; }
    });
    
    createRegisterForm(currentModal.content, {
        onLoginClick: () => switchToLoginModal(),
        onSuccess: (email) => switchToVerifyEmailModal(email)
    });
    
    currentModal.open();
}

/**
 * Ouvre une modale de vérification 2FA
 */
export function open2FAModal(data = {}) {
    if (currentModal) currentModal.close();
    
    currentModal = createAuthModal({
        id: 'verify-2fa-modal',
        title: 'Authentification à deux facteurs',
        backdropClose: false,
        onClose: () => { currentModal = null; }
    });
    
    createVerify2FAForm(currentModal.content, {
        tempToken: data.temp_token || localStorage.getItem('tempToken'),
        onCancel: () => switchToLoginModal()
    });
    
    currentModal.open();
}

/**
 * Ouvre une modale de vérification d'email
 */
export function openVerifyEmailModal(email = null) {
    if (currentModal) currentModal.close();
    
    currentModal = createAuthModal({
        id: 'verify-email-modal',
        title: 'Vérification de l\'email',
        backdropClose: false,
        onClose: () => { currentModal = null; }
    });
    
    createVerifyEmailForm(currentModal.content, {
        email: email || localStorage.getItem('verificationEmail'),
        onCancel: () => switchToLoginModal()
    });
    
    currentModal.open();
}

/**
 * Ouvre une modale de récupération de mot de passe
 */
export function openForgotPasswordModal() {
    if (currentModal) currentModal.close();
    
    currentModal = createAuthModal({
        id: 'forgot-password-modal',
        title: 'Récupération de mot de passe',
        onClose: () => { currentModal = null; }
    });
    
    createForgotPasswordForm(currentModal.content, {
        onCancel: () => switchToLoginModal()
    });
    
    currentModal.open();
}

// Fonctions de transition entre modales
function switchToLoginModal() {
    setTimeout(() => openLoginModal(), 300);
}

function switchToRegisterModal() {
    setTimeout(() => openRegisterModal(), 300);
}

function switchToForgotPasswordModal() {
    setTimeout(() => openForgotPasswordModal(), 300);
}

function switchTo2FAModal(data) {
    setTimeout(() => open2FAModal(data), 300);
}

function switchToVerifyEmailModal(email) {
    setTimeout(() => openVerifyEmailModal(email), 300);
}