const fs = require('node:fs');
const crypto = require('node:crypto');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());
const target = '.env.hosting.local';
const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
const previousValue = existing.match(/^ADMIN_PASSWORD=(.+)$/m)?.[1];
const previousPassword = previousValue ? JSON.parse(previousValue) : undefined;
try {
  const database = new URL(process.env.DATABASE_URL || '');
  if (!['postgres:', 'postgresql:'].includes(database.protocol) || !database.hostname.endsWith('.neon.tech') || !database.password) throw new Error('database');
} catch {
  console.error('Add the complete Neon PostgreSQL connection string to DATABASE_URL in .env.local first.');
  process.exit(1);
}
const keys = ['NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'];
if (keys.some((key) => !process.env[key])) {
  console.error('Notification keys are missing. Run npm run setup:demo first.');
  process.exit(1);
}
const values = {
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@goya.demo',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || previousPassword || crypto.randomBytes(24).toString('base64url'),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:demo@example.com',
};
fs.writeFileSync(target, '# PRIVATE: import into Netlify environment variables. Never upload as website content.\n' + Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600 });
console.log('Prepared .env.hosting.local with six hosting settings. Secrets were not printed.');
console.log('DEMO_LOCAL and localhost APP_URL are excluded.');
