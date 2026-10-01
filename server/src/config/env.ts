import dotenv from 'dotenv';
dotenv.config({ override: true });

function required(key: string, fallback = ''): string {
  const val = process.env[key] || fallback;
  return val;
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: required('CORS_ORIGIN', 'http://localhost:3000'),
  sessionSecret: required('SESSION_SECRET', 'dev-secret-change-me'),
  geminiApiKey: required('GEMINI_API_KEY'),
  databaseUrl: required('DATABASE_URL', 'file:./server/prisma/dev.db'),
  isProduction: process.env.NODE_ENV === 'production',
  uploadDir: required('UPLOAD_DIR', './uploads'),
  maxFileSize: 20 * 1024 * 1024,
};

export function checkGeminiKey(): void {
  if (!env.geminiApiKey) {
    console.error('\n[CONFIG ERROR] GEMINI_API_KEY is not set. AI features will not work.');
    console.error('Add your Gemini API key to the .env file. Get one at: https://aistudio.google.com/apikey\n');
  }
}
