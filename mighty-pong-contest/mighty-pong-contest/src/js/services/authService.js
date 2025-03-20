// Service centralisé pour les appels d'API liés à l'authentification

const API_BASE_URL = 'http://127.0.0.1:8000/v1/MyAuth';

// Login
export async function apiLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

// Register
export async function apiRegister(userData) {
    const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

// Verify Email
export async function apiVerifyEmail(email, otp) {
    const response = await fetch(`${API_BASE_URL}/verify-email/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

// Verify 2FA
export async function apiVerify2FA(code, token) {
    const response = await fetch(`${API_BASE_URL}/verify-2fa/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code }),
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

// OAuth 42 redirect
export function apiOAuth42Redirect() {
    window.location.href = `${API_BASE_URL}/oauth/42/`;
}

// Enable 2FA
export async function apiEnable2FA(confirmation) {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/enable2FA/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmation }),
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

// Disable 2FA
export async function apiDisable2FA(confirmation) {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/Disable2FA/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmation }),
    });
    
    const data = await response.json();
    return { status: response.status, data };
}

// Ajouter cette fonction d'intercepteur dans votre authService.js existant

// Fonction pour configurer les intercepteurs d'authentification
export function setupAuthInterceptors() {
    // Intercepter les réponses 401 (Unauthorized) et rediriger vers la page de connexion
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options = {}) {
        const response = await originalFetch(url, options);
        
        if (response.status === 401) {
            const responseData = await response.clone().json().catch(() => ({}));
            
            // Si le token est expiré et qu'on a un refresh token
            if (responseData.error === 'Token expired' && localStorage.getItem('refreshToken')) {
                try {
                    // Appeler l'API pour rafraîchir le token
                    const refreshResult = await originalFetch('http://127.0.0.1:8000/v1/MyAuth/refresh-token/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            refresh_token: localStorage.getItem('refreshToken')
                        })
                    });
                    
                    const refreshData = await refreshResult.json();
                    
                    if (refreshResult.ok) {
                        // Mettre à jour les tokens
                        localStorage.setItem('accessToken', refreshData.access_token);
                        
                        // Refaire la requête originale avec le nouveau token
                        const newOptions = { ...options };
                        
                        if (!newOptions.headers) {
                            newOptions.headers = {};
                        }
                        
                        newOptions.headers['Authorization'] = `Bearer ${refreshData.access_token}`;
                        
                        return originalFetch(url, newOptions);
                    } else {
                        // Échec du rafraîchissement, déconnecter l'utilisateur
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        
                        window.location.pathname = '/';
                    }
                } catch (error) {
                    console.error('Erreur lors du rafraîchissement du token:', error);
                    
                    // Déconnecter l'utilisateur en cas d'erreur
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userId');
                    
                    window.location.pathname = '/';
                }
            } else {
                // Rediriger vers la page de connexion pour les autres erreurs d'authentification
                if (window.location.pathname !== '/') {
                    window.location.pathname = '/';
                }
            }
        }
        
        return response;
    };
}