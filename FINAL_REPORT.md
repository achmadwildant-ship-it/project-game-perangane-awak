# Laporan Akhir Proyek (Final Report) — Perangane Awak

## 1. Ringkasan Eksekutif
Proyek media pembelajaran interaktif **Perangane Awak** telah selesai dibangun dari awal (*from scratch*) hingga status siap rilis (*publish-ready*) sesuai dengan seluruh panduan dan kriteria kualitas pada `GAME_SPEC.md`, `DECISIONS.md`, dan `MAIN_PROMPT.md`.

Permainan ini menyajikan pengalaman belajar 14 kosakata anggota tubuh dalam bahasa Jawa (*ngoko*, *krama*, dan *krama inggil*) menggunakan model manusia 3D interaktif yang dapat diputar dan diperbesar di peramban web tanpa memerlukan instalasi aplikasi tambahan atau server *backend*.

---

## 2. Yang Telah Dibangun

### A. Arsitektur & Fondasi
- **Stack:** Vite, TypeScript (mode ketat / *strict*), Three.js, dan Vitest.
- **Konfigurasi Terpusat:** Seluruh konstanta dan batas sistem tersimpan dalam `src/config.ts`.
- **Lokalisasi Bahasa:** Seluruh teks siswa berbahasa Indonesia dan kosakata Jawa tersimpan rapi dalam `src/copy.ts` dan `data/vocab.json`.
- **Keamanan Data:** Skema data `vocab.json` dan `anchors.json` divalidasi saat *runtime* (14 kata unik, referensi silang valid, dan batas koordinat riil).

### B. Grafika 3D & Interaksi Model
- **Normalisasi Model 3D:** Model `karakter-wildan-byNesya.glb` dinormalisasi secara otomatis (`scale = 1.75 / tinggi_asli`, terpusat pada sumbu X dan Z, dan telapak kaki berada tepat di atas lantai Y = 0).
- **Pencahayaan PBR Alami:** Kombinasi *HemisphereLight* dan *DirectionalLight* lembut dengan bayangan lantai yang membuat tekstur kulit dan pakaian tampak hidup tanpa kesan gelap atau metalik.
- **Kamera Terkendali:** *OrbitControls* dibatasi secara cerdas (zoom 1.5 s.d. 6.0, rotasi vertikal hingga 25° di bawah garis lantai untuk melihat telapak kaki, dan pan dinonaktifkan). Dilengkapi animasi reset tampilan dan fokus otomatis saat jawaban benar (*anti-leak rule*: kamera tidak pernah bergerak ke jawaban sebelum siswa menjawab benar).
- **Deteksi Oklusi Raycasting:** Titik yang berada di belakang bagian tubuh karakter akan otomatis meredup (*opacity 0.25*) dan tidak dapat diklik.
- **Pemilihan Titik Terdekat (*Nearest-Dot Picking*):** Target sentuhan diperluas hingga minimal 48px untuk kenyamanan jari di layar sentuh.

### C. Logika Permainan & Kurikulum
- **Algoritma Titik Acak (*Distractors*):** Setiap kata memunculkan 5 titik (1 benar dan 4 pengecoh). Titik-titik dipilih dengan jarak minimal 0.15 unit dan minimal 2 titik berasal dari wilayah tubuh (*region*) yang berbeda.
- **Sistem Penilaian:** Skor dihitung sesuai rumus spesifikasi:
  $$N = \max(0, \min(100, (\frac{100}{14} \times B) - 2 \times S))$$
  dengan pembulatan 2 desimal dan 4 kategori (*Sae Sanget*, *Sae*, *Cekap*, *Kedah Sinau Malih*).
- **Bantuan (*Hints*):** Maksimal 3 kali per sesi dan maksimal 1 kali per kata, tanpa mengurangi poin.
- **Panel Pembelajaran:** Menampilkan pengertian, tabel tingkat tutur, dan contoh kalimat berterjemahan Indonesia. Nilai *krama inggil* untuk kata yang belum divalidasi (*Racikan* dan *Ampeyan*) disembunyikan secara otomatis sesuai keputusan K-10.
- **Efek Suara Sintetis:** Efek suara (klik, benar, salah, bantuan) dibuat langsung menggunakan *Web Audio API* tanpa berkas audio eksternal.
- **Penyimpanan Sesi:** Progres siswa tersimpan di `sessionStorage` sehingga permainan tidak hilang saat halaman disegarkan (*reload*).

