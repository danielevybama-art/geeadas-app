/* GEEAD ABIDJAN SUD — Configuration et référentiels */

/* Configuration Firebase du projet. Laissée à null, l'application démarre en mode démonstration. */
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBBojAM0-KmYFrqMsAD9sSuH-YSFgrTcVg",
  authDomain: "geead-abidjan-sud.firebaseapp.com",
  projectId: "geead-abidjan-sud",
  storageBucket: "geead-abidjan-sud.firebasestorage.app",
  messagingSenderId: "777451405530",
  appId: "1:777451405530:web:1e71abc008f652ce56a5e3"
};

var CONFIG = { prefixe: 'GAS', region: 'Abidjan Sud', marque: 'GEEAD ABIDJAN SUD' };
var LOGO = 'assets/logo.png';
/* Adresse de l'administrateur de la plateforme */
var BOOTSTRAP_ADMIN = 'danielevybama@gmail.com';

/* Postes et droits. L'administrateur de la plateforme dispose de tous les droits. */
var ALL_PERMS = ['membres','membres.edit','membres.delete','inscriptions','acces','cellules','annonces','diffusion','suivi','suivi.edit','export','journal','opportunites','reseau','stats','parametres'];
var READ_PERMS = ['membres','stats','reseau','export','journal','suivi','opportunites'];
var EDIT_PERMS = ['membres.edit','suivi.edit','inscriptions','annonces','cellules','acces','parametres'];
var PERM_LABELS = {
  'membres':'Consulter les membres', 'membres.edit':'Enregistrer et modifier les GEEADISTES', 'membres.delete':'Supprimer des fiches',
  'inscriptions':'Valider les inscriptions des membres', 'acces':'Valider les accès des bureaux locaux', 'cellules':'Créer et gérer les cellules',
  'annonces':'Publier des annonces', 'diffusion':'Envoyer des messages ciblés', 'suivi':'Consulter le suivi', 'suivi.edit':'Ajouter des notes de suivi',
  'export':'Exporter les données', 'journal':'Consulter le journal d\'activité', 'opportunites':'Repérer les nouvelles cellules',
  'reseau':'Réseau, mentors et talents', 'stats':'Statistiques', 'parametres':'Paramètres de la région'
};
var POSTES = {
  regional: [
    {t:'Président(e) régional(e)', p:'all', d:'Pilote la région : vue d\'ensemble, validations, paramètres.'},
    {t:'Vice-président(e) régional(e)', p:'all', d:'Seconde le président avec les mêmes droits.'},
    {t:'Secrétaire général(e)', p:['membres','membres.edit','inscriptions','acces','cellules','annonces','diffusion','suivi','export','journal','opportunites','reseau','stats'], d:'Tient le registre, valide les bureaux locaux.'},
    {t:'Secrétaire à l\'organisation', p:['membres','membres.edit','inscriptions','cellules','annonces','diffusion','opportunites','reseau','stats'], d:'Organise les cellules et les activités.'},
    {t:'Trésorier(ère) régional(e)', p:['membres','export','stats','reseau'], d:'Consulte les effectifs et exporte les données.'},
    {t:'Chargé(e) du suivi spirituel', p:['membres','suivi','suivi.edit','stats','reseau'], d:'Suit l\'accompagnement des membres.'},
    {t:'Chargé(e) de communication', p:['membres','annonces','diffusion','stats','reseau'], d:'Publie les annonces et diffuse les messages.'},
    {t:'Commissaire aux comptes', p:['membres','stats','export','journal'], d:'Contrôle en lecture seule.'}
  ],
  local: [
    {t:'Président(e) de cellule', p:['membres','membres.edit','inscriptions','suivi','suivi.edit','diffusion','export','reseau'], d:'Gère les GEEADISTES de la cellule.'},
    {t:'Vice-président(e) de cellule', p:['membres','membres.edit','inscriptions','suivi','suivi.edit','diffusion','export','reseau'], d:'Seconde le président de cellule.'},
    {t:'Secrétaire de cellule', p:['membres','membres.edit','inscriptions','diffusion','export','reseau'], d:'Enregistre et met à jour les fiches.'},
    {t:'Trésorier(ère) de cellule', p:['membres','reseau'], d:'Consulte les membres de la cellule.'},
    {t:'Chargé(e) du suivi', p:['membres','suivi','suivi.edit','reseau'], d:'Assure le suivi spirituel et académique.'}
  ]
};
function posteDef(niveau, titre){ return (POSTES[niveau]||[]).find(function(x){ return x.t===titre; }); }
function permsOfPoste(niveau, titre){ var p=posteDef(niveau,titre); return p?(p.p==='all'?ALL_PERMS.slice():p.p.slice()):[]; }
function accesForPoste(niveau, titre){ return permsOfPoste(niveau,titre).some(function(x){ return EDIT_PERMS.indexOf(x)>=0; })?'complet':'lecture'; }
var TITRES = { regional: ['Administrateur(trice) de la plateforme'].concat(POSTES.regional.map(function(x){ return x.t; })), local: POSTES.local.map(function(x){ return x.t; }) };
var NIVEAUX = {
  'Élève': ['6e','5e','4e','3e','2nde','1ère','Terminale','CAP / BT'],
  'Étudiant': ['BTS 1','BTS 2','Licence 1','Licence 2','Licence 3','Master 1','Master 2','Doctorat','Formation pro']
};
var ORDRE_NIV = NIVEAUX['Élève'].concat(NIVEAUX['Étudiant']);
var ENGAGEMENTS = ['Chorale','Intercession','Évangélisation','Accueil','Média / Technique','Enseignement','Musique','Leadership'];
var TYPES_SUIVI = ['Visite / entretien','Prière / soutien spirituel','Soutien académique','Prise en charge sociale','Absence prolongée','Félicitations'];

