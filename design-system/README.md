# EKSAD Design System

Panduan gaya untuk membuat halaman website EKSAD Technology berikutnya (Our Services, Blog, Career, Contact). Semua aturan di sini diturunkan dari halaman Home (`index.html`) yang sudah disetujui.

## Isi folder

| File | Fungsi |
|---|---|
| `README.md` | Panduan ini: token, komponen, gerak, aturan teks, checklist |
| `styleguide.html` | Referensi visual (warna, tipografi, tombol, ikon, pola section). Buka langsung di browser. |
| `page-template.html` | Kerangka halaman baru: head, header + menu, page hero, satu section contoh, CTA, footer |

Kode sumbernya tetap satu: `assets/css/style.css` dan `assets/js/main.js`. Folder ini tidak punya CSS sendiri, jadi perubahan gaya cukup dilakukan di `style.css` dan otomatis berlaku di semua halaman.

## Struktur: satu file per menu

Setiap menu utama hanya punya satu file HTML: `index.html` (Home), `services.html` (Our Services), lalu `blog.html`, `career.html`. Halaman di dalam satu menu tidak dipisah per file.

- Tiap halaman: `<div class="svc-page" id="kunci" data-title="Judul — EKSAD Technology">…</div>`; selain halaman pertama diberi atribut `hidden`.
- Link ke halaman: `services.html#kunci`. Link ke bagian di dalamnya: `services.html#kunci-bagian`.
- Semua `id` di dalam halaman diberi awalan kunci (`prodms-modules`). `#cta`, `#top`, `#footer` dipakai bersama.
- Router di `main.js` (blok "SUBHALAMAN") menampilkan halaman sesuai hash, mengganti `document.title`, menandai link aktif (`.is-current`), dan menyalakan ulang reveal.

**Menambah halaman ke menu yang sudah ada:** tambahkan satu `.svc-page` baru ke file menu itu, lalu arahkan link dropdown/menu HP/footer ke `file.html#kunci`.

## Membuat file menu baru

1. Salin `design-system/page-template.html` ke root proyek, misalnya `blog.html`.
2. Hapus semua awalan `../` pada atribut `src` dan `href`. Template memakai `../` supaya bisa dipratinjau langsung dari folder ini.
3. Ganti `<title>` dan `<meta name="description">`.
4. Di menu header, pindahkan kelas `is-active` dari link Home ke link halaman tersebut.
5. Ganti isi `.page-hero` (breadcrumb, `h1`, `.lead`), lalu susun section dengan pola di bawah.
6. Biarkan CTA dan footer apa adanya. Keduanya wajib ada di setiap halaman. Tombol ajakan (Start Now, dll.) diarahkan ke `contact.html`.
7. Urutan script di akhir `<body>` jangan diubah: GSAP, ScrollTrigger, `main.js`, Matter.js, `cta-physics.js`.

`main.js` aman dipakai di semua halaman. Setiap fitur hanya aktif bila elemennya ada (carousel hero, showcase produk, nilai, marquee, CTA, footer).

## Prinsip desain

- **Referensi:** BCG (struktur, judul pendek, kartu foto), Nalar (header, ikon beranimasi), Lusion (CTA, gerak), demo GSAP (dropdown, efek).
- **Clean dan profesional:** banyak ruang kosong, sedikit warna, tidak ada dekorasi yang tidak bermakna.
- **Satu garis tepi:** di dalam satu kolom, ikon, judul, teks, dan tombol rata kiri pada garis yang sama.
- **Ritme section:** latar bergantian putih, `.section-tint`, dan `.feature`. Jangan dua section berlatar sama berurutan, kecuali dipisah konten yang jelas.

## Token

Semua token ada di `:root` pada `style.css`. Jangan menulis warna hex baru.

### Warna

