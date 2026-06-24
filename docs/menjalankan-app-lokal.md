# Menjalankan Aplikasi di Lokal & Mengatasi "Tidak Bisa Connect"

Panduan langkah demi langkah menjalankan app dan memperbaiki saat
`http://localhost:9002` tidak bisa dibuka.

Folder proyek:
`C:\Users\Agung Wahyu Kusuma\Downloads\alumni_hub-F-main\alumni_hub-F-main`

---

## A. Cara Menjalankan App (disarankan: terminal sendiri)

Menjalankan di terminal VS Code sendiri lebih stabil daripada lewat background.

1. Buka terminal di VS Code: menu **Terminal → New Terminal** (atau tekan `` Ctrl+` ``).
2. Pastikan terminal bertipe **PowerShell**.
3. Masuk ke folder proyek (copy-paste persis, termasuk tanda kutip):
   ```powershell
   cd "C:\Users\Agung Wahyu Kusuma\Downloads\alumni_hub-F-main\alumni_hub-F-main"
   ```
4. Jalankan server:
   ```powershell
   npm run dev
   ```
5. Tunggu sampai muncul:
   ```
   ✓ Ready in 1300ms
   - Local: http://localhost:9002
   ```
6. Buka browser ke **http://localhost:9002**
7. Untuk **menghentikan** server: klik di terminal lalu tekan **Ctrl + C**.

> Biarkan jendela terminal ini TETAP TERBUKA selama Anda memakai app.
> Kalau ditutup, server ikut mati.

---

## B. Kalau "Tidak Bisa Connect" / Halaman Tidak Terbuka

Ikuti berurutan. Berhenti begitu app sudah bisa dibuka.

### Langkah 1 — Cek URL & cara akses
- Pastikan membuka **http://localhost:9002** (alamat ROOT).
- JANGAN buka `http://localhost:9002/berita`, `/dashboard`, dst. — itu pasti
  error **404**, karena app ini satu halaman (menu di dalam app, bukan URL).
- Coba juga **http://127.0.0.1:9002**.
- Hard refresh browser: **Ctrl + Shift + R**.

### Langkah 2 — Lihat terminal server
- Kalau terminal `npm run dev` masih terbuka: lihat apakah ada tulisan error
  merah, atau terasa "beku" (tidak ada log baru).
- Tekan **Ctrl + C** untuk menghentikannya, lalu lanjut ke Langkah 3.

### Langkah 3 — Matikan semua proses Node yang nyangkut
Buka terminal PowerShell baru, jalankan:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```
(Tidak muncul apa-apa = berhasil. Pesan "tidak ditemukan" juga tidak masalah.)

### Langkah 4 — Pastikan port 9002 sudah bebas
```powershell
Get-NetTCPConnection -LocalPort 9002 -State Listen -ErrorAction SilentlyContinue
```
- **Tidak ada output** = port bebas → lanjut Langkah 5.
- **Masih ada output** = ulangi Langkah 3.

### Langkah 5 — Jalankan ulang server
```powershell
cd "C:\Users\Agung Wahyu Kusuma\Downloads\alumni_hub-F-main\alumni_hub-F-main"
npm run dev
```
Tunggu **✓ Ready**, lalu buka **http://localhost:9002**.

---

## C. Masalah Lain & Solusi Cepat

| Gejala | Solusi |
| --- | --- |
| `npm : The term 'npm' is not recognized` | Tutup & buka ulang VS Code (biar PATH ke-refresh). Atau jalankan dengan path lengkap: `& "C:\Program Files\nodejs\npm.cmd" run dev` |
| `Error: listen EADDRINUSE :::9002` (port dipakai) | Jalankan Langkah 3 & 4 di atas untuk membebaskan port, lalu `npm run dev` lagi. |
| Halaman 404 saat refresh di `/berita`, `/dashboard` | Normal. Buka root `http://localhost:9002`, lalu pakai menu di dalam app. |
| Halaman blank / putih | Hard refresh **Ctrl+Shift+R**; buka **F12 → Console** lihat error merah. |
| Server jalan tapi tetap tidak bisa connect | Cek apakah ada VPN/firewall yang aktif; coba `http://127.0.0.1:9002`. |
| Habis ubah `.env.local` | WAJIB hentikan (Ctrl+C) lalu `npm run dev` lagi — env hanya dibaca saat start. |

---

## D. Cara Cepat Cek Status Server (opsional)

Di PowerShell:
```powershell
# Apakah port 9002 sedang dipakai server?
Get-NetTCPConnection -LocalPort 9002 -State Listen -ErrorAction SilentlyContinue

# Berapa proses node yang berjalan?
(Get-Process node -ErrorAction SilentlyContinue | Measure-Object).Count
```
Kalau port LISTEN tapi app tetap tidak terbuka selama >1 menit → kemungkinan
server "hang": lakukan Langkah 3–5 (matikan node, jalankan ulang).
