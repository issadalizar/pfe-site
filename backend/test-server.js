// Script de test simple pour vérifier que le serveur peut démarrer
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Test serveur - OK' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur de test démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});
