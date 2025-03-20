export function renderAbout(container) {
    container.innerHTML = `
        <div class="container mt-5">
            <h1 class="mb-4">À propos de ft-transcendance</h1>
            
            <div class="row">
                <div class="col-lg-8">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Notre projet</h5>
                            <p class="card-text">ft-transcendance est une plateforme de jeu en ligne qui permet aux utilisateurs de jouer au Pong contre d'autres joueurs en temps réel, de participer à des tournois et de suivre les classements.</p>
                            <p class="card-text">Ce projet a été développé dans le cadre du cursus de l'école 42, en utilisant JavaScript vanilla pour le frontend et Bootstrap pour l'interface utilisateur.</p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Notre équipe</h5>
                            <p class="card-text">Notre équipe est composée d'étudiants passionnés par le développement web et les jeux vidéo.</p>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">Membre 1 - Développeur Frontend</li>
                                <li class="list-group-item">Membre 2 - Développeur Backend</li>
                                <li class="list-group-item">Membre 3 - Designer UI/UX</li>
                                <li class="list-group-item">Membre 4 - DevOps</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Technologies utilisées</h5>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">JavaScript Vanilla</li>
                                <li class="list-group-item">Bootstrap 5</li>
                                <li class="list-group-item">Webpack</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}