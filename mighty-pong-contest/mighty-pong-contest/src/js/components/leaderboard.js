export function renderLeaderboard(container) {
    container.innerHTML = `
        <div class="container mt-5">
            <h1 class="mb-4">Classement des joueurs</h1>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Joueur</th>
                            <th>Victoires</th>
                            <th>Défaites</th>
                            <th>Ratio</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>42</td>
                            <td>5</td>
                            <td>89%</td>
                            <td>1250</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Jane Smith</td>
                            <td>38</td>
                            <td>7</td>
                            <td>84%</td>
                            <td>1180</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>Robert Johnson</td>
                            <td>35</td>
                            <td>9</td>
                            <td>80%</td>
                            <td>1100</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>Emily Davis</td>
                            <td>31</td>
                            <td>12</td>
                            <td>72%</td>
                            <td>980</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td>Michael Wilson</td>
                            <td>29</td>
                            <td>15</td>
                            <td>66%</td>
                            <td>870</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}