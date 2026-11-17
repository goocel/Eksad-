# Build file standalone (satu HTML berisi semua halaman + aset)

Hasil: `EKSAD-Website-Standalone.html` di root proyek (±5,5 MB). Gambar dikompres ke WebP, font subset latin, GSAP/ScrollTrigger/Matter.js ditanam.
Navigasi antarhalaman: file memuat ulang dirinya dengan halaman tujuan (diingat lewat `window.name`); hash (#prodms, #coretax, …) tetap berfungsi.

Langkah (Git Bash, dari root proyek; perlu Node + Microsoft Edge):
1. Jalankan server lokal di root proyek pada port 8765 (mis. `npx http-server -p 8765` atau skrip server sederhana).
2. `node tools/standalone/mkconv.js` → membuat `_conv.html` (konverter WebP).
3. `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --virtual-time-budget=60000 --dump-dom http://localhost:8765/_conv.html > tools/standalone/conv-dump.html`, lalu ambil isi `<pre id="out">` (decode &quot; dst.) ke `tools/standalone/images.json`; hapus `_conv.html`.
4. `node tools/standalone/build.js "EKSAD-Website-Standalone.html"`

Catatan: video YouTube (Prohace) tidak bisa diputar saat file dibuka dari folder lokal (batasan YouTube, Error 153); berjalan normal bila file di-hosting.
