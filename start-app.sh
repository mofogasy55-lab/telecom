#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher un message d'information
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR" || exit 1

# Vérifier si les répertoires existent
if [ ! -d "siig-frontend" ] || [ ! -d "siig-backend" ]; then
    echo "Erreur : Les dossiers siig-frontend et/ou siig-backend sont introuvables."
    echo "Assurez-vous d'exécuter ce script depuis le répertoire racine du projet."
    exit 1
fi

# Démarrer le backend PHP
info "Démarrage du backend PHP..."
cd siig-backend
mkdir -p storage
touch storage/app.db
if [ -z "$DB_DSN" ]; then
    if [ ! -w storage ] || [ ! -w storage/app.db ]; then
        echo "Erreur : Le backend ne peut pas écrire dans siig-backend/storage/app.db"
        exit 1
    fi
    export DB_DSN="sqlite:$(pwd)/storage/app.db"
fi
php -S localhost:8000 -t public &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 2

# Démarrer le frontend
info "Démarrage du frontend..."
cd ../siig-frontend
npm run dev &
FRONTEND_PID=$!

# Afficher les URLs d'accès
echo ""
success "L'application est en cours d'exécution :"
echo "- Frontend : http://localhost:5173"
echo "- Backend : http://localhost:8000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"

# Attendre que l'utilisateur appuie sur Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2> /dev/null; exit" SIGINT
wait

# Nettoyage en cas de sortie propre
echo -e "\nArrêt des serveurs..."
kill $BACKEND_PID $FRONTEND_PID 2> /dev/null
