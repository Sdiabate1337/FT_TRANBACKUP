export function renderFooter() {
    const footer = document.getElementById('footer');
    
    footer.innerHTML = `
        <footer class="footer mt-5">
            <div class="container">
                <div class="row">
                    <div class="col-md-6">
                        <h5>Mighty Pong Contest</h5>
                        <p>Le meilleur tournoi de Pong au monde.</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <p>&copy; ${new Date().getFullYear()} Mighty Pong Contest</p>
                    </div>
                </div>
            </div>
        </footer>
    `;
}