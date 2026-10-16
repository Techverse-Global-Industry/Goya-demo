const fs = require('node:fs');
const webpush = require('web-push');
const file = '.env.local';
const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
if (!/^DEMO_LOCAL=/m.test(existing)) fs.appendFileSync(file, '\nDEMO_LOCAL=true\n', { mode: 0o600 });
if (/^NEXT_PUBLIC_VAPID_PUBLIC_KEY=\S+/m.test(existing)) {
  console.log('Push keys already configured. Existing environment preserved.');
} else {
  const keys = webpush.generateVAPIDKeys();
  const additions = `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\nVAPID_SUBJECT=mailto:demo@example.com\n`;
  fs.appendFileSync(file, additions, { mode: 0o600 });
  console.log('Created local push keys in .env.local. Do not commit this file.');
}
console.log('Local admin: admin@goya.demo / MaisonDemo2026!');
console.log('Hosted deployments require your own ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL and APP_URL.');
