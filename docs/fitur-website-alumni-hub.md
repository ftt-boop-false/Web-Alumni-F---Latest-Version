# Panduan Fitur Website **Alumni Hub F**
### Portal Alumni Fakultas Teknik dan Teknologi (FTT) IPB University

Dokumen ini menjelaskan **seluruh fitur yang sudah ada** di website Alumni Hub F
secara ringkas dan mudah dipahami untuk **Panitia/Komite Alumni**. Tujuannya agar
panitia tahu apa yang bisa dilakukan website saat ini, siapa yang bisa memakainya,
dan bagian mana yang sudah benar-benar menyimpan data versus yang masih berupa
contoh (prototipe).

> **Cara membaca status data di dokumen ini:**
> - 🟢 **Tersimpan permanen** — data benar-benar masuk ke database (Firebase / Google Sheet) dan tidak hilang.
> - 🟡 **Demo / Prototipe** — fitur sudah bisa dicoba dan tampak berfungsi, tetapi datanya sementara (hilang saat halaman dimuat ulang). Cocok untuk presentasi, belum untuk produksi.

---

## 1. Gambaran Umum

Alumni Hub F adalah portal web untuk menghubungkan alumni FTT IPB (gabungan
Fatemeta, Fateta, dan FTT) dengan sesama alumni, mahasiswa, industri, dan fakultas.
Website ini berjalan sebagai satu halaman (single-page) dengan navigasi di bagian
atas. Pengunjung dapat menjelajah sebagian fitur tanpa login, namun fitur-fitur
utama membutuhkan akun.

**Teknologi inti:**
- **Firebase Authentication** — sistem akun & login (termasuk login dengan Google).
- **Cloud Firestore** — database untuk profil, berita, dan Dana Abadi.
- **Google Spreadsheet** — khusus untuk menampung jawaban Tracer Study.

---

## 2. Akun & Masuk (Login / Daftar) 🟢

Halaman **"Masuk"** memungkinkan pengguna membuat akun dan login.

- **Daftar akun baru** cukup dengan **Nama, Email, dan Password**.
- **Login dengan Google** (satu klik) — informasi publik (nama, email, foto)
  otomatis terisi ke profil.
- Sesi login **bertahan** walau halaman ditutup atau dimuat ulang.

**Pelengkapan profil wajib.** Setelah login pertama kali, muncul **jendela wajib isi**
yang meminta tiga data: **Status** (Alumni / Mahasiswa), **Angkatan**, dan
**Program Studi**. Pengguna tidak bisa memakai fitur lain sebelum mengisinya.
Ini menjaga agar data alumni tetap lengkap. (Administrator dikecualikan.)

---

## 3. Beranda (Halaman Utama)

Halaman pertama yang dilihat pengunjung. Berisi:
- **Hero / sambutan** dengan tombol yang menyesuaikan kondisi: "Masuk Portal Alumni"
  bila belum login, atau "Buka Dashboard" bila sudah login.
- **Statistik ringkas** (jumlah alumni, loker aktif, kolaborasi riset, serapan kerja).
  *Catatan: angka ini masih contoh untuk tampilan.*
- **Berita Terkini** 🟢 — menampilkan 3 berita terbaru yang benar-benar diambil dari
  database. Klik untuk membuka halaman Berita.
- **Fitur Utama** — kartu pintasan yang mengarahkan ke tiap halaman (Career Hub,
  Expert Registry, Tracer Study, Forum Riset, AlumniConnect, Dashboard).
- **Ajakan bergabung** untuk pengunjung yang belum mendaftar.

---

## 4. Dashboard & Profil Alumni 🟢

Pusat data pribadi setiap pengguna. Setelah login, pengguna selalu diarahkan ke sini.

**Kartu profil** menampilkan foto, nama, dan tag "Status – Angkatan"
(contoh: *Alumni – 57*), program studi, email, WhatsApp, dan posisi pekerjaan.

**Informasi yang bisa diisi & diedit sendiri oleh pengguna:**
- Nama lengkap (dapat diubah)
- Upload **foto profil** (otomatis diperkecil agar ringan)
- Status (Alumni / Mahasiswa) dan Angkatan
- Program Studi (pilihan dropdown)
- Nomor WhatsApp
- Tempat, tanggal lahir
- Domisili
- Tempat bekerja saat ini
- Posisi / jabatan saat ini

Semua perubahan **tersimpan permanen** di database dan menjadi data resmi alumni.

---

## 5. Berita Alumni 🟢

Halaman **"Berita"** menampilkan kabar terbaru dari fakultas dan alumni.

**Untuk semua pengunjung:** membaca daftar berita, membuka artikel lengkap beserta
gambar (gambar ditampilkan utuh, tidak terpotong).

**Untuk Administrator:** kelola berita sepenuhnya —
- **Tambah** berita baru (judul, kategori, penulis, ringkasan, isi, tag)
- **Edit** dan **Hapus** berita
- **Upload gambar** untuk setiap berita
- **Impor contoh** berita untuk mengisi tampilan awal

Seluruh berita tersimpan permanen, sehingga berita yang diterbitkan admin langsung
tampil ke semua pengunjung dan di Beranda.

---

## 6. Career & Connect (Career Hub + AlumniConnect) 🟡

