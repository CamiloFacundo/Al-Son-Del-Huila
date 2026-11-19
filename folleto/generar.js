// Genera el PDF del folleto (2 hojas A4 horizontales) y una vista previa PNG de cada cara.
//   node folleto/generar.js
const { chromium } = require('../video-lanzamiento/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');


(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2.5 });
  await p.goto('file:///' + path.join(__dirname, 'index.html').split(path.sep).join('/'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);

  const out = path.join(__dirname, 'salida');
  fs.mkdirSync(out, { recursive: true });
  await p.pdf({ path: path.join(out, 'folleto-al-son-del-huila.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });

  await p.addStyleTag({ content: '.sheet{margin:0!important;box-shadow:none!important}' });
  const sheets = await p.$$('.sheet');
  await sheets[0].screenshot({ path: path.join(out, 'folleto-exterior.png') });
  await sheets[1].screenshot({ path: path.join(out, 'folleto-interior.png') });
  await b.close();
  console.log('Listo en', out);
})();
