function initPresenceSystem() {
  const db = firebase.database();
  const stat = document.getElementById('stat');
  const modal = document.getElementById('presenceModal');
  const closeBtn = document.querySelector('.close');

  // Écouteurs d'événements
  stat.addEventListener('click', () => modal.style.display = 'block');
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Écoute des données Firebase
  db.ref('/Pr_Ab').on('value', (snapshot) => {
    const pr = snapshot.val();

    if (pr.presence && pr.absence && pr.totale ) {
      document.getElementById('statsTotal').textContent = pr.totale;
      document.getElementById('statsPresents').textContent = pr.presence;
      document.getElementById('statsAbsents').textContent = pr.absence;
    }});

    db.ref('/etudiants').on('value', (snapshot) => {
    const data_etudiant = snapshot.val() || {};
    updatePresenceUI(data_etudiant);
  });
}

function updatePresenceUI(etudiants) {
  const presentBody = document.getElementById('present-body');
  const absentBody = document.getElementById('absent-body');
  const presentTitle = document.getElementById('present-title');
  const absentTitle = document.getElementById('absent-title');
  const notifContainer = document.getElementById('notif-container');
  const Total = document.getElementById('present-totale');

// Nettoyer les notifications précédentes
  notifContainer.innerHTML = '';
  presentBody.innerHTML = '';
  absentBody.innerHTML = '';

   presentList = [];
   absentList = [];
   presentCount = 0;
   absentCount = 0;
  let aDesNotifications = false;
 /*if (etudiants.liste.nom && typeof etudiants.presence === 'number') {*/
 Object.entries(etudiants).forEach(([badge_ID, etudiant]) => {   
    const name = etudiant.nom;
    const time_IN= etudiant.time_IN;
    const time_out= etudiant.time_out;
    const isPresent = etudiant.present === true;
    const isAbsent = etudiant.present === false;
    const sortie = etudiant.sorti === true;  
    const row_pr = document.createElement('tr');
    const row_ab = document.createElement('tr');
    const et_ab="❌ Absent";

    row_pr.innerHTML = `
      <td>${badge_ID}</td>
      <td>${name}</td>
      <td>${time_IN}</td>
      <td>${time_out}</td>
     
    `;

     row_ab.innerHTML = `
      <td>${badge_ID}</td>
      <td>${name}</td>
      <td>${et_ab}</td>
     
    `;
     
    //si le present = true il aura incrementation de ligne tableau 
    if (isPresent   ) {
      presentBody.prepend(row_pr);
      presentList.push({name,time_IN, time_out} );
      presentCount ++;
      
    const notif_in = document.createElement('div');
    notif_in.classList.add('notif-item','montee');
    notif_in.innerHTML = `
      <p><i class="fa-solid fa-caret-up fa-xl" style="color: #29c72b;"></i>
      <strong>${name}</strong> est monté au "${arret_detectee} ".</p>
      <span class="notif-time">${etudiant.date} à ${time_IN}</span>
    `;
    notifContainer.prepend(notif_in);
    aDesNotifications = true; // Indique qu'il y a au moins une notification
  
    }

    if (isAbsent ) {
      absentBody.prepend(row_ab);
      absentList.push(name); 
      absentCount++;
      
    }
  

  if ( sortie ) {
 
    const notifDiv_out = document.createElement('div');
    notifDiv_out.classList.add('notif-item','descente');
    notifDiv_out.innerHTML = 
    `
      <p><i class="fa-solid fa-sort-down fa-xl" style="color: #f34f4f;"></i>
      <strong>${name}</strong> est descendu au "${arret_detectee}" .</p>
      <span  class="notif-time">${etudiant.date} à ${time_out}</span>
    `;
    notifContainer.prepend(notifDiv_out);
    aDesNotifications = true; // Indique qu'il y a au moins une notification
  }
  });

  // Message si aucune donnée(notif,eleves)
  if (presentCount === 0) {
    const row_pr = document.createElement('tr');
    row_pr.innerHTML = `<td colspan="3" style="text-align: center;
    position:static;font-family: 'Segoe UI', sans-serif;">
     <i class="fas fa-user-graduate" style="color: green;font-size: 24px;"></i><br>
     Aucun élève présent</td>`;
    presentBody.appendChild(row_pr);
  }

  if (absentCount === 0) {
    const row_ab = document.createElement('tr');
    row_ab.innerHTML = `<td colspan="3" style="text-align:center;
     position:static;font-family: 'Segoe UI', sans-serif;">
     <i class="fas fa-user-graduate" style="color: red;position:center; font-size: 24px;"></i><br>
     Aucun élève absent</td>`;
    absentBody.appendChild(row_ab);
  }
if (!aDesNotifications) {
  const emptyNotif = document.createElement('div');
  emptyNotif.classList.add('no-notif');
  emptyNotif.innerHTML = `
    <i class="fas fa-bell"></i>
    <span>Aucune notification récente</span>
  `;
  notifContainer.appendChild(emptyNotif);
}

  // Mise à jour des titres
  presentTitle.textContent = `✅ Élèves Présents (${presentCount})`;
  absentTitle.textContent = `❌ Élèves Absents (${absentCount})`;
  Total.textContent= `${presentCount}`;
  
  // Mise à jour des compteurs globaux

  document.getElementById('statsTotal').textContent = presentCount + absentCount;
  document.getElementById('presentCount').textContent = presentCount;
  document.getElementById('absentCount').textContent = absentCount;
}


/****************************** Rapport ******************************** */

function genererRapport() {
  const date = new Date().toLocaleDateString("fr-FR");

  let contenu = `📜 Rapport de Transport Scolaire - ${date}
 
========================================================

📊 STATISTIQUES GÉNÉRALES:

- Élèves présents: ${presentCount}
- Élèves absents: ${absentCount}
- Total élèves: ${presentCount + absentCount}


  ✅ ÉLÈVES PRÉSENTS:\n\n`;

  if (presentList.length > 0) {
    presentList.forEach((e) => {
      contenu += 
      `👨‍🎓${e.name}\n  
      Heure d'entrée: ${e.time_IN || "---"}  
      Heure de sortie: ${e.time_out || "---"}
      Station: ${arret_detectee || "---"}\n\n`;
    });
  } else {
    contenu += "Aucun élève présent\n\n";
  }

  contenu += `❌ ÉLÈVES ABSENTS:\n\n`;

  if (absentList.length > 0) {
    absentList.forEach((e) => {
      contenu += `- ${e}\n`;
    });
  } else {
    contenu += 
    "Aucun élève absent\n";
  }

  contenu += `\n📍 ARRÊTS DE BUS:\n`;

  if (busStops.length > 0) {
    busStops.forEach((arret, index) => {
      contenu += `
      ${index + 1}. ${arret.nom}. ${arret.visited ? "✅ Visité" : "❌ Non Visité"}
         - Heure d'arrivée: ${arret.arrivalTime || 'N/A'}
         
      `;
    });
  } else {
    contenu += "Aucun arrêt de bus\n";
  }



  // 💾 Création et téléchargement du fichier
  const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `rapport-transport-${date.replace(/\//g, "-")}.txt`;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
}


// Initialisation au chargement
document.addEventListener('DOMContentLoaded', initPresenceSystem);