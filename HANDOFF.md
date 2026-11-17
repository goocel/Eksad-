# Handoff — Mockup Website EKSAD Technology

Status per 10 Nov 2026. Untuk melanjutkan pekerjaan di sesi baru: baca file ini, lalu `design-system/README.md`.

## Ringkasan

Mockup redesign website **EKSAD Technology** (PT Tiga Daya Digital Indonesia), menggantikan https://eksad.com/.
Selesai: **Home** (`index.html`), **design system** (`design-system/`), **Our Services** (`services.html`: Automotive + 6 halaman produk), dan **Blog** (`blog.html`: daftar 18 artikel gaya BCG + 3 halaman detail artikel). Detail 15 artikel lain, Career, Contact, halaman Services (SaaS, Managed Services), dan industri selain Automotive belum dibuat.

**Aturan struktur (permintaan user): satu file HTML per menu.** Home = `index.html`, Our Services = `services.html`, nanti Blog = `blog.html`, Career = `career.html`. Halaman di dalam satu menu tidak dipisah per file: tiap halaman adalah `<div class="svc-page" id="kunci" data-title="...">` dan hanya satu yang tampil, dipilih lewat hash (`services.html#prodms`). Router ada di main.js (blok "SUBHALAMAN", generik untuk file mana pun yang punya `.svc-page`). ID di dalam halaman wajib diberi awalan kunci (`prodms-modules`, `prohace-pxTab0`); `#cta`, `#top`, `#footer` dipakai bersama.

- **Teknologi:** HTML/CSS/JS statis, tanpa build tool. Buka `index.html` langsung di browser.
- **Library (CDN, perlu internet):** GSAP 3.12.5 + ScrollTrigger, Matter.js 0.19.0 (cdnjs), Google Fonts.
- **Git:** repo public https://github.com/goocel/Eksad- (remote `origin`, branch `main`). Lihat bagian Git.

## Struktur file

```
index.html                 Home: header, 8 section, footer
services.html              Menu Our Services (satu file): #automotive, #prodms, #prohace, #procloud, #protalent, #protect, #prosage
career.html                Menu Career: struktur mengikuti Whitespace careers (goocel.github.io/Whitespace-website/careers.html): hero 2 kolom (judul, lead satu kalimat; foto about-value.jpg rasio 4:3), Open Roles berlatar navy (filter cari + level, tabel peran → kartu bertumpuk di HP, tombol Apply mailto info@eksad.com), "Don't See Your Role?" (tint), CTA, footer. CSS: blok "career" di style.css (.car-*); JS: blok CAREER di main.js. Lowongan di situs lama belum ada ("Coming Soon"), jadi 3 peran di tabel (Backend Developer, Business Analyst, Project Support Intern) adalah CONTOH dari spesialisasi Protalent dan perlu diganti dengan lowongan asli dari HR. Link Career di header/menu HP index, services, blog → career.html.
contact.html               Menu Contact Us: struktur mengikuti Whitespace contact (goocel.github.io/Whitespace-website/contact.html), isi asli eksad.com/wp/contact/ (Inggris). Hero: judul + lead di kiri (info alamat/telepon/jam kantor dihapus atas permintaan user karena sudah ada di footer), form tint di kanan (Name*, Email*, Phone, Message; tanpa backend, tombol Send Message membuka email ke info@eksad.com, main.js blok CONTACT). Section .feature: foto banner-contactus.jpg (situs lama, assets/img/contact/) + Stay in Touch + 4 keunggulan asli. "4.9 Rating / 309,614 customer reviews" dari situs lama sengaja tidak dipakai (angka templat). coding.jpg (situs lama) diunduh tapi belum dipakai. Semua link Contact Us di header/menu HP → contact.html (tombol header .nav-cta.is-active di halaman ini). CSS: blok contact (.ct-*).
blog.html                  Menu Blog (satu file): #list (daftar + filter #event/#training/#technology), #coretax, #risk-workshop, #alibaba-ai-training
assets/img/blog/           18 foto sampul artikel (768×456, dari situs lama); article/ = foto isi 3 artikel detail (maks 1600px)
design-system/             README.md (panduan), styleguide.html (referensi visual), page-template.html (kerangka halaman baru)
assets/css/style.css       Semua gaya, dipakai semua halaman (token warna di :root, responsif di bagian bawah)
assets/js/main.js          Semua interaksi; tiap fitur hanya aktif bila elemennya ada (aman untuk semua halaman)
assets/js/cta-physics.js   Tumpukan bentuk berbasis fisika di CTA (Matter.js)
assets/img/                Foto hero & About (Unsplash) + eksad-tower.png
assets/img/industry/       Foto halaman industri (auto-showroom, auto-digital, auto-dealer)
assets/img/product/        Aset halaman produk dari situs lama: dms-mockup.png (hero), mod-*.png (6 ikon modul 3D, dipotong 400×400 dari banner 1170×400), dms-assembly.jpg (Why DMS di #prodms, foto perakitan motor di pabrik; menggantikan dms-dealer-stock.jpg yang kini tidak dipakai), dms-logo.png (belum dipakai); phc-* (Prohace: mockup + 4 ikon modul + phc-video.jpg = thumbnail video YouTube jrqKBH9h7q4), pc-* (ProCloud: foto trofi; 4 ikon layanan PNG 3D kini tidak dipakai, diganti ikon SVG `.why-svg`), pt-* (Protalent: orang untuk hero + 12 foto spesialisasi), ptc-cyber.png (ikon perisai hero ProTect), ps-* (ProSAGE: 3 ikon layanan dipotong dari banner + foto dampak). Semua dari situs lama eksad.com.
Product/                   6 kartu logo produk (PNG asli dari user)
Logo Client and Partner/   8 logo klien (logo-csul (1).png = duplikat, belum dihapus)
cropped-logo-eksad-fullcolor-small.png   Logo utama (header 40px, menu, footer)
logo-eksad-white-hires-scaled.png        Logo putih (saat ini tidak dipakai)
```

