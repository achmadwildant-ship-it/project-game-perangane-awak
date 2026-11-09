# Panduan Langkah demi Langkah: Perangane Awak

Urutan dari nol sampai game tayang di web. Kerjakan berurutan. Setiap tahap punya "Selesai jika" sebagai tanda boleh lanjut.

Berkas dalam kit ini: `GAME_SPEC.md` (spesifikasi), `AGENTS.md` (aturan untuk agent Antigravity), `data/vocab.json` (materi 14 kosakata), `data/anchors.json` (templat koordinat titik), dan panduan ini.

> **Catatan bahasa:** semua berkas perintah untuk agent (`MAIN_PROMPT.md`, `GAME_SPEC.md`, `AGENTS.md`, `DECISIONS.md`, `MODEL_REPORT.md`) sekarang berbahasa Inggris agar agent bekerja presisi. Teks yang dilihat siswa tetap bahasa Indonesia dan Jawa. Panduan ini tetap bahasa Indonesia untuk kamu. Prompt per milestone di bawah adalah cadangan; jalur utamanya satu perintah ke `MAIN_PROMPT.md`.

> **Mode otomatis (disarankan):** setelah folder siap, cukup tempel satu perintah ke agent Antigravity: *"Baca MAIN_PROMPT.md lalu kerjakan seluruhnya sesuai instruksinya."* Agent mengerjakan semua fase sendiri dan hanya berhenti di tiga titik pemeriksaan (A, B, C). Tahap-tahap di bawah adalah rincian manual dan cadangan jika kamu ingin mengerjakan per milestone.

---

## Tahap 0. Persiapan alat

1. Pasang **Node.js versi LTS** (dari nodejs.org). Cek di terminal: `node -v` dan `npm -v`.
2. Pasang **Git** (git-scm.com). Cek: `git --version`.
3. Pastikan **Google Antigravity** sudah terpasang dan bisa membuka folder proyek.
4. Buat akun **GitHub** (untuk menyimpan kode) dan **Netlify** (untuk publikasi). Keduanya gratis.
5. Pasang **Blender** (sudah ada) dan siapkan browser Chrome terbaru.

Selesai jika: `node -v`, `npm -v`, `git --version` menampilkan angka versi.

---

## Tahap 1. Siapkan folder proyek

1. Buat folder kosong `perangane-awak`.
2. Salin seluruh isi kit ke dalamnya (cukup ekstrak `perangane-awak-kit.zip`): `GAME_SPEC.md`, `AGENTS.md`, `MAIN_PROMPT.md`, `DECISIONS.md`, `MODEL_REPORT.md`, `PANDUAN_LANGKAH.md`, dan folder `data/` (`vocab.json`, `anchors.json`).
3. **Tambahkan sendiri berkas modelmu**: salin `karakter-wildan-byNesya.glb` ke folder `public/model/`. Nama berkas harus persis seperti itu, karena nama itu dipakai di `src/config.ts` dan `anchors.json`. Jangan diganti nama.
3. Buka folder itu di Antigravity.
4. Di terminal folder itu: `git init`, lalu `git add .` dan `git commit -m "kit awal"`.

Selesai jika: folder berisi berkas-berkas di atas dan ada satu commit.

---

## Tahap 2. Model 3D dari Blender

**Model sudah diperiksa** (lihat `MODEL_REPORT.md`) dan tidak perlu diekspor ulang. Kamu hanya perlu menaruhnya sendiri di `public/model/karakter-wildan-byNesya.glb`. Langkah di bawah hanya dipakai jika kamu mengganti model di kemudian hari:

1. Pilih seluruh bagian model, tekan `Ctrl+A`, pilih **All Transforms**. Skala harus 1 dan rotasi 0.
2. Ukuran sekitar 1,7 sampai 1,8 meter, menghadap depan, berdiri tegak, tangan sedikit terbuka, **bertelanjang kaki**.
3. Cek daftar: telinga, hidung, bibir, jari, lutut, telapak kaki terbentuk jelas; tidak ada lubang atau permukaan menembus; kaos dan celana pendek polos.
4. Ekspor: `File > Export > glTF 2.0`. Format **glTF Binary (.glb)**, Include: Selected Objects, Transform: +Y Up, aktifkan Apply Modifiers dan kompresi Draco. **Matikan animasi.**
5. Cek ukuran berkas di bawah 5 MB. Jika lebih besar: kecilkan tekstur ke 2048 px atau kurangi jumlah segitiga (modifier Decimate).
6. Simpan sebagai `public/model/karakter-wildan-byNesya.glb` di proyek (buat folder `public/model/`).
7. Buka berkas di viewer gratis (gltf-viewer.donmccurdy.com) untuk memastikan tampil baik dari depan, samping, belakang, dan dari dekat.

