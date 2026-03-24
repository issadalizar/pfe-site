# Backend API - Gestion des Utilisateurs

API REST pour la gestion des utilisateurs avec MongoDB.

## Prérequis

- Node.js installé
- MongoDB installé et en cours d'exécution

## Installation

```bash
npm install
```

## Configuration

1. Créez un fichier `.env` à la racine du dossier `backend/`
2. Configurez les variables d'environnement :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pfe_db
NODE_ENV=development
```

## Démarrage de MongoDB

Assurez-vous que MongoDB est démarré :

```bash
# Windows
net start MongoDB

# Linux/Mac
mongod
```

## Démarrage du serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Base de données

- **Base de données**: `pfe_db`
- **Collection**: `users`

## API Endpoints

### POST /api/users
Créer un nouvel utilisateur

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "role": "utilisateur",
  "actif": true
}
```

### GET /api/users
Récupérer tous les utilisateurs

### GET /api/users/:id
Récupérer un utilisateur par ID

### PATCH /api/users/:id/toggle
Activer/désactiver un utilisateur

### PUT /api/users/:id
Mettre à jour un utilisateur

### DELETE /api/users/:id
Supprimer un utilisateur

## Utilisation avec Postman

### Créer un utilisateur

1. Méthode: **POST**
2. URL: `http://localhost:3000/api/users`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "nom": "Doe",
  "prenom": "John",
  "role": "utilisateur",
  "actif": true
}
```

### Exemples de données à insérer

```json
[
  {
    "email": "john.doe@example.com",
    "nom": "Doe",
    "prenom": "John",
    "role": "utilisateur",
    "actif": true
  },
  {
    "email": "jane.smith@example.com",
    "nom": "Smith",
    "prenom": "Jane",
    "role": "utilisateur",
    "actif": true
  },
  {
    "email": "bob.martin@example.com",
    "nom": "Martin",
    "prenom": "Bob",
    "role": "utilisateur",
    "actif": false
  }
]
```
