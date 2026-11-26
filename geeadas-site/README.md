# GEEAD Abidjan Sud — Plateforme de recensement v2

Application web installable (PWA) de gestion des membres du GEEAD Région Abidjan Sud.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Point d'entrée |
| `styles.css` | Design system (couleurs, composants, animations) |
| `data.js` | Configuration, données, connexion Firebase — **c'est ici qu'on colle la config Firebase** |
| `app.js` | Coquille, navigation, tableaux de bord, fiches, assistant d'enregistrement |
| `views.js` | Écrans de gestion, actions, démarrage |
| `logo.js` | Logo embarqué |
| `manifest.webmanifest`, `sw.js`, `` | Installation sur téléphone et fonctionnement hors connexion |
| `firestore.rules` | Règles de sécurité de la base |

## Niveaux d'accès

| | Bureau régional | Bureau local (cellule) |
|---|---|---|
| Voir | Toute la région | Sa cellule uniquement |
| Enregistrer / modifier des GEEADISTES | Oui, partout | Oui, dans sa cellule |
| Valider les inscriptions | Toutes | Celles de sa cellule |
| Suivi spirituel et académique | Oui | Oui |
| Cartes et paiements | Oui + impression par lot | Oui pour ses membres |
| Cellules, comptes, annonces, journal, paramètres | Oui | Non (lit les annonces) |
| Supprimer un membre | Oui | Non |

Chaque compte a un **titre** (Président(e) régional(e), Secrétaire général(e), Président(e) de cellule, Secrétaire de cellule…) et un accès **Gestion** ou **Lecture seule**.

## Identifiant unique

Format `GAS-AA-NNNNN` (ex. `GAS-26-00042`) : année d'inscription + numéro d'ordre régional. Attribué automatiquement, il ne change jamais (changements d'école, de cellule ou d'église gardés dans l'historique de la fiche).

## Mise en production

### 1. Firebase
1. https://console.firebase.google.com → *Ajouter un projet* (ex. `geeadas`).
2. *Authentication* → activer **E-mail/Mot de passe**.
3. *Firestore Database* → *Créer* (mode production, région `europe-west`).
4. *Firestore › Règles* → coller `firestore.rules` → *Publier*.
5. *Paramètres du projet › Vos applications › Web* → copier `firebaseConfig`.

### 2. Brancher l'application
Dans `data.js`, remplacer `var FIREBASE_CONFIG = null;` par `var FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", ... };`

### 3. Premier compte (président régional)
1. *Authentication › Ajouter un utilisateur* (e-mail + mot de passe) → copier son **UID**.
2. *Firestore* → collection `utilisateurs` → document d'ID = UID :
   `nom` = « Prénom NOM », `titre` = « Président(e) régional(e) », `niveau` = `regional`, `acces` = `complet`, `actif` = `true`.

Ensuite tout se fait dans l'application : *Cellules* (créer les 21 cellules), *Comptes & accès* (créer les comptes des bureaux régional et locaux avec un mot de passe provisoire).

### 4. Mise en ligne (Cloudflare Pages)
1. Pousser le dossier sur GitHub.
2. Cloudflare → *Workers & Pages › Créer › Pages › Connecter à Git* → sans commande de build, dossier de sortie `/`.
3. Ajouter le domaine personnalisé, puis dans Firebase *Authentication › Paramètres › Domaines autorisés*, ajouter ce domaine.

Lien d'inscription à partager aux membres : `https://votre-domaine/#inscription`

### 5. Installer sur téléphone
- **Android (Chrome)** : ouvrir le site → *Paramètres › Installer* dans l'application, ou menu ⋮ › *Installer l'application*.
- **iPhone (Safari)** : Partager › *Sur l'écran d'accueil*.

Le retour haptique fonctionne sur Android ; iOS ne permet pas les vibrations depuis le web.

## Données personnelles
La base contient des données de mineurs : comptes nominatifs uniquement, mots de passe forts, consentement (avec accord parental pour les mineurs) conservé dans le formulaire. Traitement à déclarer à l'ARTCI (loi n° 2013-450 relative à la protection des données à caractère personnel).