Selesai jika: `public/model/karakter-wildan-byNesya.glb` ada, di bawah 5 MB, dan tampil benar di viewer. Aplikasi menormalkan ukuran dan pusatnya sendiri. Jika model diganti, posisi titik di `anchors.json` harus diulang lewat editor.

---

## Tahap 3. Putuskan hal yang masih terbuka dan validasi materi

Tabel keputusan ada di `GAME_SPEC.md` bagian 16. Sebelum lanjut jauh, sampaikan ke perancang:

1. **Rujukan kamus** untuk kosakata (K-09).
2. **Racikan dan Ampeyan** apakah memang kaki dan telapak kaki (K-10). Dalam sumber umum, krama inggil kaki biasanya *sampeyan* atau *pada*.
3. Setujui atau ubah default pada K-01 sampai K-08 dan K-11.
4. Minta guru bahasa Jawa memeriksa seluruh `data/vocab.json`: padanan ngoko/krama/krama inggil, pengertian, contoh kalimat, dan teks hint. Semua entri berstatus `perlu_validasi`. Ubah statusnya menjadi `tervalidasi` setelah diperiksa.

Tahap 4 dan seterusnya bisa dikerjakan paralel dengan validasi ini, karena materi dibaca dari berkas data.

Selesai jika: ada daftar keputusan tertulis dan `vocab.json` sudah dikirim ke validator.

---

## Tahap 4. Atur Antigravity

1. Letakkan `AGENTS.md` di akar proyek. Jika Antigravity punya pengaturan Rules, tempelkan isinya di sana juga.
2. Untuk setiap tugas: mulai dengan mode **Planning**, baca rencana (Artifact) yang dibuat agent, beri komentar jika ada yang salah, baru setujui.
3. **Satu milestone per tugas.** Jangan minta "buat seluruh game".
4. Setelah milestone lolos tes, lakukan `git commit`.
5. Jika hasil agent meragukan, minta ia menjelaskan apa yang sudah diuji dan apa yang belum.

---

## Tahap 5. Milestone 1: kerangka proyek

Kirim ke Antigravity:

```
Baca AGENTS.md, GAME_SPEC.md (bagian 17), dan data/vocab.json.
Buat rencana implementasi dulu, tunggu persetujuanku.
Tugas: inisialisasi proyek Vite + TypeScript (strict) + Three.js + Vitest
di folder ini tanpa menimpa berkas yang sudah ada.
Buat struktur folder sesuai GAME_SPEC.md bagian 17, berkas src/config.ts
berisi konstanta di bagian itu, dan tipe data untuk vocab.json dan anchors.json
beserta pemuatnya dengan validasi (14 kosakata, ID unik, anchor_id sesuai).
Tambahkan skrip npm: dev, build, test.
Jangan buat UI atau scene dulu.
```

Selesai jika: `npm run dev` jalan, `npm run test` dan `npm run build` lolos, pemuat data menolak data rusak.

---

## Tahap 6. Milestone 2: logika inti (tanpa tampilan)

```
Baca AGENTS.md dan GAME_SPEC.md bagian 7, 8.2, 8.3, 10, 12.
Buat rencana dulu, tunggu persetujuanku.
Tugas: di src/core/ buat fungsi murni dengan tes Vitest untuk:
1) skor (rumus bagian 12) dan semua kasus uji tabel di bagian 12;
2) pemilihan lima titik (satu benar, empat pengecoh) sesuai algoritma bagian 8.3,
   menerima posisi dari anchors, benih acak, dan config;
   uji untuk tiap dari 14 kata dengan 1.000 benih: lima titik, tepat satu benar,
   ID unik, jarak minimum terpenuhi, minimal dua beda region;
   gunakan posisi percobaan sementara karena anchors.json belum diisi;
3) mesin sesi: pilih kata, jawab benar/salah, penggunaan hint (batas sesi dan batas per kata),
   penyelesaian 14 kata, penyimpanan di sessionStorage, debounce klik.
Jangan buat UI.
```

