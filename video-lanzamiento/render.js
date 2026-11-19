// Renderiza index.html cuadro a cuadro y lo convierte en MP4 con ffmpeg.
//   node render.js                 → video completo (salida/al-son-del-huila-lanzamiento.mp4)
//   node render.js --stills 3,12   → solo capturas de esos segundos (salida/still-*.jpg)
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const out = path.join(__dirname, 'salida');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const url = 'file:///' + path.join(__dirname, 'index.html').split(path.sep).join('/') + '?render=1';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.ready);
  const dur = await page.evaluate(() => window.DUR);
  const stage = await page.$('#stage');

  if (stillsArg) {
    for (const s of stillsArg.split(',').map(Number)) {
      await page.evaluate(t => window.renderAt(t), s);
      await stage.screenshot({ path: path.join(out, `still-${String(s).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 85 });
    }
    await browser.close();
    return;
  }

  const file = path.join(out, 'al-son-del-huila-lanzamiento.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', file],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(dur * FPS);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const buf = await stage.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`cuadro ${f}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('Listo:', file);
})();
