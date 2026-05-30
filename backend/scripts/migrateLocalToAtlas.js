import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/pfe_db';
const ATLAS_URI = process.env.ATLAS_URI;

if (!ATLAS_URI) {
    console.error('❌ ATLAS_URI manquante. Lance avec :');
    console.error('   $env:ATLAS_URI="mongodb+srv://..." ; node scripts/migrateLocalToAtlas.js');
    process.exit(1);
}

const ask = (question) => new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase());
    });
});

const migrate = async () => {
    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
        console.log('🔌 Connexion à MongoDB local...');
        await localClient.connect();
        const localDb = localClient.db('pfe_db');

        console.log('🔌 Connexion à MongoDB Atlas...');
        await atlasClient.connect();
        const atlasDb = atlasClient.db('pfe_db');

        const collections = await localDb.listCollections().toArray();
        console.log(`\n📦 ${collections.length} collections trouvées en local:`);
        collections.forEach(c => console.log(`   - ${c.name}`));

        if (process.env.AUTO_CONFIRM !== '1') {
            const answer = await ask('\n⚠️  Cela va EFFACER puis REMPLIR ces collections sur Atlas. Continuer ? (oui/non): ');
            if (answer !== 'oui' && answer !== 'o' && answer !== 'yes' && answer !== 'y') {
                console.log('❌ Migration annulée.');
                return;
            }
        } else {
            console.log('\n⚠️  AUTO_CONFIRM=1 → migration sans confirmation.');
        }

        console.log('\n🚀 Démarrage de la migration...\n');

        for (const coll of collections) {
            const name = coll.name;
            if (name.startsWith('system.')) continue;

            const localColl = localDb.collection(name);
            const atlasColl = atlasDb.collection(name);

            const docs = await localColl.find({}).toArray();
            const count = docs.length;

            if (count === 0) {
                console.log(`⏭️  ${name}: vide, skip`);
                continue;
            }

            await atlasColl.deleteMany({});
            await atlasColl.insertMany(docs);
            console.log(`✅ ${name}: ${count} documents migrés`);
        }

        console.log('\n🎉 Migration terminée avec succès !');
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
};

migrate();