Selesai jika: semua tes lolos, termasuk tujuh kasus skor.

---

## Tahap 7. Milestone 3: scene 3D dan editor titik

```
Baca AGENTS.md dan GAME_SPEC.md bagian 3 dan 8.
Buat rencana dulu, tunggu persetujuanku.
Tugas: 1) muat public/model/karakter-wildan-byNesya.glb, normalkan dengan rumus di GAME_SPEC.md 3.2
(skala 1.75 / tinggi asli, x dan z dipusatkan, y minimum 0, menghadap +Z), pencahayaan
yang membuat material PBR tampil wajar, latar bersih;
2) kontrol kamera: zoom in/out, rotasi horizontal/vertikal, reset view beranimasi,
batas jarak dan sudut, pan dimatikan, mendukung sentuhan dua jari dan mouse;
3) halaman dev-only /anchor-editor: muat data/anchors.json yang SUDAH berisi posisi awal
perkiraan, tampilkan daftar 14 anchor_id dari vocab.json, pilih satu untuk melihatnya,
klik permukaan model untuk memindahkan titik (koordinat ruang ternormalisasi),
tampilkan semua titik, tombol Unduh anchors.json sesuai format data/anchors.json.
Editor tidak ikut build produksi.
Belum ada UI game.
```

Lalu **kamu** mengisi titiknya:

1. Jalankan `npm run dev`, buka `/anchor-editor`.
2. Titik awal sudah terisi (perkiraan). Periksa satu per satu dan geser yang kurang tepat sesuai tabel penempatan di `GAME_SPEC.md` bagian 8.3. Perhatikan khusus **Ampeyan** (telapak kaki), **Asta** (letakkan di telapak tangan), dan **Pamidhangan** (ujung bahu).
3. Unduh `anchors.json`, timpa `data/anchors.json`, commit.

Selesai jika: model tampil benar, kontrol berfungsi di ponsel dan komputer, `anchors.json` berisi 14 posisi.

---

## Tahap 8. Milestone 4: titik interaktif dan inti game

```
Baca AGENTS.md dan GAME_SPEC.md bagian 7 sampai 12.
Buat rencana dulu, tunggu persetujuanku.
Tugas: pasang logika inti ke scene.
- Daftar 14 kosakata di bagian bawah layar (bergulir mendatar di ponsel),
  kata aktif ditandai, kata selesai bertanda centang.
- Lima titik per kata, label acak A sampai E, area sentuh minimal 48 px,
  pemilihan berdasarkan titik layar terdekat.
- Titik tertutup bagian model: pudar dan tidak bisa diklik (sinar dari kamera).
- Jawaban salah: titik merah + ikon silang, peringatan, poin berkurang, titik nonaktif
  (config NONAKTIFKAN_TITIK_SALAH).
- Jawaban benar: titik hijau + ikon centang, teks sukses, cincin berdenyut,
  kamera berpindah halus ke titik SETELAH benar.
- Tombol bantuan dengan sisa tampil, teks dari vocab.json, aturan bagian 10.
- Panel materi setelah benar: pengertian, ngoko, krama, krama inggil,
  contoh kalimat beserta arti; sembunyikan padanan berstatus perlu_validasi_tinggi.
- Skor dan progres tampil.
Kamera tidak boleh bergerak otomatis sebelum jawaban benar.
```

Selesai jika: satu kata bisa dimainkan dari awal sampai panel materi, di layar ponsel dan komputer.

---

## Tahap 9. Milestone 5: seluruh halaman dan alur

