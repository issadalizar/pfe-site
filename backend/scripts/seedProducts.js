// scripts/seedProducts.js
// Usage: node scripts/seedProducts.js
// Upserts products from data/products-seed.json into MongoDB, preserving _id.
// Re-runnable (idempotent).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_FILE = path.join(__dirname, '..', 'data', 'products-seed.json');

// Convert MongoDB Extended JSON ($oid, $date) into real BSON/JS values.
function reviveExtendedJson(value) {
  if (Array.isArray(value)) return value.map(reviveExtendedJson);
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === '$oid') {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    if (keys.length === 1 && keys[0] === '$date') {
      return new Date(value.$date);
    }
    const out = {};
    for (const k of keys) out[k] = reviveExtendedJson(value[k]);
    return out;
  }
  return value;
}

async function seedProducts() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe_db';
  console.log('🔄 Connexion à MongoDB:', uri);
  await mongoose.connect(uri);
  console.log('✅ Connecté');

  const raw = fs.readFileSync(SEED_FILE, 'utf8');
  const products = reviveExtendedJson(JSON.parse(raw));
  console.log(`📦 ${products.length} produits à importer`);

  // Bypass mongoose hooks so slug / cheminImageAuto / images stay as provided.
  const coll = Product.collection;

  const ops = products.map((p) => ({
    replaceOne: {
      filter: { _id: p._id },
      replacement: p,
      upsert: true,
    },
  }));

  const res = await coll.bulkWrite(ops, { ordered: false });
  console.log('\n📊 Résultat :');
  console.log(`   ✅ Insérés  : ${res.upsertedCount}`);
  console.log(`   🔁 Modifiés : ${res.modifiedCount}`);
  console.log(`   📌 Identiques (déjà à jour) : ${res.matchedCount - res.modifiedCount}`);

  const total = await Product.countDocuments();
  console.log(`\n📈 Total produits dans la base: ${total}`);

  await mongoose.disconnect();
  console.log('👋 Déconnecté');
}

seedProducts().catch(async (err) => {
  console.error('❌ Erreur:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