| Token | Nilai | Pemakaian |
|---|---|---|
| `--blue` | `#1B5EAB` | Tombol utama, link hover, aksen |
| `--blue-600` | `#174f91` | Variasi biru gelap |
| `--cyan` | `#29B6E8` | Aksen, tombol `.btn-accent`, garis progres |
| `--cyan-200` | `#9fdcf3` | Aksen lembut |
| `--red` | `#E8222E` | Aksen kecil saja (jarum, gembok, potongan logo) |
| `--navy` | `#061a33` | Latar gelap, overlay foto |
| `--navy-2` | `#0b2a52` | Hover tombol utama |
| `--ink` | `#0d1b2e` | Judul dan teks penting |
| `--text` | `#2c3a4d` | Paragraf |
| `--muted` | `#5f6c7f` | Label, meta, teks sekunder |
| `--line` | `#dfe4eb` | Garis pemisah |
| `--tint` | `#f2f5f9` | Latar `.section-tint` |
| `--tint-blue` | `#e6f1fa` | Latar `.feature` |
| (CTA) | `#eef1f8` | Latar CTA stage |

Gradien ikon (didefinisikan sekali di awal `<body>`, dipakai dengan `fill="url(#id)"` atau `stroke="url(#id)"`):

- `#pgBlue`: `#5a9be6` → `#1B5EAB` → `#0e3466`
- `#pgRed`: `#ffb37a` → `#ff6a4d` → `#E8222E`

### Tipografi

| Elemen | Font | Ukuran | Catatan |
|---|---|---|---|
| H1 page hero | Red Hat Display 600 | `clamp(44px, 6.4vw, 92px)` | `.page-hero h1` |
| H2 section | Red Hat Display 600 | `clamp(34px, 4.2vw, 60px)` | default `h2` |
| CTA headline | Red Hat Display 600 | `clamp(46px, 7.4vw, 124px)` | satu baris di desktop |
| H3 / judul kartu | Red Hat Display 600 | 26–48px | |
| Lead / subjudul | Red Hat Text 300 | `clamp(17px, 1.5vw, 21px)` | warna `--ink` |
| Body | Red Hat Text 300 | 16px, line-height 1.6 | warna `--text` |
| Label di kartu | Red Hat Text 600 | 11.5–12px, uppercase, spasi .08em | `.kicker`, `.px-pcat` |
| Tombol | Red Hat Text 600 | 14px, uppercase, spasi .04em | |

### Bentuk dan jarak

- Radius kartu `--r` 18px, radius kecil `--r-sm` 12px, radius tombol 10px.
- Lebar konten maksimal 1200px. Padding samping `.container` memakai `--gutter: clamp(40px, 7vw, 112px)`, jadi ikut melebar sesuai layar (±90px di layar 1280px). HP (≤900px): 20px.
- Padding section 96px atas-bawah (HP 64px).
- Jarak judul ke paragraf di `.sec-intro` 28px, dan `.sec-intro` ke konten 56px.

## Komponen

