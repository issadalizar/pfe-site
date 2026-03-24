# Guide de Correction - Connexion MongoDB

## ✅ Étape 1: Vérifier que MongoDB est démarré

### Windows

```bash
# Ouvrir cmd ou PowerShell et exécuter:
net start MongoDB

# Ou si MongoDB est en mode portable:
mongod
```

### Linux

```bash
sudo systemctl start mongod
```

### Mac

```bash
brew services start mongodb-community
```

**Vérifier que MongoDB écoute sur le port 27017:**

```bash
mongosh
# Vous devriez voir: test>
```

---

## ✅ Étape 2: Créer la base et la collection

```bash
# Ouvrir MongoDB Shell
mongosh

# Créer/Utiliser la base pfe_db
use pfe_db

# Créer la collection users (elle sera créée automatiquement lors du premier insert)
db.users.createIndex({ "codeClient": 1, "unique": true })
db.users.createIndex({ "numeroFacture": 1 })

# Vérifier
show collections
```

---

## ✅ Étape 3: Démarrer le backend

```bash
cd backend
npm run dev
```

**Vous devriez voir:**

```
🔗 URI de connexion MongoDB: mongodb://localhost:27017/pfe_db
✅ Connecté à MongoDB avec succès!
📍 Base de données: pfe_db
📍 Hôte: localhost
📍 Port: 27017
```

---

## ✅ Étape 4: Insérer des données avec Postman

### Configuration Postman:

- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/users`
- **Headers**:
  - `Content-Type: application/json`

### Body JSON:

```json
{
  "codeClient": "CLI001",
  "nomClient": "Client A",
  "role": "client",
  "article": "Article 1",
  "description": "Description de l'article",
  "numeroFacture": "FAC001",
  "quantite": 10,
  "montant": 500.5,
  "actif": true
}
```

### Réponse attendue (201):

```json
{
  "codeClient": "CLI001",
  "nomClient": "Client A",
  "role": "client",
  "article": "Article 1",
  "description": "Description de l'article",
  "date": "2026-01-26",
  "numeroFacture": "FAC001",
  "quantite": 10,
  "montant": 500.5,
  "actif": true,
  "id": "67890abc...",
  "createdAt": "2026-01-26T...",
  "updatedAt": "2026-01-26T..."
}
```

---

## ✅ Étape 5: Vérifier les données dans MongoDB

```bash
mongosh

use pfe_db

db.users.find().pretty()
```

---

## 🔧 Dépannage

### Erreur: "connect ECONNREFUSED 127.0.0.1:27017"

- MongoDB n'est pas démarré
- Lancez `net start MongoDB` ou `mongod`

### Erreur: "E11000 duplicate key error"

- Le code client existe déjà
- Utilisez un code client unique

### Erreur: "Validation failed"

- Un champ requis est manquant
- Vérifiez tous les champs obligatoires dans le Body JSON

---

## 📋 Champs requis pour POST /api/users:

| Champ         | Type    | Requis | Notes                          |
| ------------- | ------- | ------ | ------------------------------ |
| codeClient    | String  | ✅     | Unique, converti en majuscules |
| nomClient     | String  | ✅     | Nom du client                  |
| role          | String  | ❌     | Défaut: "client"               |
| article       | String  | ✅     | Nom de l'article               |
| description   | String  | ❌     | Description optionnelle        |
| numeroFacture | String  | ✅     | Numéro de facture              |
| quantite      | Number  | ✅     | >= 0                           |
| montant       | Number  | ✅     | >= 0                           |
| date          | Date    | ❌     | Défaut: Date.now               |
| actif         | Boolean | ❌     | Défaut: true                   |

---

## ✨ Prêt à insérer des données!
