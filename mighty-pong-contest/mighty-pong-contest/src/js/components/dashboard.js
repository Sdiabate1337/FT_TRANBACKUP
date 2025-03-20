import { generateParticles } from '../utils/particles.js';
import '../../css/dashboard.css';
import { navigateTo } from '../router.js';

export function renderDashboard(container) {
  
    // Contenu HTML principal avec le style cyberpunk
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
                <div class="container">
                    <h1 class="cyber-title">TABLEAU DE BORD</h1>
                    
                    <div class="row mt-4">
                        <!-- Profil utilisateur -->
                        <div class="col-lg-4 mb-4">
                            <div class="holo-panel h-100">
                                <h2 class="h5 mb-4">Profil Joueur</h2>
                                
                                <div class="text-center mb-4">
                                    <div class="avatar-container">
                                        <div class="cyber-avatar">
                                            <img src="https://via.placeholder.com/150" alt="Avatar" class="img-fluid rounded-circle">
                                        </div>
                                    </div>
                                    <h3 class="h4 mt-3" id="user-display-name">Joueur</h3>
                                    <p class="text-muted" id="user-display-email">joueur@example.com</p>
                                </div>
                                
                                <div class="info-box">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Niveau:</span>
                                        <span class="text-cyber-blue">42</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Matchs joués:</span>
                                        <span class="text-cyber-blue">128</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Victoires:</span>
                                        <span class="text-cyber-green">96</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Défaites:</span>
                                        <span class="text-cyber-magenta">32</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Ratio:</span>
                                        <span class="text-cyber-yellow">75%</span>
                                    </div>
                                </div>
                                
                                <button class="cyber-btn mt-3" style="width: 100%;">
                                    <i class="bi bi-gear-fill me-2"></i>
                                    MODIFIER PROFIL
                                </button>
                            </div>
                        </div>
                        
                        <!-- Matchs récents -->
                        <div class="col-lg-8 mb-4">
                            <div class="holo-panel h-100">
                                <h2 class="h5 mb-4">Activité récente</h2>
                                
                                <div class="recent-matches">
                                    <div class="match-item">
                                        <div class="match-result win">VICTOIRE</div>
                                        <div class="match-details">
                                            <div class="match-players">
                                                <span class="player-name">Vous</span>
                                                <span class="match-score">5 - 3</span>
                                                <span class="player-name">OpponentX</span>
                                            </div>
                                            <div class="match-time">Il y a 2 heures</div>
                                        </div>
                                    </div>
                                    
                                    <div class="match-item">
                                        <div class="match-result loss">DÉFAITE</div>
                                        <div class="match-details">
                                            <div class="match-players">
                                                <span class="player-name">Vous</span>
                                                <span class="match-score">2 - 5</span>
                                                <span class="player-name">MasterPong</span>
                                            </div>
                                            <div class="match-time">Il y a 5 heures</div>
                                        </div>
                                    </div>
                                    
                                    <div class="match-item">
                                        <div class="match-result win">VICTOIRE</div>
                                        <div class="match-details">
                                            <div class="match-players">
                                                <span class="player-name">Vous</span>
                                                <span class="match-score">5 - 1</span>
                                                <span class="player-name">PongNovice</span>
                                            </div>
                                            <div class="match-time">Hier, 18:30</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="text-center mt-3">
                                    <button class="cyber-btn">
                                        <i class="bi bi-list-ul me-2"></i>
                                        HISTORIQUE COMPLET
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <!-- Actions rapides -->
                        <div class="col-lg-6 mb-4">
                            <div class="holo-panel">
                                <h2 class="h5 mb-4">Actions rapides</h2>
                                
                                <div class="quick-actions">
                                    <button class="cyber-btn cyber-btn-42 mb-3" style="width: 100%;">
                                        <i class="bi bi-controller me-2"></i>
                                        JOUER MAINTENANT
                                    </button>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <button class="cyber-btn" style="width: 100%;">
                                                <i class="bi bi-trophy me-2"></i>
                                                TOURNOIS
                                            </button>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <button class="cyber-btn" style="width: 100%;">
                                                <i class="bi bi-people-fill me-2"></i>
                                                AMIS
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <button class="cyber-btn" style="width: 100%;">
                                                <i class="bi bi-chat-dots me-2"></i>
                                                CHAT
                                            </button>
                                        </div>
                                        <div class="col-md-6">
                                            <button class="cyber-btn" style="width: 100%;">
                                                <i class="bi bi-graph-up me-2"></i>
                                                CLASSEMENT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tournois -->
                        <div class="col-lg-6 mb-4">
                            <div class="holo-panel">
                                <h2 class="h5 mb-4">Tournois à venir</h2>
                                
                                <div class="tournament-list">
                                    <div class="tournament-item">
                                        <div class="tournament-header">
                                            <h3 class="tournament-name h6">Cyber Championship 2023</h3>
                                            <div class="tournament-time">Dans 2 jours</div>
                                        </div>
                                        <div class="tournament-details">
                                            <div><i class="bi bi-people"></i> 32 participants</div>
                                            <div><i class="bi bi-trophy"></i> 1000 points</div>
                                        </div>
                                        <button class="cyber-btn-text mt-2">
                                            <i class="bi bi-plus-circle me-1"></i>
                                            S'inscrire
                                        </button>
                                    </div>
                                    
                                    <div class="tournament-item">
                                        <div class="tournament-header">
                                            <h3 class="tournament-name h6">Weekly Challenge</h3>
                                            <div class="tournament-time">Dans 5 jours</div>
                                        </div>
                                        <div class="tournament-details">
                                            <div><i class="bi bi-people"></i> 16 participants</div>
                                            <div><i class="bi bi-trophy"></i> 500 points</div>
                                        </div>
                                        <button class="cyber-btn-text mt-2">
                                            <i class="bi bi-plus-circle me-1"></i>
                                            S'inscrire
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Important: Générer les particules APRÈS que le conteneur soit ajouté au DOM
    setTimeout(() => {
        generateParticles('particles-container');
    }, 0);
    
    // Récupérer et afficher les informations de l'utilisateur
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userInfo.firstName) {
        document.getElementById('user-display-name').textContent = `${userInfo.firstName} ${userInfo.lastName || ''}`;
    }
    if (userInfo.email) {
        document.getElementById('user-display-email').textContent = userInfo.email;
    }
}