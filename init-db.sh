#!/bin/bash

# Arrêter les services en cours d'exécution
pkill -f "php -S"
pkill -f "vite"

# Créer le répertoire de stockage s'il n'existe pas
mkdir -p siig-backend/storage

# Créer le fichier de base de données sqlite si nécessaire
if [ -z "$DB_DSN" ] || [[ "$DB_DSN" == sqlite:* ]]; then
  touch siig-backend/storage/app.db

  # Définir les permissions
  echo "Définition des permissions..."
  chmod 777 siig-backend/storage/app.db
  chmod 777 siig-backend/storage/
fi

# Initialiser la base de données
echo "Initialisation de la base de données..."
cd siig-backend
php -r "
    require 'vendor/autoload.php';
    require 'src/bootstrap.php';
    
    echo 'Base de données initialisée avec succès!';
"

# Démarrer les services
echo "Démarrage des services..."
cd ..
./start-app.sh
