const fs = require('node:fs');
const sharp = require('sharp');
fs.mkdirSync('public/icons', { recursive: true });
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#30392f"/><circle cx="256" cy="256" r="165" fill="none" stroke="#d1c4aa" stroke-width="2"/><g transform="translate(-227 -126) scale(1.5)" fill="none" stroke="#eee6d2" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter"><path d="M362 220c-14-18-34-23-51-16-22 9-30 29-30 51s10 44 32 48c20 4 37-2 49-11v-34h-34"/></g></svg>');
Promise.all([[192, 'icon-192'], [512, 'icon-512'], [512, 'maskable-512'], [180, 'apple-touch-icon']].map(([size, name]) => sharp(svg).resize(size, size).png().toFile(`public/icons/${name}.png`))).then(() => console.log('PWA icons generated.'));
