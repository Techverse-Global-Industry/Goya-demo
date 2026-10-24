const fs = require('node:fs');

// Freeze one ICU version's labels so SSR and browser hydration render identical
// country/language names. Regenerate deliberately when changing supported codes.
const languages = ['en', 'it', 'fr', 'de', 'es', 'ja', 'ar'];
const contacts = fs.readFileSync('lib/contact-countries.ts', 'utf8');
const markets = fs.readFileSync('lib/international-markets.ts', 'utf8');
const codes = [...new Set([
  ...[...contacts.matchAll(/"([A-Z]{2})"/g)].map(match => match[1]),
  ...[...markets.matchAll(/"code":\s*"([A-Z]{2})"/g)].map(match => match[1]),
])].filter(code => code !== 'WW').sort();
const regions = {};
const names = {};
for (const language of languages) {
  const regionLabels = new Intl.DisplayNames([language], { type: 'region' });
  const languageLabels = new Intl.DisplayNames([language], { type: 'language' });
  regions[language] = Object.fromEntries(codes.map(code => [code, regionLabels.of(code) ?? code]));
  names[language] = Object.fromEntries(languages.map(code => [code, languageLabels.of(code) ?? code]));
}
fs.writeFileSync('lib/region-names.json', `${JSON.stringify(regions, null, 2)}\n`);
fs.writeFileSync('lib/language-names.json', `${JSON.stringify(names, null, 2)}\n`);
console.log(JSON.stringify({ regions: codes.length, languages: languages.length, labels: codes.length * languages.length + languages.length ** 2 }));
