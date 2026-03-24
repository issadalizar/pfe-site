# Projet PFE - Gestion des Utilisateurs

Application de gestion des utilisateurs avec architecture frontend/backend séparée.

## Structure du Projet

```
pfe/
├── frontend/          # Application React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── backend/           # API Express.js
    ├── models/        # Modèles de données
    ├── routes/        # Routes API
    ├── server.js      # Serveur principal
    ├── .env          # Variables d'environnement
    └── package.json
```

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Démarrage

### Backend

```bash
cd backend
npm run dev
```

Le serveur backend démarre sur `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run dev
```

L'application frontend démarre sur `http://localhost:5173`

## Configuration

### Backend (.env)

Créez un fichier `.env` dans le dossier `backend/` avec :

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pfe_db
NODE_ENV=development
```

### MongoDB

Assurez-vous que MongoDB est installé et démarré :

```bash
# Windows
net start MongoDB

# Linux/Mac
mongod
```

La base de données `pfe_db` et la collection `users` seront créées automatiquement lors de la première insertion.

### Frontend

Le frontend est configuré pour communiquer avec le backend via le proxy Vite. Si vous changez le port du backend, modifiez `vite.config.js`.

## API Endpoints

- `POST /api/users` - Créer un nouvel utilisateur
- `GET /api/users` - Récupérer tous les utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur par ID
- `PATCH /api/users/:id/toggle` - Activer/désactiver un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur
- `GET /api/health` - Vérifier l'état du serveur

## Utilisation avec Postman

Pour insérer des utilisateurs via Postman :

1. **Méthode**: POST
2. **URL**: `http://localhost:3000/api/users`
3. **Headers**: `Content-Type: application/json`
4. **Body** (raw JSON):
```json
{
  "email": "user@example.com",
  "nom": "Nom",
  "prenom": "Prénom",
  "role": "utilisateur",
  "actif": true
}
```

Des exemples de données sont disponibles dans `backend/examples/postman-users.json`

## Technologies

- **Frontend**: React, Vite, Bootstrap, React Router
- **Backend**: Node.js, Express.js, CORS, Mongoose
- **Base de données**: MongoDB
