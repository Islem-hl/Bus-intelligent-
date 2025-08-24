let map;
let markers = [];
let polyline;
let arret_detectee = null;
var busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [18, 31],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
function initMap() {
  // Initialisation de la carte (Tunis)
  map = L.map('map').setView([36.8, 10.1], 10);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);
  
  // Ajoute le trajet initial
  addRouteWithStations(trajet, arrêts);
}

function clearMap() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  if (polyline) map.removeLayer(polyline);
}

function addRouteWithStations(coordinates, stationNames) {
  // Supprimer les marqueurs existants et la polyline
  clearMap();
  
  // Créer une polyline pour le trajet
  polyline = L.polyline(coordinates, {color: 'RED'}).addTo(map);
  
  // Ajouter un marqueur pour chaque station avec son nom
  coordinates.forEach((coord, index) => {
    const marker = L.marker(coord)
      .addTo(map)
      .bindPopup(stationNames[index]);
    
    markers.push(marker);
  });
  
  // Ajuster la vue pour montrer tout le trajet
  map.fitBounds(polyline.getBounds());
}


function updateMapPosition(lat, lng, heure_gps) {
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then(response => response.json())
    .then(result => {
       /*1er element */
      /* const name = result.display_name.split(',')[0];*/

      let name = result.display_name;
      let city = result.address.city;
      let country = result.address.country;
      let short = `${name},${city}, ${country}`;
      /*const country =result.address.county;*/
      /*const short = `${country}`;*/
      
      
      // Créer un marqueur temporaire pour la position
      let tempMarker = L.marker([lat, lng], {icon:busIcon})
        .addTo(map)
        .bindPopup(`📍${short}<br><b>Latitude: </b>${lat.toFixed(5)} | <b>Longitude: </b>${lng.toFixed(5)}`)
        .openPopup();
      
      map.setView([lat, lng], 15);
      return true;
    })
    .catch(error => {
      console.error("Erreur géocodage:", error);
      return false;
    });
}

// Vos données de trajet
const trajet = [
  [35.63179293898894, 10.823927095494543],
  [35.63039330160312, 10.818122901228252],
  [35.628888880546334, 10.800367758299805],
  [35.629335206540325, 10.780432914724928], 

  [35.62778057713014, 10.766828355787151],
  [35.627213882119, 10.764446786764678]
];

let arrêts = [
 'Départ: TOUZA 5023',
  'Arrêt 1 : Café PARC ',
  'Arrêt 2 : EMKA Med',
  'Arrêt 3 : Collège',
  'Arrêt 4 : Pâtisserie Sesame',
  'Arrivée : Ecole Primère AL Hidaya'
];
const busStops = [
  { nom: "Départ: TOUZA 5023", lat: 35.63179293898894,lng: 10.823927095494543, visited: false },
  { nom: "Arrêt 1 : Café PARC", lat: 35.63039330160312, lng: 10.818122901228252, visited: false },
  { nom: "Arrêt 2 : EMKA Med", lat: 35.628889880546334, lng: 10.800367758299805, visited: false },
  { nom: "Arrêt 3 : Collège", lat: 35.629335206540325, lng: 10.780432914724928, visited: false },
  { nom: "Arrêt 4 : Pâtisserie Sesame", lat: 35.62778057713014, lng: 10.766828355787151, visited: false },
  { nom: "Arrivée : Ecole Primère AL Hidaya", lat: 35.627213882119, lng: 10.764446786764678, visited: false }
];

const busStops_retour = [
  { nom: "Départ : Ecole Primère AL Hidaya", lat: 35.627213882119, lng: 10.764446786764678, visited: false },
  { nom: "Arrêt 1 : Pâtisserie Sesame", lat: 35.62778057713014, lng: 10.766828355787151, visited: false },
  { nom: "Arrêt 2 : Collège", lat: 35.629335206540325, lng: 10.780432914724928, visited: false },
  { nom: "Arrêt 3 : EMKA Med", lat: 35.628889880546334, lng: 10.800367758299805, visited: false },
  { nom: "Arrêt 4 : Café PARC", lat: 35.63039330160312, lng: 10.818122901228252, visited: false },
  { nom: "Arrivée :TOUZA 5023", lat: 35.63179293898894,lng: 10.823927095494543, visited: false }
];

function detecterArrets(lat, lng,heure_gps) {
  const seuil = 0.0006; // ~60 mètres
  const now = new Date();
  /*const heure = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });*/
 
  busStops.forEach((arret, index) => {
    const station = Math.sqrt((arret.lat - lat) ** 2 + (arret.lng - lng) ** 2);
    if (!arret.visited && station < seuil ) {
      arret.visited = true;
      arret.arrivalTime = heure_gps; // heure GPS actuelle
      arret_detectee = arret.nom; // Mettre à jour l'arrêt détect
      
      afficherBusStops(); // mise à jour du tableau HTML
      afficherBusStopsRetour(); // mise à jour du tableau HTML retour
    }
  });
}



function afficherBusStops() {
  const tbody = document.getElementById('busStopsBody');
  tbody.innerHTML = '';
  busStops.forEach(arret => {
    const row = document.createElement('tr');
   row.innerHTML = `
  <td style="color:rgb(53, 54, 54);">${arret.nom}</td>
  <td style="color:rgb(53, 54, 54);">${arret.arrivalTime || 'N/A'}</td>
  <td style="color:${arret.visited ? 'green' : 'red'};">
    ${arret.visited ? 'Visité' : 'Non visité'}
  </td>
`;

    tbody.appendChild(row);
  });
}

function afficherBusStopsRetour() {
  const tbody = document.getElementById('busStopsBodyRetour');
  tbody.innerHTML = '';
  busStops_retour.forEach(arret => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="color:rgb(53, 54, 54);">${arret.nom}</td>
      <td style="color:rgb(53, 54, 54);">${arret.arrivalTime || 'N/A'}</td>
      <td style="color:${arret.visited ? 'green' : 'red'};">
        ${arret.visited ? 'Visité' : 'Non visité'}
      </td>
    `;
    tbody.appendChild(row);
  });
}


// Initialiser la carte quand la page est chargée
window.onload = initMap;afficherBusStops();
afficherBusStopsRetour();