import app from './app';
import { env } from './config/env';

const port = env.port;

app.listen(port, () => {
  console.log(`\n  ScholarHub Backend running at http://localhost:${port}`);
  console.log(`  Health check: http://localhost:${port}/api/health`);
  if (!env.geminiApiKey) {
    console.log(`  ⚠ GEMINI_API_KEY not set — AI features will return 503 errors`);
  }
  console.log('');
});
