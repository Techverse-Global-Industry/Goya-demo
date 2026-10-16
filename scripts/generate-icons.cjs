const fs = require('node:fs');
const sharp = require('sharp');
fs.mkdirSync('public/icons', { recursive: true });
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0a0a0b"/><rect x="80" y="80" width="352" height="352" rx="70" fill="none" stroke="#d4af37" stroke-width="2"/><g fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter"><path d="M151 302V204l42 65 42-65v98M155 204h-12m84 0h16m-100 98h20m64 0h20M362 220c-14-18-34-23-51-16-22 9-30 29-30 51s10 44 32 48c20 4 37-2 49-11v-34h-34M184 330h144"/></g></svg>');
Promise.all([[192, 'icon-192'], [512, 'icon-512'], [512, 'maskable-512'], [180, 'apple-touch-icon']].map(([size, name]) => sharp(svg).resize(size, size).png().toFile(`public/icons/${name}.png`))).then(() => console.log('PWA icons generated.'));
