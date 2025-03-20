export function renderRegistration(container) {
    container.innerHTML = `
        <div class="container mt-5">
            <h1 class="mb-4">Inscription au tournoi</h1>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <form id="registration-form">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nom complet</label>
                                    <input type="text" class="form-control" id="name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Téléphone</label>
                                    <input type="tel" class="form-control" id="phone">
                                </div>
                                <div class="mb-3">
                                    <label for="experience" class="form-label">Niveau d'expérience</label>
                                    <select class="form-select" id="experience" required>
                                        <option value="">Sélectionnez votre niveau</option>
                                        <option value="beginner">Débutant</option>
                                        <option value="intermediate">Intermédiaire</option>
                                        <option value="advanced">Avancé</option>
                                        <option value="pro">Professionnel</option>
                                    </select>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="terms" required>
                                    <label class="form-check-label" for="terms">J'accepte les termes et conditions</label>
                                </div>
                                <button type="submit" class="btn btn-primary">S'inscrire</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Informations importantes</h5>
                            <p class="card-text">Le tournoi aura lieu le 15 juin 2023 à la salle de jeux de la ville.</p>
                            <p class="card-text">Frais d'inscription: 25€</p>
                            <p class="card-text">Les places sont limitées, inscrivez-vous rapidement!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add form submission event listener
    document.getElementById('registration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Inscription envoyée avec succès!');
    });
}