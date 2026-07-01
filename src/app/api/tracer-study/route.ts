import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/tracer-study
 *
 * Menerima data formulir Tracer Study dari klien, lalu meneruskannya ke
 * Google Apps Script Web App yang menulis baris baru ke Google Spreadsheet.
 *
 * URL Web App disimpan di environment variable `TRACER_STUDY_SHEET_URL`
 * (lihat .env.example dan docs/tracer-study-google-sheet.md).
 *
 * Proxy lewat route ini dilakukan agar:
 *  - URL/secret Apps Script tidak terekspos di browser, dan
 *  - tidak ada masalah CORS saat memanggil Apps Script langsung dari klien.
 */

// Daftar field yang diharapkan — sekaligus berfungsi sebagai whitelist.
const FIELDS = [
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
] as const;

export async function POST(req: NextRequest) {
  const sheetUrl = process.env.TRACER_STUDY_SHEET_URL;

  if (!sheetUrl) {
    console.error('TRACER_STUDY_SHEET_URL belum diatur di environment.');
    return NextResponse.json(
      { ok: false, error: 'Konfigurasi server belum lengkap. Hubungi administrator.' },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body tidak valid.' }, { status: 400 });
  }

  // Validasi minimal di server.
  if (!body.namaLengkap || !body.email) {
    return NextResponse.json(
      { ok: false, error: 'Nama lengkap dan email wajib diisi.' },
      { status: 400 }
    );
  }

  // Susun payload bersih + timestamp server.
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };
  for (const key of FIELDS) {
    const value = (body as Record<string, unknown>)[key];
    // Array (mis. kompetensiDigunakan) digabung jadi string agar rapi di satu sel.
    payload[key] = Array.isArray(value) ? value.join(', ') : value ?? '';
  }

  try {
    const res = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Apps Script melakukan redirect (302) ke googleusercontent; ikuti agar
      // mendapat respons akhir.
      redirect: 'follow',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Apps Script merespons error:', res.status, text);
      return NextResponse.json(
        { ok: false, error: 'Gagal menyimpan ke spreadsheet.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Gagal menghubungi Apps Script:', err);
    return NextResponse.json(
      { ok: false, error: 'Tidak dapat terhubung ke layanan penyimpanan.' },
      { status: 502 }
    );
  }
}
