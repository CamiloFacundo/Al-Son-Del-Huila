// Toma capturas reales de la app (debe estar encendida en :5173 y :8000)
const { chromium } = require('playwright-core');
const pages = ['/', '/catalogo', '/mapa', '/rutas', '/quiz', '/actividades'];
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.2 });
  await ctx.addInitScript(() => localStorage.setItem('cookieConsent', JSON.stringify({ necessary: true, accepted: true })));
  const p = await ctx.newPage();
  for (const r of pages) {
    await p.goto('http://localhost:5173' + r, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(3500);
    const name = r === '/' ? 'inicio' : r.slice(1);
    await p.screenshot({ path: `capturas/${name}.png` });
    console.log('ok', name);
  }
  await b.close();
})();
