import { verifyEmail } from '../services/auth.js';

export function renderVerifyEmail(container) {
    // Récupérer l'email depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || '';
    
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
                <div class="verify-container">
                    <!-- Panneau de vérification -->
                    <div class="holo-panel" style="max-width: 500px; margin: 0 auto;">
                        <h1 class="cyber-title">VÉRIFICATION EMAIL</h1>
                        
                        <div class="info-box mb-4">
                            <p>Un code de vérification a été envoyé à l'adresse <strong id="display-email">${email}</strong>. Veuillez saisir ce code pour finaliser votre inscription.</p>
                        </div>
                        
                        <div class="cyber-form">
                            <div class="input-group">
                                <label for="otp">Code de vérification</label>
                                <input type="text" id="otp" class="cyber-input" placeholder="Entrez le code reçu par email" autocomplete="one-time-code">
                                <div class="input-error" id="otp-error"></div>
                            </div>
                            
                            <div class="timer-container text-center mb-3">
                                <div class="cyber-timer">
                                    <span id="timer">05:00</span>
                                </div>
                                <div class="timer-label">Délai d'expiration</div>
                            </div>
                            
                            <button class="cyber-btn" id="btn-verify" style="width: 100%;">
                                <i class="bi bi-check-circle me-2"></i>
                                VÉRIFIER
                            </button>
                            
                            <div class="text-center mt-4">
                                <button class="cyber-btn-text" id="btn-resend-code" disabled>
                                    <i class="bi bi-arrow-repeat me-1"></i>
                                    Renvoyer le code
                                </button>
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
    document.getElementById('btn-verify').addEventListener('click', handleVerify);
    document.getElementById('btn-resend-code').addEventListener('click', handleResendCode);
    
    // Démarrer le compte à rebours
    startTimer();
}

// Générer des particules aléatoires
function generateParticles() {
    const particlesContainer = document.getElementById('particles-container');
    if (!particlesContainer) return;
    
    let particles = '';
    for (let i = 0; i < 50; i++) {
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;
        const drift = Math.random() * 20 - 10;
        const opacity = Math.random() * 0.5 + 0.1;
        
        particles += `<div class="particle" style="left: ${posX}%; --duration: ${duration}s; --drift: ${drift}; width: ${size}px; height: ${size}px; opacity: ${opacity}; animation-delay: -${delay}s;"></div>`;
    }
    particlesContainer.innerHTML = particles;
}

// Compte à rebours pour le code de vérification
function startTimer() {
    let timerElement = document.getElementById('timer');
    let resendButton = document.getElementById('btn-resend-code');
    
    let timeLeft = 5 * 60; // 5 minutes en secondes
    
    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            resendButton.disabled = false;
            timerElement.textContent = "00:00";
        } else {
            timeLeft--;
        }
    }
    
    // Mettre à jour le timer toutes les secondes
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

// Fonction pour renvoyer le code
function handleResendCode() {
    const email = document.getElementById('display-email').textContent;
    
    // Ici, vous devriez implémenter l'appel API pour renvoyer le code
    // Pour l'instant, nous réinitialisons simplement le timer
    alert(`Un nouveau code de vérification va être envoyé à ${email}`);
    
    const resendButton = document.getElementById('btn-resend-code');
    resendButton.disabled = true;
    
    startTimer();
}

// Gérer la vérification de l'email
async function handleVerify() {
    const otp = document.getElementById('otp').value.trim();
    const email = document.getElementById('display-email').textContent;
    
    // Validation simple
    if (!otp) {
        document.getElementById('otp-error').textContent = 'Veuillez entrer le code de vérification';
        return;
    }
    
    try {
        const btn = document.getElementById('btn-verify');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> VÉRIFICATION...';
        
        // Appel à l'API pour vérifier le code
        const result = await verifyEmail(email, otp);
        
        if (!result.error) {
            // La redirection vers la page de connexion est gérée dans la fonction verifyEmail
        }
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
    } finally {
        const btn = document.getElementById('btn-verify');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle me-2"></i> VÉRIFIER';
    }
}