# Panduan Publikasi (Deployment Guide) — Perangane Awak

Aplikasi web **Perangane Awak** dirancang sebagai *Single Page Application* (SPA) berbasis web statis murni tanpa server (*backend*) dan tanpa basis data (*database*). Hasil kompilasi berupa folder `dist/` yang siap diunggah ke layanan hosting web statis mana pun.

---

## Opsi 1: Publikasi Cepat ke Netlify (Metode Drag & Drop)
Ini adalah cara termudah dan tercepat tanpa memerlukan pengaturan Git.

1. Buka terminal proyek dan jalankan perintah:
   ```bash
   npm run build
   ```
2. Pastikan folder `dist/` telah terbentuk di dalam folder proyek Anda.
3. Buka peramban dan masuk ke akun [Netlify Drop](https://app.netlify.com/drop).
4. Tarik (*drag & drop*) seluruh folder `dist/` ke kotak unggah di halaman Netlify.
5. Netlify akan langsung memberikan tautan URL publik (contoh: `https://perangane-awak-xyz.netlify.app`).
6. Selesai! Aplikasi sudah dapat diakses langsung oleh siswa melalui ponsel atau komputer.

---

## Opsi 2: Publikasi Otomatis via Netlify (Terkoneksi Git)
Jika repositori Anda sudah diunggah ke GitHub/GitLab:

1. Masuk ke [Netlify](https://app.netlify.com/) dan pilih **Add new site** > **Import an existing project**.
2. Pilih repositori `perangane-awak`.
3. Netlify akan secara otomatis mendeteksi berkas `netlify.toml` yang sudah kami sediakan:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Klik **Deploy site**. Setiap kali ada *commit* baru di cabang utama (*master/main*), Netlify akan otomatis memperbarui situs web.

---

## Opsi 3: Publikasi ke GitHub Pages
Jika Anda ingin menghosting proyek ini di GitHub Pages (contoh: `https://username.github.io/perangane-awak/`):

1. **Atur Base Path:**
   Karena GitHub Pages menggunakan subfolder nama repositori, buat berkas build dengan variabel `VITE_BASE`:
   ```bash
   $env:VITE_BASE="/perangane-awak/"  # Di Windows PowerShell
   npm run build
   ```
   *(Ganti `perangane-awak` dengan nama repositori GitHub Anda jika berbeda)*.

2. **Deploy ke Branch `gh-pages`:**
   Anda dapat menggunakan package pembantu `gh-pages`:
   ```bash
   npx gh-pages -d dist
   ```
3. Buka repositori di GitHub, masuk ke tab **Settings** > **Pages**, pastikan sumbernya mengarah ke branch `gh-pages`.
4. Situs web Anda akan aktif dalam beberapa menit.

---

## Persyaratan HTTPS
Peramban modern mengharuskan protokol aman **HTTPS** untuk menjalankan fitur grafis WebGL dan API sentuh layar dengan performa penuh. Baik Netlify maupun GitHub Pages telah menyediakan sertifikat SSL gratis secara otomatis.
