import React, { useState, useEffect } from 'react';
import { FaBus, FaClock, FaMapMarkerAlt, FaUserGraduate, FaSearch, FaCheckCircle, FaTimesCircle, FaBell, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { data } from 'react-router-dom';

// Fonction pour calculer la durée en secondes entre arrival_time et departure_time
const calculateDuration = (arrival, departure) => {
  if (!arrival || !departure) return 0;
  const [arrH, arrM, arrS] = arrival.split(':').map(Number);
  const [depH, depM, depS] = departure.split(':').map(Number);
  const arrivalSeconds = arrH * 3600 + arrM * 60 + arrS;
  const departureSeconds = depH * 3600 + depM * 60 + depS;
  return departureSeconds - arrivalSeconds;
};

// Fonction pour formater la durée en minutes et secondes
const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}min ${remainingSeconds}s` : `${minutes}min`;
};

// Fonction pour formater la date ISO en DD-MM-YYYY
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function StatsSection() {
  const { token } = useAuth();
  const [stopsData, setStopsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les données des élèves
  const [studentsData, setStudentsData] = useState({
    present: [],
    absent: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  // États pour les notifications
  const [notifications, setNotifications] = useState([]);

  // Récupérer les données des stops et stoptimes depuis MongoDB
  useEffect(() => {
      console.log("useEffect appelé avec token =", token);
    const fetchStopsData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Récupération des stops...');
        const stopsResponse = await fetch('http://192.168.1.13:5000/api/stops', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!stopsResponse.ok) {
          const errorData = await stopsResponse.json();
          throw new Error(`Échec de la récupération des stations : ${errorData.message || stopsResponse.statusText}`);
        }
        const stops = await stopsResponse.json();
        console.log('Stops récupérés :', stops);

        console.log('Récupération des stoptimes...');
        const stopTimesResponse = await fetch('http://192.168.1.13:5000/api/stoptimes', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!stopTimesResponse.ok) {
          const errorData = await stopTimesResponse.json();
          throw new Error(`Échec de la récupération des durées d'arrêt : ${errorData.message || stopTimesResponse.statusText}`);
        }
        const stopTimes = await stopTimesResponse.json();
        console.log('Stoptimes récupérés :', stopTimes);

        // Joindre les données
        const combinedData = stopTimes.map((stopTime) => {
          const stop = stops.find((s) => s._id === stopTime.stop);
          return {
            station: stop ? stop.stop_name : 'Inconnu',
            duration: calculateDuration(stopTime.arrival_time, stopTime.departure_time),
            arrivalTime: stopTime.arrival_time,
            departureTime: stopTime.departure_time,
            stopSequence: stopTime.stop_sequence,
            timestamp: new Date().toISOString(),
          };
        });

        // Trier par timestamp décroissant (plus récent en premier)
        combinedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setStopsData(combinedData);
      } catch (err) {
        console.error('Erreur dans fetchStopsData :', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentsData = async () => {
      
       try { 
        setStudentsLoading(true);
        // Simuler des données d'élèves - remplacez par votre API réelle
        const response = await fetch('http://192.168.1.13:5000/api/presence');
        if (!response.ok) {
      throw new Error('Erreur HTTP : ' + response.status);
    }
          const data = await response.json();
          
          console.log("Données reçues du backend", data);
          
    if (!data || !Array.isArray(data.present) ) {
      throw new Error("Données invalides reçues");
    }
    console.log("Données reçues du backend", data);

    setStudentsData({
      present: data.present,
      
    });
          // [{name: data.name, busNumber:'Bus 001'}],
          
            //{ id: 1, name: 'Issam Abdallah', busNumber: 'Bus 001' },
            

        // Simuler des notifications récentes
        const notificationsData = data.present.map((student, index) => ({
 
         // { id: 1, message: 'Bus 001 a quitté l\'école à 16:30', timestamp: new Date(Date.now() - 5000), type: 'info' },
          //{ id: 1, message: 'Élève Ahmed Trabelsi est monté à l\'arrêt Centre Ville', timestamp: new Date(Date.now() - 15000), type: 'success' },
          //{ id: 3, message: 'Retard de 5 minutes détecté sur la ligne principale', timestamp: new Date(Date.now() - 30000), type: 'warning' },
          //{ id: 4, message: 'Sara Haddad marquée comme absente', timestamp: new Date(Date.now() - 45000), type: 'error' },
      id: index + 1,
      message: `Élève ${student.name} est monté à l'arrêt ${student.stop || 'inconnu'}`,
      timestamp: new Date(), // ou utilise eleve.timestamp s'il existe dans la base
      type: 'success',}));
        // Trier les notifications par timestamp décroissant (plus récente en premier)
        notificationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(notificationsData);
        
      } catch (err) {
        console.error('Erreur lors de la récupération des élèves:', err);
        toast.error('Erreur lors de la récupération des données élèves.', { position: 'top-right' });
      } finally {
        setStudentsLoading(false);
      }
    };

    
    if (token) {
      fetchStopsData();
      fetchStudentsData();
    } else {
      setError('Utilisateur non authentifié');
      setLoading(false);
      setStudentsLoading(false);
    }
  }, [token]);

  // Fonctions utilitaires
  const handleGenerateReport = () => {
    const reportData = `
      Rapport de Transport Scolaire - ${new Date().toLocaleDateString()}
      ========================================================
      
      STATISTIQUES GÉNÉRALES:
      - Nombre d'arrêts enregistrés: ${stopsData.length}
      - Élèves présents: ${data.present.length}
      - Élèves absents: ${data.absent.length}
      - Total élèves: ${data.present.length + data.absent.length}
      
      DÉTAIL DES ARRÊTS:
      ${stopsData.map((stop, index) => `
      ${index + 1}. ${stop.station}
         - Durée d'arrêt: ${formatDuration(stop.duration)}
         - Heure d'arrivée: ${stop.arrivalTime}
         - Heure de départ: ${stop.departureTime}
         - Séquence: ${stop.stopSequence}
      `).join('')}
      
      ÉLÈVES PRÉSENTS:
      ${data.present.map((student, index) => `
      ${index + 1}. ${student.name} (${student.busNumber})
      `).join('')}
      
      ÉLÈVES ABSENTS:
      ${data.absent.map((student, index) => `
      ${index + 1}. ${student.name} (${student.busNumber})
      `).join('')}
    `;
    
    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_transport_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Rapport généré et téléchargé !', { position: 'top-right' });
  };

  // Filtrer les élèves selon le terme de recherche
  const filteredPresentStudents = data.present.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAbsentStudents = data.absent.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen space-y-6">
      
      {/* Section Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <FaBus className="text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Arrêts Enregistrés</h3>
              <p className="text-2xl font-bold">{stopsData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <FaCheckCircle className="text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Élèves Présents</h3>
              <p className="text-2xl font-bold">{data.present.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <FaTimesCircle className="text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Élèves Absents</h3>
              <p className="text-2xl font-bold">{data.absent.length}</p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
            >
              <FaFileAlt className="mr-1" /> Rapport
            </button>
          </div>
        </div>
      </div>

      {/* Section Notifications récentes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 text-white">
          <div className="flex items-center">
            <FaBell className="text-2xl mr-3" />
            <div>
              <h3 className="text-xl font-bold">Notifications Récentes</h3>
              <p className="text-yellow-100 text-sm">Activités en temps réel</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <FaBell className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500">Aucune notification récente</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-3 rounded-lg border-l-4 ${
                    notification.type === 'success' 
                      ? 'bg-green-50 border-green-500' 
                      : notification.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : notification.type === 'error'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  } animate-fadeIn`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Tableau des Élèves */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaUserGraduate className="text-3xl mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Liste des Élèves</h3>
                <p className="text-indigo-100">Suivi de présence en temps réel</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{data.present.length + data.absent.length}</div>
              <div className="text-indigo-100 text-sm">Total Élèves</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-4 text-gray-400" />
            </div>
          </div>

          {studentsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500">Chargement des élèves...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tableau des Élèves Présents */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-4 flex items-center text-green-700">
                  <FaCheckCircle className="mr-2" /> 
                  Élèves Présents ({filteredPresentStudents.length})
                </h4>
                
                {filteredPresentStudents.length > 0 ? (
                  <div className="bg-white rounded-lg overflow-hidden border border-green-200">
                    <table className="w-full">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-green-800">#</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-green-800">Nom</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-green-800">Bus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-100">
                        {filteredPresentStudents.map((student, index) => (
                          <tr key={student.id} className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-green-700">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-green-800">{student.name}</td>
                            <td className="px-4 py-3 text-sm text-green-600">{student.busNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaUserGraduate className="mx-auto text-green-400 text-3xl mb-2" />
                    <p className="text-green-600">Aucun élève présent trouvé</p>
                  </div>
                )}
              </div>

              {/* Tableau des Élèves Absents */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-4 flex items-center text-red-700">
                  <FaTimesCircle className="mr-2" /> 
                  Élèves Absents ({filteredAbsentStudents.length})
                </h4>
                
                {filteredAbsentStudents.length > 0 ? (
                  <div className="bg-white rounded-lg overflow-hidden border border-red-200">
                    <table className="w-full">
                      <thead className="bg-red-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-red-800">#</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-red-800">Nom</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-red-800">Bus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {filteredAbsentStudents.map((student, index) => (
                          <tr key={student.id} className="hover:bg-red-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-red-700">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-red-800">{student.name}</td>
                            <td className="px-4 py-3 text-sm text-red-600">{student.busNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaUserGraduate className="mx-auto text-red-400 text-3xl mb-2" />
                    <p className="text-red-600">Aucun élève absent trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Arrêts du Bus */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaBus className="text-3xl mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Arrêts du Bus</h3>
                <p className="text-blue-100">Suivi des temps d'arrêt</p>
              </div>
            </div>
            {!loading && !error && (
              <div className="text-right">
                <div className="text-2xl font-bold">{stopsData.length}</div>
                <div className="text-blue-100 text-sm">Total Arrêts</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Chargement des données...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <p className="text-red-700 font-medium">Erreur de chargement</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : stopsData.length === 0 ? (
            <div className="text-center py-12">
              <FaBus className="mx-auto text-gray-400 text-5xl mb-4" />
              <p className="text-gray-500 text-lg font-medium">Aucun arrêt enregistré</p>
              <p className="text-gray-400 text-sm mt-1">Les données apparaîtront ici une fois disponibles</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cartes pour mobile */}
              <div className="block lg:hidden space-y-4">
                {stopsData.map((stop, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-600 mr-2" />
                        <h4 className="text-lg font-semibold text-gray-800 truncate">{stop.station}</h4>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <FaClock className="text-green-600 mr-2 text-xs" />
                        <div>
                          <div className="text-gray-500">Durée d'arrêt</div>
                          <div className="font-medium text-gray-800">{formatDuration(stop.duration)}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Horaires</div>
                        <div className="font-medium text-gray-800 text-xs">
                          {stop.arrivalTime} → {stop.departureTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Date</div>
                        <div className="font-medium text-gray-800 text-xs">
                          {formatDate(stop.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tableau pour desktop */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-5/12">
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-1" />
                              Station
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                            <div className="flex items-center">
                              <FaClock className="mr-1" />
                              Durée
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                            Arrivée
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                            Départ
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stopsData.map((stop, index) => (
                          <tr
                            key={index}
                            className="hover:bg-blue-50 transition-colors duration-200 animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={stop.station}>
                                {stop.station}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                stop.duration > 60 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {formatDuration(stop.duration)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                              {stop.arrivalTime}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                              {stop.departureTime}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                              {formatDate(stop.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        /* Assurer que le contenu ne déborde pas */
        .max-w-full {
          max-width: calc(100vw - 2rem);
        }
        
        @media (min-width: 1024px) {
          .max-w-full {
            max-width: calc(100vw - 280px);
          }
        }
        
        /* Responsive table */
        @media (max-width: 1280px) {
          .max-w-full {
            max-width: calc(100vw - 1rem);
          }
        }
        
        /* Scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
