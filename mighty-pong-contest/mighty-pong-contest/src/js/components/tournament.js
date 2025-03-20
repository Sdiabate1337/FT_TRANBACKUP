export function renderTournament(container) {
    container.innerHTML = `
        <div class="container mt-5">
            <h1 class="mb-4">Tableau du tournoi</h1>
            
            <ul class="nav nav-tabs" id="tournamentTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="bracket-tab" data-bs-toggle="tab" data-bs-target="#bracket" type="button" role="tab" aria-controls="bracket" aria-selected="true">Arbre du tournoi</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="schedule-tab" data-bs-toggle="tab" data-bs-target="#schedule" type="button" role="tab" aria-controls="schedule" aria-selected="false">Horaires</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="rules-tab" data-bs-toggle="tab" data-bs-target="#rules" type="button" role="tab" aria-controls="rules" aria-selected="false">Règles</button>
                </li>
            </ul>
            
            <div class="tab-content mt-4" id="tournamentTabContent">
                <div class="tab-pane fade show active" id="bracket" role="tabpanel" aria-labelledby="bracket-tab">
                    <div class="tournament-bracket">
                        <div class="row">
                            <div class="col-md-3">
                                <h5 class="text-center">Quarts de finale</h5>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>John D.</span>
                                            <span>3</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Mike T.</span>
                                            <span>1</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>Sarah P.</span>
                                            <span>3</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Robert J.</span>
                                            <span>0</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>Emily D.</span>
                                            <span>2</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>David M.</span>
                                            <span>3</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>Jane S.</span>
                                            <span>3</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Thomas B.</span>
                                            <span>2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-3">
                                <h5 class="text-center">Demi-finales</h5>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>John D.</span>
                                            <span>3</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Sarah P.</span>
                                            <span>1</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>David M.</span>
                                            <span>1</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Jane S.</span>
                                            <span>3</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-3">
                                <h5 class="text-center">Finale</h5>
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>John D.</span>
                                            <span>2</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Jane S.</span>
                                            <span>3</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-3">
                                <h5 class="text-center">Champion</h5>
                                <div class="card">
                                    <div class="card-body text-center">
                                        <h6>Jane Smith</h6>
                                        <div class="mt-2">🏆</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-pane fade" id="schedule" role="tabpanel" aria-labelledby="schedule-tab">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Heure</th>
                                    <th>Match</th>
                                    <th>Phase</th>
                                    <th>Lieu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>15 juin 2023</td>
                                    <td>10:00</td>
                                    <td>John D. vs Mike T.</td>
                                    <td>Quart de finale</td>
                                    <td>Salle A</td>
                                </tr>
                                <tr>
                                    <td>15 juin 2023</td>
                                    <td>11:30</td>
                                    <td>Sarah P. vs Robert J.</td>
                                    <td>Quart de finale</td>
                                    <td>Salle A</td>
                                </tr>
                                <tr>
                                    <td>15 juin 2023</td>
                                    <td>14:00</td>
                                    <td>Emily D. vs David M.</td>
                                    <td>Quart de finale</td>
                                    <td>Salle B</td>
                                </tr>
                                <tr>
                                    <td>15 juin 2023</td>
                                    <td>15:30</td>
                                    <td>Jane S. vs Thomas B.</td>
                                    <td>Quart de finale</td>
                                    <td>Salle B</td>
                                </tr>
                                <tr>
                                    <td>16 juin 2023</td>
                                    <td>13:00</td>
                                    <td>Demi-finale 1</td>
                                    <td>Demi-finale</td>
                                    <td>Salle principale</td>
                                </tr>
                                <tr>
                                    <td>16 juin 2023</td>
                                    <td>15:00</td>
                                    <td>Demi-finale 2</td>
                                    <td>Demi-finale</td>
                                    <td>Salle principale</td>
                                </tr>
                                <tr>
                                    <td>17 juin 2023</td>
                                    <td>14:00</td>
                                    <td>Finale</td>
                                    <td>Finale</td>
                                    <td>Salle principale</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="tab-pane fade" id="rules" role="tabpanel" aria-labelledby="rules-tab">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Règlement officiel</h5>
                            <p>Le Mighty Pong Contest suit les règles officielles du jeu de Pong avec les adaptations suivantes :</p>
                            <ul>
                                <li>Les matchs se jouent en 3 sets gagnants.</li>
                                <li>Chaque set se joue en 11 points.</li>
                                <li>En cas d'égalité 10-10, le set continue jusqu'à ce qu'un joueur ait 2 points d'avance.</li>
                                <li>Le service alterne tous les 2 points.</li>
                                <li>Les joueurs changent de côté après chaque set.</li>
                                <li>Chaque joueur a droit à un temps mort de 1 minute par match.</li>
                                <li>Les décisions des arbitres sont définitives.</li>
                            </ul>
                            <p>Pour toute question concernant les règles, veuillez contacter l'organisation du tournoi.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}