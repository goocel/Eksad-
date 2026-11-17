// Membuat halaman konverter (dibuka lewat server lokal) yang mengompres semua gambar ke WebP via canvas.
const fs = require('fs');
const root = 'D:/EKSAD WEB/';
const pages = ['index.html', 'services.html', 'blog.html', 'career.html', 'contact.html'];
const imgs = new Set();
for (const p of pages) {
  const c = fs.readFileSync(root + p, 'utf8');
  for (const m of c.matchAll(/(?:src|href)="([^"#?]+\.(?:png|jpe?g|webp|gif))"/gi)) if (!/^https?:/.test(m[1])) imgs.add(m[1]);
}
const maxW = f => {
  if (/industry\/auto-showroom|contact\/banner/.test(f)) return 1600;
  if (/blog\/article\//.test(f)) return 1200;
  if (/blog\//.test(f)) return 800;
  if (/product\/pt-(?!team)/.test(f)) return 600;
  if (/pt-team/.test(f)) return 700;
  if (/Logo%20Client|cropped-logo/.test(f)) return 400;
  if (/eksad-tower/.test(f)) return 900;
  if (/mockup/.test(f)) return 1100;
  return 1200;
};
const list = [...imgs].map(f => ({ f, w: maxW(f), alpha: /\.png$/i.test(f) }));
const html = `<!doctype html><html><body><pre id=out></pre><script>
var L=${JSON.stringify(list)},res={},done=0;
L.forEach(function(it){
  var im=new Image();
  im.onload=function(){
    var s=Math.min(1,it.w/im.naturalWidth),w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
    var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);
    res[it.f]={d:c.toDataURL('image/webp',it.alpha?0.86:0.8),w:w,h:h,ow:im.naturalWidth};
    if(++done===L.length)document.getElementById('out').textContent=JSON.stringify(res);
  };
  im.onerror=function(){res[it.f]={err:1};if(++done===L.length)document.getElementById('out').textContent=JSON.stringify(res);};
  im.src='/'+it.f;
});
</script></body></html>`;
fs.writeFileSync(root + '_conv.html', html);
console.log(list.length, 'images');