```
Baca AGENTS.md dan GAME_SPEC.md bagian 5, 6, 13, 14.
Buat rencana dulu, tunggu persetujuanku.
Tugas: halaman splash, identitas pemain (validasi nama bagian 6),
beranda (mulai, petunjuk, materi, pengaturan), petunjuk, materi (daftar 14 kata),
pengaturan (suara, ukuran teks, ulang sesi), halaman hasil akhir
(nama, nilai dua desimal, benar, salah, hint terpakai, kategori, pesan apresiasi,
tombol main lagi / beranda). Navigasi satu halaman tanpa muat ulang.
Desain responsif lebar 360 sampai 1280 px, teks terbaca, kontras baik,
tidak hanya mengandalkan warna.
```

Selesai jika: seluruh alur bagian 5 berjalan dari splash sampai hasil akhir.

---

## Tahap 10. Milestone 6: poles, performa, uji

```
Baca AGENTS.md dan GAME_SPEC.md bagian 15, 18.
Buat rencana dulu, tunggu persetujuanku.
Tugas: indikator memuat saat model diunduh, penanganan galat (model gagal dimuat,
data rusak), efek suara opsional (hidup/mati di pengaturan), animasi halus,
audit performa (target 30 fps di ponsel kelas menengah, laporkan jumlah draw call
dan ukuran bundel), skrip tests/check-anchors untuk memastikan anchors.json berisi
14 titik dengan ID sama dengan vocab.json, dan tes alur utama.
Laporkan apa yang sudah dan belum diuji.
```

Uji sendiri di ponsel sungguhan: titik terbaca, sentuhan dua jari lancar, tidak lag, model tampak baik dari semua sudut.

---

## Tahap 11. Milestone 7: AR (opsional, paling akhir)

Kerjakan hanya jika perancang memutuskan perlu AR (K-01) dan semua tahap sebelumnya stabil.

```
Baca AGENTS.md dan GAME_SPEC.md bagian 3.4.
Buat rencana dulu, tunggu persetujuanku.
Tugas: tambahkan mode AR berbasis WebXR immersive-ar. Tombol AR hanya muncul
jika navigator.xr.isSessionSupported('immersive-ar') benar. Penempatan model
pada permukaan datar (hit test), titik dan penilaian memakai logika yang sama.
Jika AR tidak didukung atau gagal, game tetap berjalan penuh di mode 3D layar.
```

Catatan: uji di ponsel Android dengan Chrome. iPhone umumnya tidak mendukung WebXR, jadi mode 3D di layar tetap menjadi mode utama.

---

## Tahap 12. Uji dengan pengguna

1. Minta 3 sampai 5 siswa memainkan game tanpa dibantu. Catat di mana mereka bingung.
2. Perbaiki hal yang paling sering membingungkan (biasanya: titik terlalu kecil, petunjuk kurang jelas).
3. Jika untuk penelitian, lakukan validasi ahli materi dan ahli media sesuai kebutuhanmu.
4. Pastikan validator sudah menandai seluruh `vocab.json` sebagai `tervalidasi`.

---

## Tahap 13. Publikasi

1. `npm run build` lalu periksa folder `dist/` dengan `npm run preview`.
2. **Netlify:** seret folder `dist/` ke halaman Netlify Drop, atau hubungkan repositori GitHub. Tidak perlu pengaturan `base`.
3. **GitHub Pages:** jika alamat `username.github.io/nama-repo`, atur `base: '/nama-repo/'` di `vite.config.ts` sebelum build.
4. Buka alamat publik di ponsel, uji ulang alur lengkap. Pastikan HTTPS aktif.
5. Bagikan tautan ke siswa. Tidak perlu pasang aplikasi.

---

## Jika macet

- **Agent membuat banyak berkas sekaligus atau melenceng:** minta ia berhenti, ulangi dengan satu milestone dan sertakan "baca AGENTS.md".
- **Titik tidak menempel saat model diputar:** minta agent memeriksa bahwa titik dihitung dari koordinat lokal model setelah normalisasi, bukan koordinat layar.
- **Titik bertumpuk di ponsel:** naikkan `MIN_SEPARATION` di `src/config.ts` atau minta zona sentuh dipertegas.
- **Model berat atau lambat:** kecilkan tekstur, kurangi segitiga, pastikan kompresi Draco aktif.
- **Nilai tidak sesuai:** jalankan tes skor; bandingkan dengan tabel di `GAME_SPEC.md` bagian 12.
