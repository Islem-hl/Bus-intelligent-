// Gestion de l'authentification
function checkAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
       if (!window.location.pathname.endsWith('login-parent.html')) {
            window.location.href = 'login-parent.html';
        }
    } else {
        // Redirige vers le tableau de bord SI on est sur la page login
        if (window.location.pathname.endsWith('login-parent.html')) {
            window.location.href = 'dashbord-parent.html';
        }
    }
  });
}

// Fonction de déconnexion
function setupLogout() {
  document.getElementById('logoutBt').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "login-parent.html";
    }).catch((error) => {
      console.error("Erreur déconnexion:", error);
    });
  });
}

// Initialisation
checkAuth();
setupLogout();
//firebase.auth().signOut();