## Arah desain

Referensi yang dipakai user (beberapa digabung):

| Referensi | Dipakai untuk |
|---|---|
| bcg.com | Gaya keseluruhan, kartu hero dan proporsinya, judul pendek dua frasa |
| nalarx.com | Header, animasi ikon produk |
| GSAP demos: orchestrated-easereverse, proximity-scale-grid, draw-a-path, footer-bounce | Dropdown, efek nilai, segitiga, footer |
| lusion.co | CTA (tumpukan bentuk fisika, huruf ber-rol), marquee logo, reveal kartu |
| bcg.com/capabilities/business-resilience | Layout halaman industri (services.html#automotive) |
| Whitespace (goocel.github.io/Whitespace-website/insights/it-diagnostic.html) | Kartu alur bernomor + panah (Why DMS) |

**Token visual**
- **Warna:** biru `#1B5EAB` / `#1E5BAA`, cyan `#29B6E8`, merah `#E8222E`, navy `#061a33`.
- **Font:** Red Hat Display (judul) dan Red Hat Text (teks) — dipilih pimpinan, Nov 2026. Ganti lewat variabel --serif dan --sans di assets/css/style.css, dan link Google Fonts di setiap halaman.

## Design system (untuk halaman berikutnya)

Folder `design-system/`: `README.md` (token, komponen, gerak, aturan teks, checklist), `styleguide.html` (referensi visual), `page-template.html` (kerangka file menu baru: header, `.page-hero`, section contoh, CTA, footer). Menu baru = salin template ke root lalu hapus awalan `../`. Halaman baru di dalam menu yang sudah ada = tambah `.svc-page` di file menu itu (lihat aturan struktur di atas). `main.js` aman dipakai di semua file.

## Halaman di services.html

- **#automotive** (Industry → Automotive): layout meniru halaman capability BCG (https://www.bcg.com/capabilities/business-resilience) dengan teks asli https://eksad.com/automotive/ (bahasa Inggris). Urutan: hero bertumpuk ala BCG (judul "Automotive Resilience in Times of Uncertainty", intro, foto showroom lebar 3,2:1, lalu teks pembuka bagian The Impact… di kolom sempit), foto + teks (Digital Transformation…), Why DMS: intro 2 kolom lalu 4 kartu bernomor 4:5 berjajar dengan panah di latar putih (ref. Whitespace; animasi loop: garis progres kartu aktif terisi 3,5 dtk lalu pindah ke kartu berikutnya, panah yang dilewati mengalir, kembali ke kartu 1), pernyataan + ProDMS, Explore More (ProDMS/ProSAGE/ProCloud), CTA, footer. Bagian BCG "experts", "insights", dan statistik klien dilewati karena belum ada data EKSAD. Foto: `auto-showroom.jpg` (Unsplash, Kenjiro Yagi), `auto-digital.jpg` (situs lama); `auto-dealer.jpg` (situs lama) saat ini tidak dipakai. Link: dropdown/menu Automotive + kartu hero Automotive di Home → `services.html#automotive`.
- **#prodms** (Products → ProDMS): teks asli https://eksad.com/prodms/ (Inggris). Urutan: hero 2 kolom (lockup ikon ProDMS beranimasi + judul "One Platform. The Entire Dealership." + paragraf asli + Start Now, mockup desktop/mobile di kanan dengan glow), Built on the Cloud (paragraf asli, angka "500+" dari teks asli "capable to serve more than 500 dealers", daftar teknologi), Six Modules (memakai ulang showcase Home `.px`, modifier `.px-mod`; main.js menjalankan semua `.px` di halaman, ikon 3D asli), Why DMS. Why Now. (foto stok dealer lengket di kiri + 4 alasan 2×2 tanpa kartu; isi sama dengan Why DMS di automotive tapi tampilan berbeda), pernyataan penutup + Start Now, Explore More (Automotive/ProSAGE/ProCloud), CTA, footer. Kalimat intro Six Modules ditulis baru (bukan dari situs lama).
- **Halaman produk lain** (teks asli eksad.com, Inggris; judul section bergaya BCG ditulis baru, begitu juga satu kalimat subjudul per section). Semua memakai hero `.prod-hero` (ikon produk beranimasi diambil dari showcase Home) dan Explore More 3 produk terkait.
  - **#prohace:** hero mockup, 6 keunggulan (dari satu kalimat asli), showcase 4 modul (.px-mod), pernyataan, link "Go to Prohace" ke prohace.com. Judul modul "Easy Payroll and Task" di situs lama diubah jadi "Tax" (isi modulnya tentang pajak).
  - **#procloud:** hero foto data center, One Partner. Every Cloud. (nama partner sebagai teks karena gambar logo partner aslinya berkartu + shadow), 4 layanan berikon, Our Awards (foto trofi + 5 penghargaan 2019–2022), penutup dengan tombol WhatsApp asli (wa.me/6285133122557). Heading "Why DMS…" yang salah tempel di situs lama tidak dipakai.
  - **#protalent:** hero foto dua orang, 4 cara membantu, 12 spesialisasi berfoto (.role-grid), Trusted Partner + daftar industri. Salah ketik di situs lama diperbaiki ("recruites", "accross", "variance clients", "Writter").
  - **#protect:** hero ikon perisai 3D, Protect. Monitor. Respond., 6 solusi (UEM, PAM, Bug Bounty, VA, SOC, Antimalware), pernyataan.
  - **#prosage:** hero foto dashboard, tantangan data, alur 3 layanan (.flow-steps-3 + ikon), prinsip (kutipan), dampak (foto), Trust + Capabilities.
  - Semua link produk (dropdown, menu HP, footer, tombol showcase Home, kartu hero Home ProSAGE/ProCloud/ProTect, kartu Explore) sudah ke `services.html#<kunci>`.
## Blog (blog.html)

- Gaya daftar "Our Latest Thinking" BCG (screenshot dari user): grid 4 kolom, kolom 1 & 3 turun 60px (`.is-low` diatur main.js "BLOG", ikut jumlah kolom responsif 4/3/2/1), kartu foto 3:4 (`.ex-card.bl-card`) dengan chip kategori + panel kaca (meta "Article" + tanggal, judul); hover: panel menutupi kartu + kutipan + Read More.
- Filter pil: All 18, Event 17, Training 6, Technology 11, plus kolom Search di kanan (judul + kutipan, digabung dengan kategori, Esc menghapus, pesan "No articles found" bila kosong); bisa lewat hash (`blog.html#training`). Link Event/Training di menu HP, footer, dan kartu hero Home mengarah ke hash ini. Nav "Blog" di semua file → `blog.html`.
- Data dari eksad.com/blog-list dan /category/event, /category/training. Kutipan asli dipersingkat; 5 artikel tanpa kutipan (Maganghub & Planning Cycle di situs lama salah tempel teks TIF XX; HUT RI, TIF XX, ISO kosong) — tidak dikarang.
- **Halaman detail (3 artikel terbaru, permintaan user: "buat 3 aja dulu"):** `#coretax`, `#risk-workshop`, `#alibaba-ai-training`, masing-masing `.svc-page` di blog.html; daftar artikel dibungkus `.svc-page#list`. Gaya artikel BCG: breadcrumb, chip kategori + "Article" + tanggal, judul serif, foto sampul lebar; kolom kiri lengket (Published, Categories → filter, Back to Blog), kolom teks 720px (paragraf pertama serif besar `.art-lede`, foto berpasangan `.art-gallery`); "More from the Blog" (3 kartu `.bcg-explore`). Teks isi asli, tebal (strong) mengikuti situs lama; alt foto ditulis baru.
- 15 kartu lain **masih menuju artikel asli di eksad.com (tab baru)**; bila detailnya dibuat, tambahkan `.svc-page` baru dengan pola yang sama.
- Router: hash yang bukan id elemen (mis. `#training`) kini menampilkan halaman pertama (`#list`), jadi link kategori di artikel dan tombol Back browser kembali ke daftar dengan filter yang benar. Filter blog mengabaikan hash halaman artikel.

- Di situs lama, Manufacturing, Financial Service, Logistics, Public Service belum punya halaman (link `#`).

## Isi Home per section

1. **Header (gaya Nalar):** bar transparan. Setelah scroll 24 px, lebar menyusut 1400→1040 px, tinggi 68→56 px, dan muncul latar kaca putih berbentuk pil.
   - Logo 40 px, menu tengah (Home, Our Services, Blog, Career), tombol pil "Contact Us".
   - **Dropdown "Our Services":** panel kaca putih buram dengan 3 kolom (Industry, Products, Services), baris rapat, tanpa kartu tambahan. Buka dengan `back.out` + item stagger, tutup kebalikannya dengan `power2`. Animasi dipasang di `.svc-inner`, bukan pembungkus, supaya blur tetap jalan. Link Automotive → `services.html#automotive`.
   - **HP:** tombol hamburger membuka menu layar penuh bergaya BCG (`#menuPanel`).
2. **Hero:** satu judul di tengah, lalu carousel berisi 7 kartu foto. Hanya 3 kartu yang terlihat.
   - Proporsi persis BCG: kartu samping 18,5% lebar layar, kartu tengah 30,9%, jarak 6,6%, rasio 3:4, sejajar tengah. Dihitung di `readVars()` pada main.js.
   - Kartu tengah punya chip kategori dan panel kaca (meta + judul). Saat di-hover, panel menutupi kartu dan menampilkan deskripsi + tombol cyan.
   - Carousel jalan otomatis 3 detik (geser 1 detik, ease-in-out lembut), berhenti saat di-hover. Klik kartu samping untuk menggeser.
3. **About:** judul "Built for Growth. Driven by Technology." dan bento grid (foto gedung, Vision, Mission, Value). Vision/Mission/Value berlatar foto Unsplash dengan gradasi navy (`.b-img`). Reveal ala Lusion saat masuk layar: kartu membuka dari clip-path inset + naik, foto zoom-out, teks menyusul (blok "ABOUT BENTO REVEAL").
4. **Products (showcase, tanpa kartu):** daftar 6 produk di kiri (`.px-row`, nama serif besar), panggung di kanan (`.px-panel`: ikon besar + glow warna `--signal`, kategori, judul, deskripsi, Learn More).
   - Hover/klik/panah keyboard mengganti produk; ikon digambar ulang (toggle `data-drawn`). Ganti otomatis tiap 5 detik dengan garis progres di baris aktif; berhenti saat kursor di dalam showcase. JS: blok "PRODUCT SHOWCASE" di main.js.
   - Ikon SVG berwarna dari logo asli (kelas `.p-glyph.p-logo`). Di HP panggung pindah ke atas daftar.
5. **Our Value:** judul "Three Values. One Way We Work.", tombol "Discover Our Culture".
   - Segitiga simetris: Professional di puncak, Optimist kiri bawah, Reliable kanan bawah (item bawah `bottom:0`). Tiap nilai punya deskripsi singkat (`.v-desc`). Efek proximity scale: radius 180 px, skala maksimal 1,4.
   - Orbit (`.v-orbit`): lingkaran luar segitiga yang melewati ketiga ikon (dihitung di JS `placeOrbits`), garis putus-putus berputar pelan + glow di tengah.
   - Segitiga penghubung digambar dan dihapus berulang. Titik sudutnya mengikuti ikon lewat `gsap.ticker`, dan garis di sekitar ikon/label disembunyikan dengan mask.
6. **Clients:** judul rata tengah. Marquee 2 baris (4 logo/baris) berlawanan arah, digerakkan JS: 90px/dtk, dorongan sesuai kecepatan scroll, hover melambat. Logo abu-abu, berwarna saat di-hover, tanpa kartu.
7. **CTA (gaya Lusion):** judul "Let's Grow Together!" (serif besar, satu baris di desktop), kicker, dan tombol "Hubungi Kami". Tanpa tanda +.
   - Huruf judul ber-rol bergantian: huruf acak turun/naik keluar dari mask lalu diganti huruf yang sama (tiap huruf `.ch` > `.ch-in` + salinan via `::before/::after`). Tanpa animasi masuk per huruf.
   - Sekitar 170 bentuk jatuh dan menumpuk: kotak, bingkai, gugus 2×2, dan ikon logo EKSAD berpola "E". Pola E diambil dari logo, ada di `E_GRID`. Kursor membuat efek ombak.
8. **Footer:** putih polos (sudah dicoba navy; user memilih putih), logo berwarna, teks gelap. Tepi atas melengkung sesuai kecepatan scroll; celah cekung diisi warna CTA `#eef1f8` (tanpa outline abu).

## Preferensi user (penting)

- **Bahasa Indonesia** untuk komunikasi.
- **Teks:** judul dan subjudul pendek bergaya BCG. Subjudul dua baris dengan baris kedua tidak terlalu pendek (`text-wrap: balance` sudah aktif).
- **Gaya:** tidak suka label kecil (kicker) di atas judul section, karena sudah dihapus semua. Tidak suka shadow di kartu. Tidak suka kartu/kotak di belakang logo. Tidak suka outline abu tambahan. Kartu foto jangan terlalu membulat (Explore: radius 6px). Jangan blur foto (logo merek/orang dibiarkan).
- **Isi:** konten harus nyambung dengan visual di sebelahnya. Jangan mengarang statistik/angka klien. Halaman industri memakai teks asli eksad.com (bahasa Inggris); belum diputuskan apakah diterjemahkan.
- **Cara kerja:** user sering memberi revisi kecil berturut-turut dengan screenshot, kadang singkat/ambigu: tafsirkan dari screenshot, sebutkan tafsirannya. Setelah selesai, buka hasilnya di browser (`Start-Process "D:\EKSAD WEB\<halaman>.html"`) dan ingatkan Ctrl+F5. User sering bertanya "mana preview": buka lagi dan bawa jendela Chrome ke depan (`WScript.Shell.AppActivate("<judul halaman>")`); untuk anchor pakai `chrome.exe "file:///D:/EKSAD%20WEB/<halaman>.html#id"`.

## Teks dan aset sementara (perlu diganti dengan yang asli)

- Deskripsi produk, teks kartu hero, judul-judul section, dan nomor telepon/alamat (diambil dari eksad.com).
- **Foto hero dari Unsplash (Unsplash License, gratis):**

  | File | Fotografer |
  |---|---|
  | hero-team.jpg | Vitaly Gariev |
  | hero-dashboard.jpg | Apex Virtual Education |
  | hero-datacenter.jpg | Taylor Vick |
  | hero-dealer.jpg | Martin Katler |
  | hero-security.jpg | Towfiqu barbhuiya |
  | hero-training.jpg | Austin Distel |
  | hero-event.jpg | Carlos Gil |
  | about-vision.jpg (skyline malam Jakarta) | Alim (@apyfz) |
  | about-mission.jpg (customer support) | BaljkanN4 (@baljkann4) |
  | about-value.jpg (tim berdiskusi) | Vitaly Gariev (@silverkblack) |
  | industry/auto-showroom.jpg (showroom, ada logo Nissan) | Kenjiro Yagi (@kenji4861) |

  `industry/auto-digital.jpg` dan `auto-dealer.jpg` berasal dari situs lama eksad.com.

  Kredit di footer belum ditambahkan. Sebaiknya nanti diganti dengan foto EKSAD sendiri.
- Ikon produk adalah gambar ulang dari logo, bukan file vektor resmi.
- Link selain anchor di halaman yang sama masih `#`.

## Langkah berikutnya

1. Halaman Industry lain (Manufacturing, Financial Service, Logistics, Public Service): di situs lama belum ada kontennya. Tanyakan user: tulis konten baru atau tunggu konten resmi. Pakai pola #automotive di services.html.
2. Halaman lain: **Services** (SaaS, Managed Services), **Blog**, **Career**, **Contact**. Mulai dari `design-system/page-template.html`; cek struktur halaman eksad.com yang sesuai.
3. Keputusan terbuka: bahasa konten halaman industri (Inggris asli vs terjemahan Indonesia).
4. Hapus duplikat `logo-csul (1).png` (menunggu persetujuan user).
5. Kalau mulai banyak halaman, pertimbangkan memisahkan header/footer ke template atau komponen supaya tidak duplikat (sekarang disalin per halaman).

## Git dan sesi paralel

- Remote: `origin` = https://github.com/goocel/Eksad- (**public**, jadi jangan commit data rahasia). Branch `main` melacak `origin/main`. Commit pertama: 17 Nov 2026.
- Identitas git (lokal, khusus repo ini): `sanusi <sanusi.goocel@gmail.com>`.
- Commit dan push hanya kalau user meminta.
- `.gitignore` sudah mengecualikan `.claude/worktrees/` dan file tes `_t*.html`.
- Sesi paralel sekarang bisa dipakai: `claude -w <nama>`.

## Catatan teknis dan hal yang perlu diwaspadai

- **Screenshot headless:** pakai Edge, contohnya
  `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --screenshot=... --virtual-time-budget=3000`.
  Animasi berbasis CSS transition dan Matter.js tidak berjalan normal di headless. Lebih baik verifikasi ukuran lewat pengukuran DOM (`--dump-dom` + atribut data), atau paksa keadaan akhir dengan CSS sementara di file `_t.html`, lalu hapus filenya.
- **Hindari menyuntik blok CSS lewat skrip `indexOf`/`slice` tanpa pengecekan.** Sebelumnya pernah membuat ~216 baris CSS terduplikasi, dan sudah diperbaiki. Setelah mengedit, cek jumlah aturan seperti `^\.hero\{` = 1.
- `gsap.quickTo` tidak bekerja untuk `scale` di sini. Pakai `gsap.to` dengan `overwrite: 'auto'`.
- `backdrop-filter` mati kalau ada ancestor yang diberi `clip-path` atau `opacity`. Pasang animasi di elemen kaca itu sendiri.
- **Cache browser:** user pernah melihat versi JS lama. Sarankan Ctrl+F5 kalau perubahan tidak terlihat.
- **Edge headless kadang menggantung** (terutama screenshot halaman dengan loop animasi). Selalu bungkus dengan `timeout 50 ...`; kalau exit 124, ulangi.
- **Mengunduh foto Unsplash:** situs/napi Unsplash memblokir curl; cari lewat WebSearch/agen web-fetch untuk mendapat URL `images.unsplash.com/photo-...`, lalu unduh dari CDN (`?w=2000&q=78&fm=jpg`). Python tidak terpasang; olah gambar pakai PowerShell `System.Drawing`.
- **Menyisipkan blok besar ke HTML/CSS:** tulis skrip Node ke scratchpad (hindari backtick/kutip di `node -e` dalam bash).
- `main{display:flow-root}` mencegah margin anak pertama bocor dan mendorong header (header sticky tingginya 0).
- Gradien CSS (`background-image`) tidak bisa ditransisikan; pakai lapisan `::before` + opacity.
- **Reveal di subhalaman:** ScrollTrigger yang dibuat setelah load tidak memanggil `onEnter` untuk elemen yang sudah di layar. Karena itu `initReveal` langsung menganimasikan elemen yang terlihat dan hanya menyerahkan sisanya ke `ScrollTrigger.batch`; dipanggil ulang lewat `pageHooks` setiap halaman berganti (setelah scroll), lalu `ScrollTrigger.refresh()`.
- Di headless Edge, requestAnimationFrame hampir berhenti setelah virtual time; animasi GSAP setelah pindah halaman tampak "macet" di tes. Cek tween-nya ada (`gsap.getTweensOf`), bukan opacity akhirnya.
- `.ind-fig` di HP: `aspect-ratio` + `min-height` memaksa lebar minimal ±427px (meluber); sudah diperbaiki dengan `min-height:0` di ≤900px.
- Sebelumnya `var DUR = 5` milik showcase menimpa `DUR = 1000` milik carousel Home (scope sama), jadi geser carousel 5 ms. Kini showcase dibungkus `forEach` per `.px`, carousel kembali 1 detik.
- **Video pop up (services.html#prohace-advantages):** tombol `[data-video="<id YouTube>"]` (`.vid-card`) membuka overlay layar penuh (main.js: VIDEO POP UP). YouTube menolak embed dari `file://` (Error 153); untuk mencoba video, buka lewat server lokal, mis. `node <scratchpad>/srv.js` lalu `http://localhost:8765/services.html#prohace` (di hosting berjalan normal).
- **ProCloud (services.html#procloud), revisi:** foto hero `.is-photo` kini setinggi kolom teks (berlaku juga di ProSAGE); One Partner = 2 paragraf asli (diringkas dari 3) + ikon ProCloud di tengah dikelilingi 5 logo cloud tanpa lingkaran (`.co-field`, logo simple-icons 9.21.0 di `assets/img/cloud/`, ditempel inline dengan warna merek; proximity scale di main.js CLOUD ORBIT, tanpa garis penghubung); ikon 4 layanan tanpa garis atas (`.why-list li:has(> .why-ico)`); kutipan "Empower your business…" memakai `[data-split]` (kata naik dari mask + garis bawah `.sa-hl` tergambar; main.js KUTIPAN BERANIMASI) dan bisa dipakai di kutipan lain.
- **CTA "Let's Grow Together!" ada di semua halaman** (sempat dihapus dari halaman selain Home, lalu dikembalikan atas permintaan user). Tombol Start Now/Contact our team di services kini ke `contact.html` (bukan `#cta`). Celah lengkung footer (`#fWaveGap`) diwarnai otomatis sesuai latar section terakhir (main.js `syncGap`).
- **Protalent:** section "Trusted Partner for IT Outsourcing…" dihapus (isinya sudah ada di hero).
- **Protalent hero (revisi):** judul 2 baris ("Your IT / Outsourcing Partner", `.pt-hero h1 .nw`), kolom teks lebih lebar. Visual `.pt-fig`: orang (pt-team.png, transparan, terpotong di paha) di depan panel gradien cyan→biru polos; potongan jatuh tepat di tepi bawah panel, kepala menyembul di atas panel; 3 label spesialisasi asli melayang (Backend Developer, UI/UX, DevOps Engineer).
- **Protalent How We Help:** nomor 01–04 diganti ikon SVG bergaya nilai Home (`.why-ico.why-svg`), tanpa garis atas.
- **ProTect Six Solutions:** nomor 01–06 diganti ikon SVG `.why-svg` (laptop+ponsel, pengguna+kunci, serangga+koin, perisai+kaca pembesar, monitor denyut, perisai menghalau virus), tanpa garis atas.
- **ProSAGE Three Services:** ikon 3D PNG (ps-consulting/masterdata/insight) diganti ikon SVG `.flow-svg`; kartu `.flow-steps-3` tidak lagi berrasio 4:5 (tinggi mengikuti isi); jarak judul ke kartu dirapatkan (`.flow-grid > .sec-intro`).
- **ProDMS Why DMS. Why Now.:** nomor 01–04 diganti ikon SVG `.why-svg` (tumpukan kotak, pelanggan+hati, grafik naik, ponsel terhubung), tanpa garis atas.
- **ProSAGE (revisi):** "Rich in Data…" kini 3 tekanan berikon (`.ch-list`) + kartu navy akar masalah (`.ch-root`); "Built on Trust" + "End-to-End Capabilities" digabung jadi satu section navy "Built on Trust. Proven by Results." (`.tr-sec`: ringkasan lengket di kiri + 6 poin berikon). Teks asli diringkas.
- **Ikon 3D → SVG gaya baru (semua halaman produk):** hero ProTect (`.ptc-hero-ico`, menggantikan ptc-cyber.png), 6 modul ProDMS (mod-*.png) dan 4 modul Prohace (phc-*.png) → `.px-mod .mod-svg`. File PNG lama masih ada di assets/img/product tapi tidak dipakai.
- **Home Our Value (revisi ikon):** Optimist = bintang lebih kecil/penuh + sisi gelap + kilau + bintang putih kecil di tengah; Reliable = lingkaran di perisai diganti gembok putih.
- **Blog:** tiap artikel kini punya satu kategori utama (label kartu = kategori): Event 8, Training 5, Technology 5 (sebelumnya semua berlabel Event dengan kategori ganda dari situs lama). Halaman detail Coretax, Risk Workshop, Alibaba AI Training = Training (breadcrumb, art-tag, Categories).
- **Contact hero muat satu layar (desktop ≥901px):** `.ct-hero` min-height 100svh, ukuran judul/form/textarea memakai vh (blok "hero Contact muat satu layar" di style.css). Dicek muat di 1272×654 (layar user, zoom 150%), 1366×672, 1440×792; di layar sangat pendek (<600px) masih sedikit scroll.
- **Automotive Why DMS (kartu alur):** tiap kartu diberi ikon SVG `.flow-ico.flow-svg` (sama dengan ikon Why DMS di ProDMS); semua `.flow-steps` kini tinggi mengikuti isi & sama rata (tanpa rasio 4:5).
- **Automotive Why DMS:** kartu `.flow-steps.is-reasons` = 4 alasan setara, jadi tanpa nomor & panah; ikon di kiri atas. Kartu aktif (garis biru + progres) tetap berganti otomatis. ProSAGE tetap bernomor (alur bertahap).
- **Showcase produk/modul `.px` di HP (≤900px):** daftar jadi baris tab pil yang bisa digeser di ATAS panel (tidak perlu scroll jauh); tab aktif navy + garis progres, baris tab otomatis bergeser ke tab aktif; panel bisa di-swipe kiri/kanan (main.js PRODUCT SHOWCASE). Berlaku di Home, modul ProDMS & Prohace.
- **CTA di HP (≤699px):** tidak lagi min-height 92vh; padding 88/150px (tinggi ±407px, sebelumnya ±741px). Salinan huruf rol CTA dipindah ke ±2em (CSS .ch-in::before/::after + JS dist) agar potongan huruf tidak terlihat di bawah baris saat ber-rol. Section Home lain di HP sudah 64px atas/bawah (dicek).
- **pt-team.png:** lubang transparan (118 px) di telinga pria ditambal warna kulit (skrip fixear.ps1 di scratchpad; file asli dicadangkan sebagai pt-team-original.png di scratchpad sesi).
- **File standalone:** `EKSAD-Website-Standalone.html` (±5,5 MB) = kelima halaman + semua aset tertanam (gambar → WebP, dari 10,4 MB jadi 3,5 MB; font latin; GSAP/ScrollTrigger/Matter.js). Cara membuat ulang: `tools/standalone/README.md`. Buat ulang setiap kali ada revisi halaman.
