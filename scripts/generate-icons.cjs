const fs = require('node:fs');
const sharp = require('sharp');
// The website, favicon and installed app use the same original vector wordmark.
const wordmark = fs.readFileSync('public/brand/goya-wordmark.svg', 'utf8');
const [,, width, height] = wordmark.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const shape = wordmark.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const scale = 360 / width;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="58" fill="#faf9f7"/><g color="#111111" fill="currentColor" transform="translate(76 ${(512-height*scale)/2}) scale(${scale})">${shape}</g></svg>`;
fs.mkdirSync('public/icons', { recursive: true });
fs.writeFileSync('app/icon.svg', svg);
Promise.all([[192,'icon-192'],[512,'icon-512'],[512,'maskable-512'],[180,'apple-touch-icon']].map(([size,name])=>sharp(Buffer.from(svg)).resize(size,size).png().toFile(`public/icons/${name}.png`))).then(()=>console.log('Canonical Goya wordmark applied to every PWA icon.')).catch(error=>{console.error(error);process.exitCode=1;});
