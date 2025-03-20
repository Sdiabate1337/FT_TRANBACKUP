// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom CSS
import '../css/custom.css';

// Import components and router
import { initRouter } from './router.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Render static components
    //renderHeader();
    //renderFooter();
    
    // Initialize router
    initRouter();
});