Satu menu navigasi berisi **dua tab**: lowongan kerja dan forum diskusi.

### a. Career Hub — Bursa Kerja
- Daftar lowongan kerja dengan pencarian dan filter (Full-time, Magang, Freelance).
- Detail lowongan: deskripsi, persyaratan, gaji, tenggat, cara melamar.
- **Alumni** dapat **memposting lowongan** (menunggu persetujuan admin).
- **Administrator** dapat **menyetujui / menolak** lowongan yang masuk.
- Pengguna dapat **melamar** melalui portal atau tautan eksternal.

### b. AlumniConnect — Forum & Networking
- Forum diskusi berdasarkan kategori (Rekrutmen, Mitra Bisnis, Cari Supplier,
  Kolaborasi Riset, dll.).
- Membuat thread, membalas (termasuk balasan bertingkat), menyukai, dan
  menandai "jawaban terbaik".
- **Pesan langsung (DM)** antar pengguna dan tampilan profil singkat.
- Pelaporan konten dan panel moderasi.

> ⚠️ **Status: Demo.** Kedua fitur ini sudah berfungsi penuh untuk diperagakan,
> tetapi data lowongan, thread, dan pesan **bersifat sementara** dan akan kembali
> ke contoh awal saat halaman dimuat ulang. Perlu pengembangan lanjutan agar
> tersambung ke database.

---

## 7. Tracer Study 🟢

Formulir survei alumni yang **tersambung ke Google Spreadsheet**.

- Formulir bertahap **5 bagian**: Data Pribadi, Status Pekerjaan, Relevansi
  Kurikulum, Kompetensi, serta Saran & Umpan Balik.
- Memiliki indikator kemajuan, validasi isian wajib, dan skala penilaian 1–5.
- Setiap jawaban yang dikirim **otomatis tercatat ke Google Sheet** fakultas
  sehingga dapat langsung diolah panitia/akademik.

Fitur ini ditujukan bagi alumni yang lulus dalam 5 tahun terakhir dan membantu
evaluasi serta pengembangan kurikulum FTT IPB.

---

## 8. Dana Abadi (Endowment Fund) 🟢

Halaman penggalangan dana abadi fakultas, dengan prinsip transparansi.

**Untuk donatur (termasuk tanpa akun):**
- **Siapa pun dapat berdonasi** — tidak wajib login.
- Pilih jenis kontribusi (Donasi / Wakaf Tunai) dan tujuan dana
  (Beasiswa, Riset & Inovasi, atau Dana Abadi Umum).
- Isi jumlah (dengan pilihan nominal cepat), nama (bisa **anonim**), dan pesan.
- Setiap kontribusi tercatat dengan status **"Menunggu Konfirmasi"**.

**Transparansi publik:**
- Statistik total pokok terhimpun dan jumlah kontribusi terkonfirmasi.
- Progres per program dana.
- **Dinding Donatur** menampilkan kontribusi yang sudah dikonfirmasi.

**Untuk Administrator:**
- Panel verifikasi untuk **mengonfirmasi** atau **menghapus** kontribusi yang masuk.
- Hanya kontribusi terkonfirmasi yang dihitung ke total dan tampil di dinding donatur.

---

## 9. Fitur yang Masih Dalam Pengembangan

| Fitur | Status | Keterangan |
| --- | --- | --- |
| **Expert Registry** | 🟡 Placeholder | Menu sudah ada, halaman masih berupa penanda "dalam pengembangan". |
| **Forum Riset** | 🟡 Demo | Ruang kolaborasi riset sudah bisa diperagakan, data masih sementara. |
| **Career Hub & AlumniConnect** | 🟡 Demo | Berfungsi penuh untuk demo, belum tersambung ke database. |

---

## 10. Peran Pengguna (Ringkasan Hak Akses)

| Peran | Hak |
| --- | --- |
| **Pengunjung (belum login)** | Lihat Beranda, Berita, Dana Abadi, dan berdonasi. |
| **Alumni / Mahasiswa (login)** | Semua di atas + Dashboard/Profil, Tracer Study, posting lowongan, ikut forum. |
| **Administrator** | Semua di atas + kelola Berita (tambah/edit/hapus), setujui/tolak lowongan, dan verifikasi Dana Abadi. |

> Akun administrator saat ini: **fakultasteknikteknologi@gmail.com**.

---

## 11. Ringkasan untuk Panitia

**Sudah siap dipakai sungguhan (data permanen):**
- Akun & login (termasuk Google)
- Profil & Dashboard alumni
- Berita (dengan pengelolaan oleh admin)
- Tracer Study (ke Google Sheet)
- Dana Abadi / Endowment Fund (donasi terbuka + verifikasi admin)

**Sudah bisa diperagakan, perlu pengembangan lanjutan:**
- Career Hub (bursa kerja)
- AlumniConnect (forum & pesan)
- Forum Riset
- Expert Registry

Dengan kondisi ini, website sudah dapat digunakan untuk **registrasi alumni,
publikasi berita, survei tracer study, dan penggalangan Dana Abadi** secara nyata,
sementara fitur komunitas (loker & forum) dapat dilanjutkan pengembangannya pada
tahap berikutnya.
