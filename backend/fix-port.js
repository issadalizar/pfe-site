// Script pour trouver et tuer le processus utilisant le port 3000
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function findAndKillPort(port) {
  try {
    // Windows: trouver le PID utilisant le port
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    
    if (lines.length === 0 || lines[0] === '') {
      console.log(`✅ Le port ${port} n'est pas utilisé`);
      return;
    }

    console.log(`🔍 Processus utilisant le port ${port}:`);
    console.log(stdout);
    
    // Extraire les PIDs uniques
    const pids = new Set();
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0) {
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    });

    if (pids.size > 0) {
      console.log(`\n📋 PIDs trouvés: ${Array.from(pids).join(', ')}`);
      console.log(`\n💡 Pour arrêter ces processus, utilisez:`);
      pids.forEach(pid => {
        console.log(`   taskkill /PID ${pid} /F`);
      });
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

const port = process.argv[2] || 3000;
findAndKillPort(port);
