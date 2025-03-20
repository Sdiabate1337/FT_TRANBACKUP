import { loginWith42, loginWithCredentials } from '../services/auth.js';
import { navigateTo } from '../router.js';
import { generateParticles } from '../utils/particles.js';
import '../../css/home.css';

export function renderHome(container) {

    // Contenu HTML principal
    container.innerHTML = `
        <div class="cyber-arena">
            <!-- Effets d'arrière-plan -->
            <div class="arena-bg">
                <div class="cyber-grid"></div>
                <div id="particles-container">
                    <!-- Les particules seront générées en JS -->
                </div>
            </div>
            
            <!-- Effet scanline -->
            <div class="scan-effect"></div>
            
            <!-- Contenu principal -->
            <div class="main-container">
                <div class="interface-container">
                    <!-- Panneau d'information -->
                    <div class="holo-panel">
                        <h1 class="cyber-title">FT-TRANSCENDANCE</h1>
                        
                        <div class="info-box">
                            <p>Bienvenue dans l'arène de <strong>PONG</strong> la plus évoluée jamais conçue. Affrontez des joueurs du monde entier, maîtrisez des capacités uniques et atteignez le sommet du classement intergalactique.</p>
                        </div>
                        
                        <div class="d-flex flex-wrap">
                            <button class="cyber-btn cyber-btn-42" id="btn-login-42">
                                <i class="bi bi-42-circle me-2"></i>
                                CONNEXION 42
                            </button>
                            <button class="cyber-btn" id="btn-login-standard">
                                <i class="bi bi-person-circle me-2"></i>
                                CONNEXION
                            </button>
                        </div>
                        
                        <div class="cyber-stats">
                            <div class="stat-box">
                                <div class="stat-value" data-value="1337">1337</div>
                                <div class="stat-label">Joueurs</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-value" data-value="42">42</div>
                                <div class="stat-label">Tournois</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-value" data-value="24/7">24/7</div>
                                <div class="stat-label">En ligne</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Visualisation Pong Simplifiée -->
                    <div class="holo-panel">
                        <div class="holo-pong">
                            <div class="visualization">
                                <svg width="100%" height="100%" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
                                    <!-- Définitions simples -->
                                    <defs>
                                        <!-- Effet lueur néon -->
                                        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                        
                                        <!-- Dégradé palette gauche -->
                                        <linearGradient id="leftPaddleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stop-color="#f706cf" />
                                            <stop offset="100%" stop-color="#d30cb3" />
                                        </linearGradient>
                                        
                                        <!-- Dégradé palette droite -->
                                        <linearGradient id="rightPaddleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stop-color="#04ffa3" />
                                            <stop offset="100%" stop-color="#00f2fe" />
                                        </linearGradient>
                                    </defs>
                                    
                                    <!-- Fond -->
                                    <rect x="0" y="0" width="500" height="400" fill="#090b13" />
                                    
                                    <!-- Terrain de jeu -->
                                    <rect x="50" y="50" width="400" height="300" rx="5" fill="none" 
                                          stroke="#4a21ef" stroke-width="2" stroke-opacity="0.6" />
                                    
                                    <!-- Ligne centrale -->
                                    <line x1="250" y1="50" x2="250" y2="350" stroke="#4a21ef" 
                                          stroke-width="2" stroke-dasharray="10,10" stroke-opacity="0.8" />
                                    
                                    <!-- Palette gauche -->
                                    <rect x="70" y="150" width="15" height="80" rx="3" 
                                          fill="url(#leftPaddleGradient)" filter="url(#neonGlow)">
                                        <animate attributeName="y" values="150;100;250;150" 
                                                 dur="6s" repeatCount="indefinite" />
                                    </rect>
                                    
                                    <!-- Palette droite -->
                                    <rect x="415" y="150" width="15" height="80" rx="3" 
                                          fill="url(#rightPaddleGradient)" filter="url(#neonGlow)">
                                        <animate attributeName="y" values="150;250;100;150" 
                                                 dur="7s" repeatCount="indefinite" />
                                    </rect>
                                    
                                    <!-- Balle avec animation de rebond réaliste -->
                                    <circle cx="250" cy="200" r="10" fill="white" filter="url(#neonGlow)">
                                        <!-- Animation plus réaliste avec accélération et décélération -->
                                        <animate attributeName="cx" 
                                                 values="250;85;85;415;415;250" 
                                                 keyTimes="0;0.2;0.25;0.7;0.75;1"
                                                 dur="8s" 
                                                 repeatCount="indefinite" />
                                        <animate attributeName="cy" 
                                                 values="200;150;150;250;250;200" 
                                                 keyTimes="0;0.2;0.25;0.7;0.75;1"
                                                 dur="8s" 
                                                 repeatCount="indefinite" />
                                        <animate attributeName="r"
                                                 values="10;12;10;12;10"
                                                 keyTimes="0;0.24;0.26;0.74;0.76"
                                                 dur="8s"
                                                 repeatCount="indefinite" />
                                    </circle>
                                    
                                    <!-- Score -->
                                    <text x="200" y="30" fill="#00f2fe" font-family="'Orbitron', sans-serif" 
                                          font-size="20" text-anchor="end">2</text>
                                    <text x="260" y="30" fill="#04ffa3" font-family="'Orbitron', sans-serif" 
                                          font-size="20" text-anchor="start">3</text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modale de connexion standard -->
            <div class="modal-overlay" id="modal-login-standard">
                <div class="login-modal">
                    <button class="close-modal" id="close-modal-standard">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <h2 class="modal-title">Connexion standard</h2>
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
                        <button class="cyber-btn" id="submit-login">
                            <i class="bi bi-box-arrow-in-right me-2"></i>
                            CONNEXION
                        </button>
                        
                        <div class="text-center mt-3">
                            <a href="/register" class="cyber-link">Pas encore de compte? S'inscrire</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modale de connexion 42 -->
            <div class="modal-overlay" id="modal-login-42">
                <div class="login-modal login-modal-42">
                    <button class="close-modal" id="close-modal-42">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="code-rain"></div>
                    <div class="logo-42">
                        <svg viewBox="0 0 128 128" fill="#04ffa3">
                            <path d="M65.3,45.5v36.6H45.7V64.7H26.1V45.5H65.3z M26.1,82.1h19.6v19.2H26.1V82.1z M45.7,26.3h19.6v19.2H45.7 V26.3z M65.3,82.1h19.6v19.2H65.3V82.1z M65.3,64.7h19.6v17.4H65.3V64.7z M84.9,64.7h19.6v17.4H84.9V64.7z M84.9,45.5h19.6v19.2 H84.9V45.5z"/>
                        </svg>
                    </div>
                    <h2 class="modal-title">Connexion 42</h2>
                    <p>Vous allez être redirigé vers le service d'authentification de 42.</p>
                    <button class="cyber-btn cyber-btn-42 mt-4" id="btn-continue-42">
                        <i class="bi bi-box-arrow-in-right me-2"></i>
                        CONTINUER
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Animation synchronisée balle-palettes -->
        <script type="text/javascript">
            window.addEventListener('DOMContentLoaded', function() {
                // On joue un effet visuel simple de rebond quand la balle touche une palette
                const svg = document.querySelector('.visualization svg');
                if (!svg) return;
                
                // Création d'un effet de flash pour les collisions
                function createFlash(x, y, color) {
                    const flash = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    flash.setAttribute("cx", x);
                    flash.setAttribute("cy", y);
                    flash.setAttribute("r", "20");
                    flash.setAttribute("fill", color);
                    flash.setAttribute("opacity", "0.5");
                    flash.setAttribute("filter", "url(#neonGlow)");
                    
                    const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    anim.setAttribute("attributeName", "opacity");
                    anim.setAttribute("from", "0.5");
                    anim.setAttribute("to", "0");
                    anim.setAttribute("dur", "0.5s");
                    anim.setAttribute("begin", "0s");
                    anim.setAttribute("fill", "freeze");
                    flash.appendChild(anim);
                    
                    svg.appendChild(flash);
                    
                    // Auto-suppression après l'animation
                    setTimeout(() => {
                        svg.removeChild(flash);
                    }, 500);
                }
                
                // Simulation de rebond à intervalles réguliers
                setInterval(() => {
                    createFlash(85, Math.floor(Math.random() * 100) + 150, "#f706cf");
                }, 4000);
                
                setInterval(() => {
                    createFlash(415, Math.floor(Math.random() * 100) + 150, "#04ffa3");
                }, 4000);
            });
        </script>
    `;

      // Important: Générer les particules APRÈS que le conteneur soit ajouté au DOM
    setTimeout(() => {
        generateParticles('particles-container');
    }, 0);

    // Gestion des événements une fois le DOM chargé
    setTimeout(() => {
        // Boutons d'ouverture des modales
        const btnLogin42 = document.getElementById('btn-login-42');
        const btnLoginStandard = document.getElementById('btn-login-standard');
        
        // Modales
        const modalLogin42 = document.getElementById('modal-login-42');
        const modalLoginStandard = document.getElementById('modal-login-standard');
        
        // Boutons de fermeture
        const btnCloseModal42 = document.getElementById('close-modal-42');
        const btnCloseModalStandard = document.getElementById('close-modal-standard');
        
        // Boutons d'action
        const btnContinue42 = document.getElementById('btn-continue-42');
        const btnSubmitLogin = document.getElementById('submit-login');
    
        // Ouvrir la modale 42
        btnLogin42.addEventListener('click', () => {
            modalLogin42.classList.add('active');
        });
        
        // Ouvrir la modale standard
        btnLoginStandard.addEventListener('click', () => {
            modalLoginStandard.classList.add('active');
        });
        
        // Fermer les modales
        btnCloseModal42.addEventListener('click', () => {
            modalLogin42.classList.remove('active');
        });
        
        btnCloseModalStandard.addEventListener('click', () => {
            modalLoginStandard.classList.remove('active');
        });
        
        // Fermer en cliquant en dehors
        [modalLogin42, modalLoginStandard].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Actions de connexion
        btnContinue42.addEventListener('click', () => {
            // Fermer la modale 42 avant de rediriger
            document.getElementById('modal-login-42').classList.remove('active');
            loginWith42();
        });
        
        btnSubmitLogin.addEventListener('click', async () => {
            // Réinitialiser les messages d'erreur
            document.querySelectorAll('.input-error').forEach(el => el.textContent = '');
            
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
            
            if (!isValid) return;
            
            try {
                await loginWithCredentials(email, password);
                // Si loginWithCredentials ne redirige pas (en cas d'erreur), la modale reste ouverte
                // Sinon, la navigation se fera et la modale disparaîtra naturellement
            } catch (error) {
                console.error("Erreur de connexion:", error);
            }
        });
        
        // Gestion des liens pour rester en SPA
        const registerLink = document.querySelector('.login-modal .cyber-link');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Fermer la modale avant de naviguer
                modalLoginStandard.classList.remove('active');
                navigateTo('/register');
            });
        }

        document.querySelectorAll('a[href^="/"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.getAttribute('href'));
            });
        });
    }, 0);
}