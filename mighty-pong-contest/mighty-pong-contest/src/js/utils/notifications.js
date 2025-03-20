// Système de notifications globales pour l'application

let notificationTimeout;

export function showNotification(message, type = 'info', duration = 3000) {
    // Supprimer toute notification existante
    clearTimeout(notificationTimeout);
    const existingNotification = document.querySelector('.cyber-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `cyber-notification notification-${type}`;
    
    // Ajouter l'icône selon le type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="bi bi-check-circle-fill"></i>';
            break;
        case 'error':
            icon = '<i class="bi bi-x-circle-fill"></i>';
            break;
        case 'warning':
            icon = '<i class="bi bi-exclamation-triangle-fill"></i>';
            break;
        default:
            icon = '<i class="bi bi-info-circle-fill"></i>';
    }
    
    // Définir le contenu
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
        <button class="notification-close"><i class="bi bi-x"></i></button>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    // Configurer la fermeture automatique
    notificationTimeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Configurer le bouton de fermeture
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
}

function closeNotification(notification) {
    notification.classList.remove('notification-show');
    notification.classList.add('notification-hide');
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}