/**
 * Service d'authentification avec les appels API
 */

// URL de base de l'API
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Connexion avec identifiants (email/mot de passe)
 */
export async function loginWithCredentials(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erreur de connexion:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Connexion avec OAuth 42
 */
export function loginWith42() {
    // Rediriger vers l'endpoint OAuth de l'API
    window.location.href = `${API_BASE_URL}/auth/42/redirect`;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function registerUser(first_name, last_name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name, last_name, email, password }),
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Vérification de l'email
 */
export async function verifyEmail(email, code) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code }),
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erreur de vérification d\'email:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Vérification 2FA
 */
export async function verify2FA(code, token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, token }),
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erreur de vérification 2FA:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Réenvoi du code de vérification d'email
 */
export async function resendVerificationCode(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erreur de renvoi de code:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Demande de réinitialisation de mot de passe
 */
export async function requestPasswordReset(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Erreur de demande de réinitialisation:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Traite le callback OAuth après redirection
 * @param {Object} queryParams - Les paramètres de l'URL de redirection
 */
export async function handleOAuthCallback(queryParams) {
    try {
        if (queryParams.error) {
            return { 
                status: 400, 
                data: { 
                    error: queryParams.error_description || 'Erreur d\'authentification OAuth' 
                } 
            };
        }

        if (queryParams.code) {
            // Échanger le code contre un token
            const response = await fetch(`${API_BASE_URL}/auth/42/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: queryParams.code }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Si besoin de 2FA, le serveur renvoie un status 202
                if (response.status === 202 && data.temp_token) {
                    return { 
                        status: 202, 
                        data: { 
                            message: 'Authentification à deux facteurs requise',
                            temp_token: data.temp_token 
                        } 
                    };
                }
                
                // Connexion réussie
                if (data.token) {
                    localStorage.setItem('accessToken', data.token);
                    if (data.user) {
                        localStorage.setItem('userId', data.user.id);
                    }
                }
                
                return { status: 200, data };
            } else {
                return { status: response.status, data };
            }
        }
        
        return { status: 400, data: { error: 'Paramètres OAuth manquants' } };
        
    } catch (error) {
        console.error('Erreur de traitement OAuth:', error);
        return { status: 500, data: { error: 'Erreur de connexion au serveur' } };
    }
}

/**
 * Déconnexion
 */
export function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
}