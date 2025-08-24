// Initialisation au chargement
document.addEventListener('DOMContentLoaded', initPresenceSystem);
//let pr={};
function initPresenceSystem() {
  const db = firebase.database();

    db.ref('/etudiants').on('value', (snapshot) => {
    const data_etudiant = snapshot.val() || {};
    updatePresenceUI(data_etudiant);
  });
}

function updatePresenceUI(etudiants) {

  const notifContainer = document.getElementById('notif-container-p');
 
 

// Nettoyer les notifications précédentes
  notifContainer.innerHTML = '';

  let aDesNotifications = false;

 /*if (etudiants.liste.nom && typeof etudiants.presence === 'number') {*/
 Object.entries(etudiants).forEach(([key, etudiant]) => {   
    const name = etudiant.nom;
    const isPresent = etudiant.present === true;
    const isabsent = etudiant.present === false;
    const sortie = etudiant.sorti === true;
    
    //si le present = true il aura incrementation de ligne tableau 
    if (isPresent ) {
      
      // Notification
      const notifDiv = document.createElement('div');
      notifDiv.classList.add('notif-it', 'montee');
      notifDiv.innerHTML = `
       <p><i class="fa-solid fa-caret-up fa-xl" style="color: #29c72b;"></i> 
       <strong>${name}</strong> est monté à la station de "${arret_detectee}".</p>
        <span class="notif-time">${etudiant.date} à ${etudiant.time_IN}</span>
      `;
      notifContainer.appendChild(notifDiv);
      aDesNotifications = true;
    
    }

    if(sortie) {
      const notifDiv = document.createElement('div');
      notifDiv.classList.add('notif-it', 'descente');
      notifDiv.innerHTML = `
        <p><i class="fa-solid fa-sort-down fa-xl" style="color: #f34f4f;"></i> 
        <strong>${name}</strong> est descendu à la station de "${arret_detectee}".</p>
        <span class="notif-time">${etudiant.date} à ${etudiant.time_out}</span>
      `;
      notifContainer.appendChild(notifDiv);
      aDesNotifications = true;
    }
  });

if (!aDesNotifications) {
  const emptyNotif = document.createElement('div');
  emptyNotif.classList.add('no-notif-p');
  emptyNotif.innerHTML = `
    <i class="fas fa-bell"></i>
    <span>Aucune notification récente</span>
  `;
  notifContainer.appendChild(emptyNotif);
}


const infoContainer = document.getElementById('info_tr');
infoContainer.innerHTML = '';

const now = new Date();
const hour = now.getHours();     // retourne 0 à 23
const minute = now.getMinutes(); // retourne 0 à 59
const day=now.getDay();; 
const totalMinutes = hour * 60 + minute;

const driver1 = "AMOR Ahmed";
const driver2 = "NEJI Yassin";

const ifDiv = document.createElement('div');
ifDiv.classList.add('info_tr');

if(day>= 1 && day <=5){
if (totalMinutes >= 435 && totalMinutes <= 780) { // 07:15 -> 13:00
  ifDiv.innerHTML = `
    <p><strong>N° Bus:</strong> BUS001</p>
    <p><strong>Conducteur:</strong> ${driver1}</p>
    <p><strong>Téléphone:</strong> 54333222 </p>
    <p><strong>Date:</strong> ${now.toLocaleDateString()} </p>
    <p><strong>Station actuelle:</strong> <span style="color: green">
    ${arret_detectee} - ${arrive}</span></p>
    <p><strong>Station suivante:</strong> <span style="color: red">
    ${arret_suivante} - ${heureEstimee}</span></p>
  `;

  
} else if (totalMinutes >= 795 && totalMinutes <= 1180) { // 13:15 -> 18:00
  ifDiv.innerHTML = `
    <p><strong>N° Bus:</strong> BUS002</p>
    <p><strong>Conducteur:</strong> ${driver2}</p>
     <p><strong>Téléphone:</strong> 90888432 </p>
      <p><strong>Date:</strong> ${now.toLocaleDateString()} </p>
    <p><strong>Station actuelle:</strong> <span style="color: green">
    ${arret_detectee} - ${arrive}</span></p>
    <p><strong>Station suivante:</strong> <span style="color: red">
    ${arret_suivante} - ${heureEstimee}</span></p>

  `;
}
}
 else {
  ifDiv.innerHTML = 
  `<p><strong><center>
  <h3>Pas de trajet prévu en ce moment</h3></center></strong></p>`;
}

infoContainer.appendChild(ifDiv);

}

