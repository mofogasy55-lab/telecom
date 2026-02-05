# Application SIIG

Application de gestion pour le système d'information d'un établissement scolaire.

## Bref

Le projet synchronise la base SQLite au démarrage et expose des modules de gestion : Étudiants, Semestres, Classes, Matières, Inscriptions, UE, EC, Matières par classe, Affectations de classe.

## Prérequis

- Node.js (v14+)
- PHP (v7.4+)
- npm ou yarn

## Installation

1. Installer les dépendances du frontend :
   ```bash
   cd siig-frontend
   npm install
   ```

2. Installer les dépendances du backend (si nécessaire) :
   ```bash
   cd ../siig-backend
   composer install
   ```

## Lancement de l'application

1. Rendez le script exécutable (si ce n'est pas déjà fait) :
   ```bash
   chmod +x start-app.sh
   ```

2. Lancez l'application :
   ```bash
   ./start-app.sh
   ```

3. L'application sera disponible à :
   - Frontend : http://localhost:5173
   - Backend : http://localhost:8000

## Arrêt de l'application

Appuyez simplement sur `Ctrl+C` dans le terminal où le script est en cours d'exécution.
# telecom
