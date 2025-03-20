export function renderHeader() {
    const header = document.getElementById('header');
    
    header.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="/">ft-transcendance</a>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="/about">About us</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}