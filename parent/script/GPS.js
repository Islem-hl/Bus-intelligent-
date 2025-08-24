let heure_gps = null;
// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  /*const local = document.getElementById('local');*/
  const db = firebase.database();
   /*local.addEventListener('click', () => modal.style.display = 'block');*/
  // Écoute des données GPS
  db.ref("/gps_data").on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("Données reçues:", data);
    
    if (data && data.Heure && data.latitude && data.longitude) {
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      let heure_gps = data.Heure;
      
      updateMapPosition(lat, lng, heure_gps);
      detecterArrets(lat, lng, heure_gps);
    }
  });
});