import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverDir = join(__dirname, '..', 'server');

console.log('[setup-backend] Installing server dependencies...');
execSync('npm install', { cwd: serverDir, stdio: 'inherit' });

const envPath = join(serverDir, '.env');
if (!existsSync(envPath)) {
  console.log('[setup-backend] Creating server/.env...');
  writeFileSync(envPath, [
    'DATABASE_URL="file:./prisma/dev.db"',
    'SESSION_SECRET=dev-secret-change-me',
    'PORT=4000',
    'CORS_ORIGIN=http://localhost:3000',
    'GEMINI_API_KEY=',
  ].join('\n') + '\n');
}

console.log('[setup-backend] Generating Prisma client...');
execSync('npx prisma generate --schema=prisma/schema.prisma', { cwd: serverDir, stdio: 'inherit' });

console.log('[setup-backend] Pushing database schema...');
execSync('npx prisma db push --schema=prisma/schema.prisma', { cwd: serverDir, stdio: 'inherit' });

console.log('[setup-backend] Done.');