### D. Alat Bantu Pengembang (Dev-Only Tools)
- `/#anchor-check`: Inspeksi visual 14 titik dari 8 sudut pandang kamera dengan tombol pergeseran (*nudge*).
- `/#anchor-editor`: Penempatan titik langsung dengan mengklik permukaan mesh model 3D dan unduh berkas `anchors.json` baru.
- `/#anchor-verify`: Galeri tangkapan layar 14 titik untuk verifikasi visual cepat.

---

## 3. Yang Telah dan Belum Diuji

### Yang Telah Diuji Secara Otomatis (100% Lulus)
- **45 Pengujian Otomatis (*Unit & Integration Tests*):**
  - Rumus skor pada seluruh 7 kasus uji spesifikasi dan pembatasan batas (0 s.d. 100).
  - Algoritma pemilihan titik pengecoh dengan **14.000 simulasi acak** (1.000 per kata) yang membuktikan seluruhnya memenuhi jarak minimal 0.15 dan keberagaman wilayah tubuh.
  - Alur simulasi penuh 14 kata dari awal hingga akhir permainan termasuk skenario salah dan bantuan.
  - Validasi data JSON dan pencegahan data korup.
  - Uji konsistensi spasial batas koordinat 3D karakter.
- **Kompilasi Produksi (*Build Gate*):** `npm run build` sukses menghasilkan bundel statis `dist/` berukuran ~174 kB (gzipped) tanpa galat TypeScript.

### Yang Belum Diuji Secara Otomatis (Perlu Verifikasi Lapangan)
- Pengujian fisik langsung di berbagai model ponsel cerdas siswa (Android & iOS).
- Respon sentuhan dua jari (*pinch-to-zoom*) pada peramban ponsel lawas.
- Validasi kurikulum bahasa Jawa oleh pakar bahasa daerah.

---

## 4. Masalah Terbuka (*Open Issues*)
Tidak ada masalah teknis yang menghambat (*no blocking issues*). Seluruh spesifikasi berjalan sesuai desain.

---

## 5. Daftar Tugas Khusus Manusia (*Human To-Do List*)

Beberapa hal penting berikut ini berada di luar kendali agen AI dan harus diselesaikan oleh tim pengembang atau guru sebelum dipublikasikan secara luas kepada publik:

1. **Validasi Kosakata dengan Ahli Bahasa Jawa:**
   - Mintalah guru bahasa Jawa untuk memeriksa kembali kosakata *Racikan* (kaki) dan *Ampeyan* (telapak kaki) beserta contoh kalimatnya pada `data/vocab.json`.
   - Jika sudah diverifikasi, ubah `validation_status` menjadi `"validated"` agar teks *krama inggil*-nya dapat ditampilkan kepada siswa.
2. **Konfirmasi Izin Model 3D & Hak Cipta (Keputusan K-13):**
   - Baris kredit model saat ini disembunyikan secara bawaan sesuai keputusan desainer (K-13), dan dapat diaktifkan melalui `SHOW_MODEL_CREDIT` serta `MODEL_CREDIT_NAME` di `src/config.ts`.
   - Pastikan izin tertulis penggunaan model `karakter-wildan-byNesya.glb` dari pembuat aslinya tetap diperoleh sebelum publikasi.
3. **Uji Coba Langsung pada Ponsel Pintar Siswa:**
   - Buka pratinjau web di ponsel Android dan iPhone untuk memastikan ukuran tombol sentuh (minimal 48px) nyaman untuk jemari siswa.
4. **Uji Coba Pembelajaran di Kelas:**
   - Amati interaksi siswa saat memainkan game: apakah mereka mudah mengenali nama bagian tubuh dan memahami cara memutar model 3D.
5. **Publikasi ke Hosting Publik:**
   - Ikuti langkah praktis pada berkas `DEPLOY_GUIDE.md` untuk mengunggah folder `dist/` ke Netlify atau GitHub Pages.

