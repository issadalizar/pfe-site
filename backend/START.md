# Guide de Démarrage du Serveur

## Problème: Le serveur ne démarre pas

### Solution 1: Testez avec le serveur de test

```bash
cd backend
node test-server.js
```

Si cela fonctionne, le problème vient des imports ou de MongoDB.

### Solution 2: Vérifiez les dépendances

```bash
cd backend
npm install
```

### Solution 3: Vérifiez le fichier .env

Assurez-vous que le fichier `.env` existe dans `backend/` et contient:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pfe_db
NODE_ENV=development
```

### Solution 4: Démarrez sans MongoDB

Le serveur devrait maintenant démarrer même si MongoDB n'est pas disponible.

```bash
cd backend
npm run dev
```

Vous devriez voir:
```
🚀 Serveur backend démarré sur le port 3000
📍 URL: http://localhost:3000
```

Même si MongoDB n'est pas connecté, le serveur devrait démarrer.

### Solution 5: Vérifiez les erreurs dans la console

Si le serveur ne démarre toujours pas, copiez le message d'erreur exact et vérifiez:

1. **"Cannot find module"** → Exécutez `npm install`
2. **"EADDRINUSE"** → Le port 3000 est utilisé, changez le PORT dans `.env`
3. **"SyntaxError"** → Il y a une erreur de syntaxe dans le code
4. **Erreur MongoDB** → Normal, le serveur devrait quand même démarrer

### Solution 6: Testez les routes

Une fois le serveur démarré, testez:

1. `http://localhost:3000/` → Devrait afficher les endpoints
2. `http://localhost:3000/api/health` → Devrait afficher le statut

Si ces routes fonctionnent, le serveur est opérationnel!

## Messages d'erreur courants

### "Cannot find module './config/database.js'"
→ Vérifiez que le dossier `config/` existe et contient `database.js`

### "Cannot find module './routes/userRoutes.js'"
→ Vérifiez que le dossier `routes/` existe et contient `userRoutes.js`

### "Port 3000 already in use"
→ Changez le PORT dans `.env` à 3001 ou arrêtez le processus qui utilise le port 3000
