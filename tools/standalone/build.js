// Membangun EKSAD-Website-Standalone.html: semua halaman + aset (gambar WebP, CSS, JS, library, font) dalam satu file.
const fs = require('fs');
const path = require('path');
const root = 'D:/EKSAD WEB/';
const SA = __dirname;
const V = path.join(SA, 'vendor');
const OUT = process.argv[2];
const pages = ['index.html', 'services.html', 'blog.html', 'career.html', 'contact.html'];
const images = JSON.parse(fs.readFileSync(path.join(SA, 'images.json'), 'utf8'));

// ---------- tabel aset bersama (disimpan sekali, dirujuk token \u0001N\u0001) ----------
const assets = [], idx = new Map();
const tok = (key, val) => { if (!idx.has(key)) { idx.set(key, assets.length); assets.push(val); } return '\u0001' + idx.get(key) + '\u0001'; };

// font: hanya subset latin
const fcss = fs.readFileSync(path.join(V, 'fonts.css'), 'utf8');
const blocks = fcss.split(/(?=\/\* [a-z-]+ \*\/)/).filter(b => b.startsWith('/* latin */'));
// variable font: satu file per keluarga -> satu @font-face dengan rentang ketebalan
const fam = new Map();
for (const b of blocks) {
  const url = b.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const family = b.match(/font-family:\s*'([^']+)'/)[1];
  const w = +b.match(/font-weight:\s*(\d+)/)[1];
  const range = b.match(/unicode-range:\s*([^;]+);/)[1];
  const f = fam.get(family) || { url, min: w, max: w, range };
  f.min = Math.min(f.min, w); f.max = Math.max(f.max, w); fam.set(family, f);
}
let fontCss = '';
for (const [family, f] of fam) {
  const b64 = fs.readFileSync(path.join(V, 'fonts', path.basename(f.url))).toString('base64');
  fontCss += `@font-face{font-family:'${family}';font-style:normal;font-weight:${f.min} ${f.max};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${f.range}}\n`;
}
const esc = s => s.replace(/<\/(script|style)/gi, '<\\/$1');
const css = fs.readFileSync(root + 'assets/css/style.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
const jsFiles = {
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js': path.join(V, 'gsap.min.js'),
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js': path.join(V, 'ScrollTrigger.min.js'),
  'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js': path.join(V, 'matter.min.js'),
  'assets/js/main.js': root + 'assets/js/main.js',
  'assets/js/cta-physics.js': root + 'assets/js/cta-physics.js',
};

// skrip navigasi antarhalaman: halaman tujuan diingat lewat window.name lalu file dimuat ulang
const navShim = (cur) => `<script>(function(){var CUR=${JSON.stringify(cur)};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
var m=(a.getAttribute('href')||'').match(/^(index|services|blog|career|contact)\\.html(#.*)?$/);if(!m)return;
var p=m[1]+'.html',h=m[2]||'';e.preventDefault();e.stopPropagation();
if(p===CUR){if(h){if(location.hash===h){var t=document.getElementById(h.slice(1));if(t)t.scrollIntoView();}else location.hash=h;}else window.scrollTo(0,0);return;}
window.name='eksad-page:'+p;history.replaceState(null,'',location.pathname+location.search+h);location.reload();},true);})();<\/script>`;

const pageData = {};
for (const p of pages) {
  let h = fs.readFileSync(root + p, 'utf8');
  h = h.replace(/<link rel="preconnect"[^>]*>\s*/g, '');
  h = h.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<style>' + tok('font-css', fontCss) + '</style>');
  h = h.replace(/<link rel="stylesheet" href="assets\/css\/style\.css">/, '<style>' + tok('style.css', esc(css)) + '</style>');
  h = h.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    if (!jsFiles[src]) throw new Error(p + ': unknown script ' + src);
    return '<script>' + tok(src, esc(fs.readFileSync(jsFiles[src], 'utf8'))) + '</script>';
  });
  h = h.replace(/(src|href)="([^"#?]+\.(?:png|jpe?g|webp|gif))"/gi, (m, attr, f) => {
    if (/^https?:/.test(f)) return m;
    const im = images[f];
    if (!im || im.err) throw new Error(p + ': image not converted ' + f);
    return attr + '="' + tok('img:' + f, im.d) + '"';
  });
  h = h.replace('</head>', navShim(p) + '\n</head>');
  const left = h.match(/(?:src|href)="(?!https?:|#|mailto:|tel:|data:|\u0001|(?:index|services|blog|career|contact)\.html)[^"]+"/g);
  if (left) throw new Error(p + ': unresolved ' + left.slice(0, 5).join(', '));
  pageData[p] = h;
}

const J = o => JSON.stringify(o).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
const shell = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EKSAD Technology</title>
<!-- EKSAD Technology — mockup website (standalone). Semua halaman, gambar (WebP), CSS, JS, library & font tertanam di file ini.
     Navigasi antarhalaman memuat ulang file ini dengan halaman tujuan (diingat lewat window.name). -->
</head>
<body>
<script>
var EKSAD_ASSETS=${J(assets)};
var EKSAD_PAGES=${J(pageData)};
(function(){
  var p=(window.name||'').indexOf('eksad-page:')===0?window.name.slice(11):'index.html';
  if(!EKSAD_PAGES[p])p='index.html';
  var html=EKSAD_PAGES[p].replace(/\\u0001(\\d+)\\u0001/g,function(m,i){return EKSAD_ASSETS[+i];});
  EKSAD_PAGES=null;
  document.open();document.write(html);document.close();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(OUT, shell);
console.log('pages', pages.length, 'assets', assets.length, 'size', (fs.statSync(OUT).size / 1048576).toFixed(2) + 'MB');
