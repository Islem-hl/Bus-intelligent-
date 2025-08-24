// Gestion de l'authentification
function checkAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
       if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    } else {
        // Redirige vers le tableau de bord SI on est sur la page login
        if (window.location.pathname.endsWith('login.html')) {
            window.location.href = 'index.html';
        }
    }
  });
}

// Fonction de déconnexion
function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "login.html";
    }).catch((error) => {
      console.error("Erreur déconnexion:", error);
    });
  });
}

// Initialisation
checkAuth();
setupLogout();
//firebase.auth().signOut();