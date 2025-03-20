/**
 * Crée une modale générique pour l'authentification
 * @param {Object} options Configuration de la modale
 * @returns {Object} Contrôleur de la modale
 */
export function createAuthModal(options = {}) {
    const {
        id = 'auth-modal',
        title = 'Authentification',
        modalClass = '',
        backdropClose = true,
        onClose = () => {}
    } = options;
    
    // Création de la structure modale
    const modalHTML = `
        <div class="modal-overlay" id="${id}">
            <div class="login-modal ${modalClass}">
                <button class="close-modal" id="close-${id}">
                    <i class="bi bi-x-lg"></i>
                </button>
                <h2 class="modal-title">${title}</h2>
                <div id="${id}-content" class="modal-content"></div>
            </div>
        </div>
    `;
    
    // Injection dans le DOM
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        console.error("Conteneur de modales non trouvé");
        return null;
    }
    
    modalContainer.innerHTML = modalHTML;
    
    // Récupération des éléments
    const modal = document.getElementById(id);
    const closeBtn = document.getElementById(`close-${id}`);
    const contentContainer = document.getElementById(`${id}-content`);
    
    // Fonction de fermeture
    function close() {
        modal.classList.remove('active');
        setTimeout(() => {
            modalContainer.innerHTML = '';
            onClose();
        }, 300);
    }
    
    // Gestion des événements
    closeBtn.addEventListener('click', close);
    
    if (backdropClose) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    }
    
    // Fonction d'ouverture avec animation
    function open() {
        modal.classList.add('active');
    }
    
    // API publique
    return {
        modal,
        content: contentContainer,
        open,
        close,
        setContent(html) {
            contentContainer.innerHTML = html;
        },
        setTitle(newTitle) {
            const titleEl = modal.querySelector('.modal-title');
            if (titleEl) titleEl.textContent = newTitle;
        }
    };
}