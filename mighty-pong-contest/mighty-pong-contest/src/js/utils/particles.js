// Générer des particules aléatoires
export function generateParticles(containerId = 'particles-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
    container.innerHTML = particles;
}