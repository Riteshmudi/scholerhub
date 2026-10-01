import { spawn, spawnSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function ensureBackendReady() {
  const serverDir = resolve(__dirname, 'server');

  const hasNodeModules = existsSync(resolve(serverDir, 'node_modules'));
  if (!hasNodeModules) {
    console.log('[start-backend] Server dependencies not found. Running setup...');
    spawnSync('node', [resolve(__dirname, 'scripts/setup-backend.mjs')], {
      stdio: 'inherit',
      cwd: __dirname,
    });
  }

  const envFile = resolve(serverDir, '.env');
  if (!existsSync(envFile)) {
    console.log('[start-backend] Creating server/.env...');
    writeFileSync(envFile, [
      'DATABASE_URL="file:./prisma/dev.db"',
      'SESSION_SECRET=dev-secret-change-me',
      'PORT=4000',
      'CORS_ORIGIN=http://localhost:3000',
      'GEMINI_API_KEY=',
    ].join('\n') + '\n');
  }
}

export function startBackendPlugin() {
  let backendProcess = null;
  let started = false;

  return {
    name: 'start-backend',
    apply: 'serve',
    configureServer(server) {
      if (started) return;
      started = true;

      ensureBackendReady();

      console.log('[start-backend] Starting Express backend on port 4000...');
      const serverDir = resolve(__dirname, 'server');
      const tsxBin = resolve(serverDir, 'node_modules', '.bin', 'tsx');

      backendProcess = spawn(tsxBin, ['src/index.ts'], {
        cwd: serverDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: '4000' },
      });

      backendProcess.stdout?.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.log(`[backend] ${msg}`);
      });

      backendProcess.stderr?.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.error(`[backend] ${msg}`);
      });

      backendProcess.on('error', (err) => {
        console.error('[start-backend] Failed to start backend:', err.message);
      });

      backendProcess.on('exit', (code) => {
        console.log(`[start-backend] Backend exited with code ${code}`);
      });

      server.httpServer?.on('close', () => {
        if (backendProcess) {
          console.log('[start-backend] Shutting down backend...');
          backendProcess.kill();
        }
      });
    },
  };
}
