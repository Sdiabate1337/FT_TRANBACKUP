import { navigateTo } from '../router.js';
import { generateParticles } from '../utils/particles.js';
import { 
    openLoginModal, 
    openRegisterModal, 
    open2FAModal
} from './auth/modals/modalManager.js';
import '../../css/home.css';

export function renderHome(container) {
    // Contenu HTML principal (sans les modales)
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
                            <button class="cyber-btn" id="btn-login-standard">
                                <i class="bi bi-person-circle me-2"></i>
                                CONNEXION
                            </button>
                            <button class="cyber-btn" id="btn-register">
                                <i class="bi bi-person-plus-fill me-2"></i>
                                S'INSCRIRE
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
            
            <!-- Conteneur pour les modales -->
            <div id="modal-container"></div>
        </div>
        
        <!-- Animation synchronisée balle-palettes -->
        <script type="text/javascript">
            window.addEventListener('DOMContentLoaded', function() {
                // Conserver votre code d'animation existant
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

    // Générer les particules
    setTimeout(() => {
        generateParticles('particles-container');
    }, 0);

    // Gestion des événements une fois le DOM chargé
    setTimeout(() => {
        // Boutons d'authentification
        const btnLoginStandard = document.getElementById('btn-login-standard');
        const btnRegister = document.getElementById('btn-register');
        
        // Actions des boutons
        btnLoginStandard?.addEventListener('click', openLoginModal);
        btnRegister?.addEventListener('click', openRegisterModal);
        
        // Vérifier si on doit afficher la modale 2FA (exemple après un OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('require_2fa') && urlParams.has('temp_token')) {
            const tempToken = urlParams.get('temp_token');
            localStorage.setItem('tempToken', tempToken);
            open2FAModal({ temp_token: tempToken });
            
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Liens SPA
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.getAttribute('href'));
            });
        });
    }, 0);
}