# Menghubungkan Tracer Study ke Google Spreadsheet

Formulir Tracer Study (`src/components/views/TracerStudyView.tsx`) mengirim data ke
route `POST /api/tracer-study` (`src/app/api/tracer-study/route.ts`). Route tersebut
meneruskan data ke sebuah **Google Apps Script Web App**, yang menulis satu baris
baru ke Google Spreadsheet setiap kali ada alumni mengisi formulir.

```
Browser (form) ──POST──▶ /api/tracer-study ──POST──▶ Apps Script ──▶ Google Sheet
```

Keuntungan pola ini: URL Apps Script tidak terekspos di browser, dan tidak ada
masalah CORS.

---

## Langkah 1 — Buat Spreadsheet

1. Buka <https://sheets.google.com> dan buat spreadsheet baru, misalnya
   **"Tracer Study Alumni FTT"**.
2. Biarkan saja sheet pertama (default `Sheet1`). Script di bawah akan otomatis
   membuat baris header pada pengisian pertama.

## Langkah 2 — Tambahkan Apps Script

1. Di spreadsheet, klik menu **Extensions → Apps Script**.
2. Hapus kode contoh, lalu tempel kode berikut:

```javascript
// Nama sheet tujuan. Ganti bila ingin pakai tab lain.
const SHEET_NAME = 'Sheet1';

// Urutan kolom di spreadsheet (harus sama dengan field yang dikirim API).
const HEADERS = [
  'timestamp',
  'namaLengkap',
  'programStudi',
  'angkatan',
  'tahunLulus',
  'email',
  'telepon',
  'statusPekerjaan',
  'waktuPekerjaan',
  'lamaBekerjaSaatIni',
  'namaPerusahaan',
  'jabatan',
  'sektor',
  'sektorLain',
  'kesesuaianBidang',
  'relevansiKurikulum',
  'matakuliahBerguna',
  'matakuliahKurangRelevan',
  'kompetensiTidakDiperoleh',
  'porsiPraktik',
  'komentarPraktik',
  'softSkill',
  'kesiapanKerja',
  'kompetensiDigunakan',
  'kompetensiLain',
  'ikutPelatihan',
  'detailPelatihan',
  'kontribusiPendidikan',
  'topikBaru',
  'bersediaNarasumber',
  'saranLain',
];

function doPost(e) {
  // Kunci agar dua pengiriman bersamaan tidak saling menimpa.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // Tulis header bila sheet masih kosong.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    const row = HEADERS.map(function (key) {
      return data[key] !== undefined && data[key] !== null ? data[key] : '';
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

3. Klik ikon **Save** (💾).

## Langkah 3 — Deploy sebagai Web App

1. Klik **Deploy → New deployment**.
2. Klik ikon gerigi **Select type → Web app**.
3. Isi:
   - **Description**: `Tracer Study endpoint` (bebas)
   - **Execute as**: **Me** (akun Anda)
   - **Who has access**: **Anyone**  ← penting, agar server bisa memanggil.
4. Klik **Deploy**, lalu **Authorize access** dan izinkan akses ke spreadsheet.
5. Salin **Web app URL** (berakhiran `/exec`).

> Setiap kali Anda mengubah kode script, buat **New deployment** lagi (atau
> **Manage deployments → Edit → Version: New version**) supaya perubahan aktif.

## Langkah 4 — Pasang URL di aplikasi

1. Di root proyek, salin `.env.example` menjadi `.env.local`.
2. Isi nilainya dengan URL dari Langkah 3:

   ```
   TRACER_STUDY_SHEET_URL=https://script.google.com/macros/s/AKfycb..../exec
   ```

3. Jalankan ulang server dev (`npm run dev`) agar env terbaca.

   Untuk produksi (Firebase App Hosting), set variabel yang sama di
   `apphosting.yaml` atau melalui konsol App Hosting sebagai secret/env var.

## Langkah 5 — Uji

1. Buka aplikasi, masuk ke menu **Tracer Study**, isi formulir sampai selesai,
   klik **Kirim Respons**.
2. Cek spreadsheet — harus muncul satu baris baru beserta timestamp.

### Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| Toast "Konfigurasi server belum lengkap" | `TRACER_STUDY_SHEET_URL` belum diisi / server belum di-restart. |
| Toast "Gagal menyimpan ke spreadsheet" | Deployment Apps Script tidak ber-access **Anyone**, atau URL salah (harus `/exec`, bukan `/dev`). |
| Data tidak masuk tapi tidak ada error | Anda mengubah script tapi belum buat **New version/deployment**. |
| Kolom bergeser | Urutan `HEADERS` di script harus sama dengan daftar `FIELDS` di `route.ts`. |
