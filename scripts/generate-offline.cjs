const fs = require('node:fs');
const wordmark = fs.readFileSync('public/brand/goya-wordmark.svg', 'utf8');
const copy = {
  en: ['A moment to reconnect.', 'Reconnect to visit the Maison, check availability and complete a demo order.', 'Try again'],
  fr: ['Un instant pour se reconnecter.', 'Retrouvez une connexion pour visiter la Maison, consulter les disponibilités et passer une commande de démonstration.', 'Réessayer'],
  it: ['Un momento per riconnettersi.', 'Riconnettiti per visitare la Maison, verificare la disponibilità e completare un ordine dimostrativo.', 'Riprova'],
  de: ['Einen Moment, wir verbinden uns erneut.', 'Stellen Sie die Verbindung wieder her, um die Maison zu besuchen, die Verfügbarkeit zu prüfen und eine Demobestellung abzuschließen.', 'Erneut versuchen'],
  es: ['Un momento para reconectar.', 'Vuelve a conectarte para visitar la Maison, consultar la disponibilidad y completar un pedido de demostración.', 'Volver a intentar'],
  ja: ['接続の回復をお待ちください。', '再接続すると、メゾンのコレクションや在庫を確認し、デモ注文を完了できます。', 'もう一度試す'],
  ar: ['لحظة لإعادة الاتصال.', 'أعد الاتصال لزيارة الدار والتحقق من التوفر وإكمال طلب تجريبي.', 'المحاولة مرة أخرى'],
};
fs.writeFileSync('public/offline.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><title>Maison Goya · Offline</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#fff;color:#171717;font:16px/1.7 Arial,sans-serif;padding:24px;box-sizing:border-box}main{max-width:420px;text-align:center}.mark{width:160px;margin:0 auto 36px}.mark svg{display:block;width:100%;height:auto}h1{font:500 28px/1.3 Arial,sans-serif}p{color:#666}button{margin-top:20px;padding:16px 28px;background:#171717;border:0;color:#fff;cursor:pointer;font:inherit}button:focus-visible{outline:2px solid #171717;outline-offset:5px}</style></head>
<body><main><div class="mark">${wordmark}</div><h1 id="heading">${copy.en[0]}</h1><p id="message">${copy.en[1]}</p><button id="retry" onclick="location.reload()">${copy.en[2]}</button><noscript><p lang="fr">${copy.fr[1]}</p></noscript></main>
<script>const copy=${JSON.stringify(copy)};let language='en';try{const saved=JSON.parse(localStorage.getItem('maison-goya:v1')||'{}');language=saved.language||saved.locale||'en'}catch{}if(!copy[language])language='en';document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';['heading','message','retry'].forEach((id,index)=>{document.getElementById(id).textContent=copy[language][index]});</script></body></html>`);
console.log('Offline screen uses the shared Goya wordmark and seven languages.');
