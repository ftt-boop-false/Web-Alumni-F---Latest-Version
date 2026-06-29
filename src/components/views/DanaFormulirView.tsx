"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, FileText, GraduationCap, HandCoins, Landmark, Upload } from 'lucide-react';

/**
 * Halaman Formulir Dana Abadi (dibuka dari tombol "Donasi Sekarang").
 * Pendekatan #1 (Google Drive, tanpa Firebase Storage / tanpa billing):
 *  - Pratinjau & unduh formulir KOSONG dari Google Drive (pakai fileId).
 *  - Unggah formulir TERISI ke folder Google Drive resmi (uploadFolderId).
 *
 * Cara mengisi tautan:
 *  - fileId: ID file Google Drive formulir kosong (mis. .docx/.pdf). Dari link share
 *    https://drive.google.com/file/d/<INI_FILE_ID>/view → salin bagian <INI_FILE_ID>.
 *    Set "Anyone with the link → Viewer".
 *  - uploadFormUrl: URL Google Form yang punya pertanyaan "File upload".
 *    Buat Form → tambah pertanyaan "Unggah file" → tombol Kirim/Send → tab <> (Sematkan/Embed)
 *    → salin URL di dalam src="..." (biasanya .../viewform?embedded=true).
 *    Boleh juga tempel URL viewform biasa; "?embedded=true" akan ditambahkan otomatis.
 *    Catatan Google: pengunggah WAJIB login akun Google untuk pertanyaan File upload.
 */
type Formulir = {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  fileId: string;        // ID Google Drive formulir kosong (file)
  uploadFormUrl: string; // URL embed Google Form (punya pertanyaan File upload)
};

const FORMULIR: Formulir[] = [
  {
    key: 'donasi',
    title: 'Formulir Donasi Dana Abadi',
    desc: 'Unduh, isi, lalu unggah kembali formulir donasi untuk berkontribusi pada Dana Abadi FTT IPB.',
    icon: <HandCoins className="w-5 h-5" />,
    fileId: '1FxXH44WwiccOxP8uj0zTjmF6PztaFAk2',
    uploadFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd0LtafBR5CYBRhcsknBmWC8_tcqxFgVMb-lAyvX64fzDQk8Q/viewform?usp=dialog',
  },
  {
    key: 'beasiswa',
    title: 'Formulir Permohonan Beasiswa Dana Abadi',
    desc: 'Bagi mahasiswa: unduh, isi, lalu unggah kembali formulir permohonan beasiswa Dana Abadi.',
    icon: <GraduationCap className="w-5 h-5" />,
    fileId: '1mu51VZD-sRifMfuIWCiiQBsfeyOhDi5x',
    uploadFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScTJ6_urwfUed06beVqiRoiT8I7YaRwQe1wysMfydmBr1HsCg/viewform?usp=dialog',
  },
];

const isSet = (v: string) => !!v && !v.startsWith('GANTI_');
const drivePreview = (id: string) => `https://drive.google.com/file/d/${id}/preview`;
const driveDownload = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;
const driveView = (id: string) => `https://drive.google.com/file/d/${id}/view`;
// Pastikan URL Google Form dalam mode embed (punya parameter embedded=true).
const toEmbed = (url: string) =>
  /embedded=true/.test(url) ? url : url + (url.includes('?') ? '&' : '?') + 'embedded=true';

interface DanaFormulirViewProps {
  onBack: () => void;
}

const NotConfigured = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
    {label} belum dikonfigurasi. Admin dapat menambahkan tautan Google Drive / Google Form di
    <code className="mx-1 px-1 rounded bg-gray-100">DanaFormulirView.tsx</code>.
  </div>
);

export const DanaFormulirView = ({ onBack }: DanaFormulirViewProps) => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-emerald-100 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dana Abadi
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-white/10 rounded-xl">
              <Landmark className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Formulir Dana Abadi FTT</h1>
          </div>
          <p className="text-emerald-50/90 max-w-2xl">
            Unduh formulir, lengkapi, lalu unggah kembali melalui formulir di setiap bagian.
            Tim fakultas akan memproses pengajuan Anda.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
        {FORMULIR.map((f) => (
          <section key={f.key}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-700">{f.icon}</span>
              <h2 className="text-xl font-bold text-gray-900">{f.title}</h2>
            </div>
            <p className="text-gray-500 text-sm mb-5">{f.desc}</p>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pratinjau + Unduh */}
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-400" /> Pratinjau & Unduh Formulir
                  </h3>
                  {isSet(f.fileId) ? (
                    <>
                      <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <iframe
                          src={drivePreview(f.fileId)}
                          title={`Pratinjau ${f.title}`}
                          className="w-full h-[360px]"
                          allow="autoplay"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild className="bg-emerald-700 hover:bg-emerald-600 text-white gap-2">
                          <a href={driveDownload(f.fileId)} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" /> Unduh Formulir
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="gap-2 border-gray-300">
                          <a href={driveView(f.fileId)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" /> Buka di Google Drive
                          </a>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <NotConfigured label="Pratinjau formulir" />
                  )}
                </CardContent>
              </Card>

              {/* Unggah formulir terisi */}
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4 text-gray-400" /> Unggah Formulir Terisi
                  </h3>
                  {isSet(f.uploadFormUrl) ? (
                    <>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          src={toEmbed(f.uploadFormUrl)}
                          title={`Unggah ${f.title}`}
                          className="w-full h-[460px]"
                        >
                          Memuat…
                        </iframe>
                      </div>
                      <Button asChild variant="outline" className="gap-2 border-gray-300">
                        <a href={f.uploadFormUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Buka formulir di tab baru
                        </a>
                      </Button>
                      <p className="text-xs text-gray-400">
                        Untuk melampirkan berkas, Anda perlu masuk dengan akun Google.
                      </p>
                    </>
                  ) : (
                    <NotConfigured label="Formulir unggahan" />
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
