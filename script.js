// --- VARIABLES GLOBALES ---
let userPhotoBase64 = "https://via.placeholder.com/150";

// --- 1. INITIALISATION AU CHARGEMENT ---
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        showPage('videoPage');
        loadUserInfo();
        loadVideos();
    }
};

// --- 2. NAVIGATION ENTRE PAGES ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 3. GESTION DE L'IMAGE DE PROFIL ---
const photoInput = document.getElementById('userPhoto');
if(photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function() {
            userPhotoBase64 = reader.result; // Convertit l'image en texte pour le stockage
        };
        if(file) reader.readAsDataURL(file);
    });
}

// --- 4. INSCRIPTION ---
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = {
        name: document.getElementById('userName').value,
        filiere: document.getElementById('userFiliere').value,
        photo: userPhotoBase64
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    showPage('videoPage');
    loadUserInfo();
    loadVideos();
});

// --- 5. CHARGEMENT INFOS UTILISATEUR ---
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userInfoDiv = document.getElementById('userInfo');
    if(user) {
        userInfoDiv.innerHTML = `
            <div class="user-profile-nav">
                <img src="${user.photo}" class="nav-avatar">
                <div style="display:flex; flex-direction:column">
                    <span style="font-weight:bold">${user.name}</span>
                    <small style="font-size:10px; color:#aaa">${user.filiere}</small>
                </div>
                <button onclick="logout()" class="btn-logout">Quitter</button>
            </div>
        `;
    }
}

// --- 6. GESTION DES VIDÉOS ---
function addVideo() {
    const link = document.getElementById('videoLink').value;
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if(!link) return alert("Veuillez coller un lien !");

    let embedUrl = "";
    if(link.includes("youtube.com") || link.includes("youtu.be")) {
        let videoId = link.split('v=')[1] || link.split('/').pop().split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
        alert("Seuls les liens YouTube sont supportés pour l'intégration directe.");
        return;
    }

    const videos = JSON.parse(localStorage.getItem('videos') || '[]');
    
    // On enregistre la vidéo avec les infos de celui qui la poste
    videos.push({ 
        embed: embedUrl, 
        original: link,
        authorName: user.name,
        authorPhoto: user.photo
    }); 

    localStorage.setItem('videos', JSON.stringify(videos));
    document.getElementById('videoLink').value = "";
    loadVideos();
}

function loadVideos() {
    const container = document.getElementById('videoGrid');
    const videos = JSON.parse(localStorage.getItem('videos') || '[]');
    
    if(videos.length === 0) {
        container.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Aucun cours disponible. Partagez le premier !</p>";
        return;
    }

    container.innerHTML = videos.map(video => `
        <div class="video-card">
            <iframe width="100%" height="200" src="${video.embed}" frameborder="0" allowfullscreen></iframe>
            <div class="video-info">
                <div class="posted-by">
                    <img src="${video.authorPhoto}" class="mini-avatar">
                    <span>Par <b>${video.authorName}</b></span>
                </div>
                <button class="btn-download" onclick="downloadVideo('${video.original}')">
                    📥 Télécharger la vidéo
                </button>
            </div>
        </div>
    `).reverse().join(''); // .reverse() pour voir les plus récentes en haut
}

// --- 7. TÉLÉCHARGEMENT & DÉCONNEXION ---
function downloadVideo(link) {
    const service = "https://en.savefrom.net/18/?url=" + encodeURIComponent(link);
    window.open(service, '_blank');
}

function logout() {
    if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}