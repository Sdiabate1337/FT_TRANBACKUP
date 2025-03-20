import { navigateTo } from '../router.js';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000/v1/MyAuth';

// Fonction de connexion via 42
export function loginWith42() {
    // Redirection vers l'authentification OAuth de 42
    const clientId = "votre_client_id";
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth-callback`);
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
    // Ici, nous devons utiliser une redirection réelle car c'est une redirection externe
    window.location.href = authUrl;
}

// Fonction pour traiter le callback OAuth après authentification 42
export async function handleOAuthCallback(code) {
    try {
        const response = await fetch(`${API_BASE_URL}/2OAuth?code=${code}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Sauvegarde des tokens dans localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/dashboard');
            return data;
        } else if (response.status === 401 && data.detail === "2FA required") {
            // Authentification à deux facteurs requise
            localStorage.setItem('temp_token', data.temp_token);
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/2fa-verification');
            return data;
        } else {
            throw new Error(data.error || "Une erreur est survenue lors de l'authentification OAuth");
        }
    } catch (error) {
        console.error("Erreur OAuth:", error);
        alert("Une erreur est survenue lors de l'authentification avec 42");
        throw error;
    }
}

// Fonction de connexion standard
export async function loginWithCredentials(email, password) {
    console.log("Tentative de connexion pour:", email);
    
    try {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            // Connexion réussie
            console.log("Connexion réussie!");
            
            // Sauvegarde du token et des informations utilisateur
            localStorage.setItem('access_token', data.user.access_token);
            localStorage.setItem('refresh_token', data.user.refresh_token);
            localStorage.setItem('user_info', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.first_name,
                lastName: data.user.last_name
            }));
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/dashboard');
            return data;
        } else if (response.status === 202) {
            // 2FA requis
            localStorage.setItem('temp_token', data.temp_token);
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/2fa-verification');
            return data;
        } else {
            // Gestion des erreurs
            let errorMessage = "Une erreur est survenue lors de la connexion.";
            
            if (data.error) {
                if (data.details) {
                    errorMessage = `${data.error}: ${data.details}`;
                } else {
                    errorMessage = data.error;
                }
            }
            
            alert(errorMessage);
            return { error: errorMessage };
        }
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        alert("Une erreur est survenue lors de la connexion.");
        throw error;
    }
}

// Fonction d'inscription
export async function registerUser(email, firstName, lastName, password, password2) {
    try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                password2
            })
        });

        const data = await response.json();
        
        if (response.status === 201) {
            // Inscription réussie
            alert(data.message);
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/verify-email', { email });
            return data;
        } else {
            // Gestion des erreurs
            let errorMessage = "Une erreur est survenue lors de l'inscription.";
            
            if (data.error) {
                if (typeof data.error === 'object' && data.error.email) {
                    errorMessage = data.error.email;
                } else if (data.details) {
                    errorMessage = `${data.error}: ${data.details}`;
                } else {
                    errorMessage = data.error;
                }
            }
            
            alert(errorMessage);
            return { error: errorMessage };
        }
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        alert("Une erreur est survenue lors de l'inscription.");
        throw error;
    }
}

// Fonction de vérification d'email
export async function verifyEmail(email, otp) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-email/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            // Vérification réussie
            alert(data.message);
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/');
            return data;
        } else {
            // Gestion des erreurs
            let errorMessage = "Une erreur est survenue lors de la vérification de l'email.";
            
            if (data.error) {
                errorMessage = data.error;
            }
            
            alert(errorMessage);
            return { error: errorMessage };
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        alert("Une erreur est survenue lors de la vérification de l'email.");
        throw error;
    }
}

// Fonction de vérification du code 2FA
export async function verify2FA(code, tempToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-2fa/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tempToken}`
            },
            body: JSON.stringify({ code })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            // Vérification 2FA réussie
            localStorage.removeItem('temp_token');
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            
            // Utilisation de navigateTo pour le SPA
            navigateTo('/dashboard');
            return data;
        } else {
            // Gestion des erreurs
            let errorMessage = "Code 2FA invalide.";
            
            if (data.error) {
                errorMessage = data.error;
            }
            
            alert(errorMessage);
            return { error: errorMessage };
        }
    } catch (error) {
        console.error("Erreur lors de la vérification 2FA:", error);
        alert("Une erreur est survenue lors de la vérification 2FA.");
        throw error;
    }
}

// Fonction pour activer l'authentification à deux facteurs
export async function enable2FA() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert("Vous devez être connecté pour activer l'authentification à deux facteurs.");
        return { error: "Non authentifié" };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/enable2FA/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ confirmation: "YES" })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            if (data.qr_code_url) {
                // 2FA activée avec succès
                return {
                    success: true,
                    message: data.message,
                    qrCodeUrl: data.qr_code_url,
                    otpUri: data.otp_uri
                };
            } else {
                // 2FA déjà activée ou non activée
                return { success: false, message: data.message };
            }
        } else {
            // Gestion des erreurs
            let errorMessage = "Une erreur est survenue lors de l'activation de l'authentification à deux facteurs.";
            
            if (data.error) {
                errorMessage = data.error;
            }
            
            return { error: errorMessage };
        }
    } catch (error) {
        console.error("Erreur lors de l'activation 2FA:", error);
        return { error: "Une erreur est survenue lors de l'activation de l'authentification à deux facteurs." };
    }
}

// Fonction pour désactiver l'authentification à deux facteurs
export async function disable2FA() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert("Vous devez être connecté pour désactiver l'authentification à deux facteurs.");
        return { error: "Non authentifié" };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Disable2FA/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ confirmation: "YES" })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            // 2FA désactivée avec succès ou déjà désactivée
            return { success: true, message: data.message };
        } else {
            // Gestion des erreurs
            let errorMessage = "Une erreur est survenue lors de la désactivation de l'authentification à deux facteurs.";
            
            if (data.error) {
                errorMessage = data.error;
            }
            
            return { error: errorMessage };
        }
    } catch (error) {
        console.error("Erreur lors de la désactivation 2FA:", error);
        return { error: "Une erreur est survenue lors de la désactivation de l'authentification à deux facteurs." };
    }
}

// Fonction pour vérifier si l'utilisateur est connecté
export function isAuthenticated() {
    return localStorage.getItem('access_token') !== null;
}

// Fonction de déconnexion
export function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('temp_token');
    
    // Redirection vers la page d'accueil
    window.location.href = "/";
}