| Komponen | Kelas | Catatan |
|---|---|---|
| Header | `.site-header`, `.hdr`, `.nav-links`, `.nav-cta` | Transparan, setelah scroll 24px menyusut jadi pil kaca putih. Logo 40px. |
| Dropdown Our Services | `#svcBtn`, `#svcDrop`, `.svc-inner`, `.svc-col` | 3 kolom: Industry, Products, Services. Tanpa kartu tambahan. |
| Menu HP | `#menuPanel`, `.mega` | Layar penuh gaya BCG |
| Page hero | `.page-hero`, `.crumb`, `.lead` | Pembuka halaman dalam |
| Section intro | `.sec-intro`, `.sec-intro-center` | Judul dua frasa + paragraf dua baris, tanpa kicker |
| Tombol | `.btn.btn-primary`, `.btn-accent`, `.btn-sm`, `.u-link` | Panah `<span class="arr">→</span>` |
| Bento foto | `.bento`, `.b-photo-card`, `.b-img` + `img.b-bg` | Foto dengan gradasi navy, teks putih, foto zoom saat hover |
| Showcase daftar + panggung | `.px`, `.px-row`, `.px-panel`, `.px-art` | Hover/klik/otomatis 5 detik, ikon besar + glow warna `--signal` |
| Feature split | `.feature`, `.feature-grid`, `.feature-copy` | Teks kiri, visual kanan |
| Artikel industri: split teks–gambar | `.ind-split` (+ `.ind-split-rev`), `.ind-copy`, `figure.ind-fig` | Foto 4:5, berselang kiri/kanan antar section (contoh: services.html#automotive) |
| Halaman capability (gaya BCG) | `.bcg-hero` (judul, lead, `.bcg-hero-fig` lebar 3,2:1, `.bcg-hero-body`), `.bcg-2col`, `.bcg-statement`, `.bcg-explore` + `a.ex-card` (kartu gaya hero: `.c-img`, `.c-tag`, `.c-panel` kaca yang memanjang saat hover) | Pola halaman industri/layanan; contoh: services.html#automotive |
| Alur bernomor (kartu berjajar) | `.flow-grid` > `.flow-intro` (judul kiri, `.flow-intro-body` kanan) + `.flow-panel` (tanpa latar) di bawahnya, `ol.flow-steps` > `li.flow-step` (`.flow-no`, `h3`, `p`) | Kartu 4:5 (≥1280px; di bawahnya tinggi menyesuaikan teks). Animasi loop: garis progres `.flow-prog` di dasar kartu aktif terisi `--flow-ms` (3,5 dtk), selesai → kartu berikutnya aktif (nomor memantul), panah kartu yang sudah dilewati mengalir; setelah kartu terakhir kembali ke 1. Hover = jeda + pilih kartu; berhenti saat keluar layar (main.js: FLOW STEPS); contoh: Why DMS di services.html#automotive |
| Halaman produk | `.prod-hero` > `.prod-hero-grid` (`.prod-mark` lockup ikon + nama, `h1`, `.lead`, `.prod-actions`, `figure.prod-hero-fig` mockup + glow `--signal`), `.prod-stat` (angka besar biru + keterangan), `.prod-tech` (daftar teknologi dipisah titik), `.px.px-mod` (showcase modul dengan gambar ikon di `.px-art`), `.why-grid` (`.why-fig` foto lengket + `.why-list` 2×2 bernomor tanpa kartu), `.prod-close`. Varian: `.prod-hero-fig.is-photo` / `.is-tall` / `.is-icon`, `.why-list-3` / `.why-list-4` / `.is-titles` + `.why-ico`, `.flow-steps-3` + `.flow-ico`, `.award-list`, `.role-grid` > `.role-card` | Contoh: services.html#prodms, #prohace, #procloud, #protalent, #protect, #prosage |
| Daftar artikel (blog) | `.bl-bar` > `.bl-filter` (pil kategori + jumlah) + `.bl-search` (kolom cari di kanan; judul + kutipan, digabung dengan kategori, Esc = hapus), `.bl-empty`, `.bl-grid` > `a.ex-card.bl-card[data-cat]` (3:4, `.is-low` = kolom turun 60px) | main.js "BLOG"; contoh: blog.html |
| Detail artikel | `article.art` > `.art-hero` (`.art-meta` + `.art-tag`, `h1`, `.art-cover`), `.art-layout` (`.art-aside` lengket: `dl` + Back, `.art-body`: `.art-lede`, `.art-gallery` > `.art-fig`, `.art-fig-wide`) | Contoh: blog.html#coretax |
| Blok produk terkait | `.ind-product`, `.ind-prod-art`, `.ind-prod-copy` | Ikon produk beranimasi + glow, judul, tombol |
| Reveal umum | kelas `.reveal` pada elemen apa saja | Fade-up saat masuk layar, bergiliran (main.js) |
| Nilai (segitiga + orbit) | `.value-field`, `.v-item`, `.v-icon`, `.v-orbit` | Khusus Home |
| Marquee logo | `.marquee`, `.mq-row`, `.mq-track` | 2 baris berlawanan arah, logo abu-abu → berwarna saat hover |
| CTA stage | `.cta-stage`, `.cta-title`, `.cta-btn` | Wajib di setiap halaman, sebelum footer |
| Footer | `.site-footer`, `.f-top`, `.f-grid`, `.f-legal` | Putih polos, tepi atas melengkung saat scroll |

## Ikon

- SVG dengan gradien terang → jenuh → gelap (`#pgBlue` / `#pgRed`), contohnya ikon Optimist dan Reliable.
- Kilau putih transparan (elips, opacity 0.25–0.3) di kiri atas bila bentuknya memungkinkan.
- Sisi gelap (hitam 12% atau warna lebih tua) untuk kesan 3D pada bentuk perisai/kotak.
- Bayangan lembut `drop-shadow(0 10–14px 16–20px rgba(6,26,51,.18–.2))`.
- Melayang pelan: animasi `v-float` 4s (±6px).
- Garis yang sangat tipis (jarum, skala) boleh tetap warna datar.

## Gerak

Semua di `assets/js/main.js` dan otomatis mati bila pengguna memilih *reduced motion*.

| Efek | Parameter |
|---|---|
| Carousel hero | ganti tiap 3 detik, geser 1 detik `cubic-bezier(.65,0,.35,1)`, berhenti saat hover |
| Reveal kartu (About) | clip-path membuka dari inset membulat + naik 120px, foto zoom 1.35 → 1.03, expo.out 1.4s, stagger 0.14s |
| Fade-up teks | y 30–50px → 0, power3.out 0.9s |
| Rol huruf CTA | huruf acak keluar dari mask lalu diganti huruf yang sama, 0.75s, tiap 0.7–1.4 detik |
| Marquee logo | 90px/s, dorongan sesuai kecepatan scroll, hover melambat ke 20% |
| Showcase produk | 5 detik per item, garis progres, ikon digambar ulang |
| Footer bounce | lengkung mengikuti kecepatan scroll, kembali dengan `elastic.out(1.1, 0.25)` 1.6s |
| Hover foto | scale 1.03 → 1.09, 1.2s |

Untuk animasi baru, pakai GSAP + ScrollTrigger (`once: true`, start `top 75%`) dan easing `expo.out` / `power3.out`.

## Aturan teks

- **Bahasa:** judul section dan tombol dalam bahasa Inggris, teks penjelas dalam bahasa Indonesia.
- **Judul:** pendek, dua frasa bergaya BCG ("Built for Growth. Driven by Technology.", "Three Values. One Way We Work.").
- **Subjudul:** dua baris; baris kedua minimal 3–4 kata. Pakai `text-wrap: balance`, atau `pretty` untuk teks tiga baris.
- **Deskripsi panjang** (misalnya di showcase): 2–3 baris penuh, max-width sekitar 520px.
- **Isi harus nyambung** dengan visual di sebelahnya (judul, subjudul, dan tombol satu tema).

## Lakukan / Hindari

| Lakukan | Hindari |
|---|---|
| Judul dua frasa, subjudul dua baris seimbang | Label kecil (kicker) di atas judul section |
| Jarak atas dan bawah konten section sama | Shadow pada kartu |
| Foto asli EKSAD atau Unsplash yang representatif, dengan gradasi navy | Kartu atau kotak di belakang logo |
| Ikon dan teks rata kiri di satu garis tepi | Outline abu-abu tambahan pada efek |
| Pakai ulang header, CTA, dan footer dari template | Gradasi warna-warni pada latar besar |
| Pakai token warna | Hex baru di luar token |

## Checklist sebelum halaman selesai

- [ ] Tidak ada error di console (menu, dropdown, CTA, dan footer berfungsi)
- [ ] `is-active` di menu header sudah pindah ke halaman ini
- [ ] Judul section tanpa kicker, subjudul dua baris seimbang
- [ ] Latar section bergantian, jarak atas dan bawah seimbang
- [ ] Dicek di desktop (1440px), tablet (±1100px), dan HP (±390px)
- [ ] Foto Unsplash baru dicatat (file + fotografer) di `HANDOFF.md`
- [ ] Buka hasilnya: `Start-Process "D:\EKSAD WEB\<halaman>.html"`, lalu Ctrl+F5

## Catatan teknis

- `backdrop-filter` mati bila ancestor diberi `clip-path` atau `opacity`. Pasang animasi pada elemen kaca itu sendiri, atau bersihkan `clip-path` setelah animasi selesai.
- `gsap.quickTo` tidak bekerja untuk `scale` di proyek ini; pakai `gsap.to` dengan `overwrite: 'auto'`.
- Elemen dekorasi yang ditambahkan di antara item dapat menggeser `:nth-child`; pakai `:nth-of-type` bila perlu.
- Gradien SVG `objectBoundingBox` tidak tampil pada garis lurus horizontal/vertikal (tinggi atau lebar 0); pakai `gradientUnits="userSpaceOnUse"`.
- Screenshot headless (Edge) tidak menjalankan transisi CSS/Matter.js dengan normal; verifikasi lewat pengukuran DOM atau paksa keadaan akhir di file tes sementara, lalu hapus.
