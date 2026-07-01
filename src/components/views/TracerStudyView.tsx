"use client";

import React, { useState } from 'react';
import { User } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ChevronLeft, ChevronRight, Send, ClipboardList, Loader2 } from 'lucide-react';

interface TracerStudyViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

interface FormData {
  // A
  namaLengkap: string;
  programStudi: string;
  angkatan: string;
  tahunLulus: string;
  email: string;
  telepon: string;
  // B
  statusPekerjaan: string;
  waktuPekerjaan: string;
  lamaBekerjaSaatIni: string;
  namaPerusahaan: string;
  jabatan: string;
  sektor: string;
  sektorLain: string;
  kesesuaianBidang: number;
  // C
  relevansiKurikulum: number;
  matakuliahBerguna: string;
  matakuliahKurangRelevan: string;
  kompetensiTidakDiperoleh: string;
  porsiPraktik: number;
  komentarPraktik: string;
  softSkill: number;
  kesiapanKerja: number;
  // D
  kompetensiDigunakan: string[];
  kompetensiLain: string;
  ikutPelatihan: string;
  detailPelatihan: string;
  kontribusiPendidikan: number;
  // E
  topikBaru: string;
  bersediaNarasumber: string;
  saranLain: string;
}

const PRODI_OPTIONS = [
  'Teknik Pertanian dan Biosistem',
  'Teknologi Pangan',
  'Teknik Industri Pertanian',
  'Teknik Sipil dan Lingkungan',
  'Teknik Kimia',
  'Teknik Mesin',
];

const KOMPETENSI_OPTIONS = [
  'Analisis data',
  'Komunikasi tertulis',
  'Presentasi',
  'Kepemimpinan',
  'Teknologi / Software',
  'Bahasa asing',
  'Riset dan Penelitian',
  'Lainnya',
];

const TAHUN_SEKARANG = new Date().getFullYear();
const ANGKATAN_OPTIONS = Array.from({ length: 11 }, (_, i) => String(TAHUN_SEKARANG - 10 + i));
const LULUS_OPTIONS = Array.from({ length: 6 }, (_, i) => String(TAHUN_SEKARANG - 5 + i));

const STEPS = [
  'Data Pribadi',
  'Status Pekerjaan',
  'Relevansi Kurikulum',
  'Kompetensi',
  'Saran & Umpan Balik',
];

// Komponen skala 1–5
const ScaleSelector = ({
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-11 h-11 rounded-lg border-2 font-semibold text-sm transition-colors
            ${value === n
              ? 'bg-red-800 border-red-800 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-800'
            }`}
        >
          {n}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-xs text-gray-400 px-1">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
  </div>
);

const FieldError = ({ msg }: { msg: string }) => (
  <p className="text-red-500 text-xs mt-1">{msg}</p>
);

export const TracerStudyView = ({ currentUser }: TracerStudyViewProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [form, setForm] = useState<FormData>({
    namaLengkap: currentUser?.nama ?? '',
    programStudi: currentUser?.prodi ?? '',
    angkatan: currentUser?.angkatan ? String(currentUser.angkatan) : '',
    tahunLulus: '',
    email: '',
    telepon: '',
    statusPekerjaan: '',
    waktuPekerjaan: '',
    lamaBekerjaSaatIni: '',
    namaPerusahaan: '',
    jabatan: currentUser?.jabatan ?? '',
    sektor: '',
    sektorLain: '',
    kesesuaianBidang: 0,
    relevansiKurikulum: 0,
    matakuliahBerguna: '',
    matakuliahKurangRelevan: '',
    kompetensiTidakDiperoleh: '',
    porsiPraktik: 0,
    komentarPraktik: '',
    softSkill: 0,
    kesiapanKerja: 0,
    kompetensiDigunakan: [],
    kompetensiLain: '',
    ikutPelatihan: '',
    detailPelatihan: '',
    kontribusiPendidikan: 0,
    topikBaru: '',
    bersediaNarasumber: '',
    saranLain: '',
  });

  const set = (key: keyof FormData, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleKompetensi = (item: string) => {
    setForm((prev) => ({
      ...prev,
      kompetensiDigunakan: prev.kompetensiDigunakan.includes(item)
        ? prev.kompetensiDigunakan.filter((k) => k !== item)
        : [...prev.kompetensiDigunakan, item],
    }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.namaLengkap.trim()) e.namaLengkap = 'Wajib diisi';
      if (!form.programStudi) e.programStudi = 'Wajib dipilih';
      if (!form.angkatan) e.angkatan = 'Wajib dipilih';
      if (!form.tahunLulus) e.tahunLulus = 'Wajib dipilih';
      if (!form.email.trim()) e.email = 'Wajib diisi';
      if (!form.telepon.trim()) e.telepon = 'Wajib diisi';
    }
    if (step === 1) {
      if (!form.statusPekerjaan) e.statusPekerjaan = 'Wajib dipilih';
      if (!form.waktuPekerjaan) e.waktuPekerjaan = 'Wajib dipilih';
      if (!form.kesesuaianBidang) e.kesesuaianBidang = 'Wajib dipilih';
    }
    if (step === 2) {
      if (!form.relevansiKurikulum) e.relevansiKurikulum = 'Wajib dipilih';
      if (!form.porsiPraktik) e.porsiPraktik = 'Wajib dipilih';
      if (!form.softSkill) e.softSkill = 'Wajib dipilih';
      if (!form.kesiapanKerja) e.kesiapanKerja = 'Wajib dipilih';
    }
    if (step === 3) {
      if (!form.ikutPelatihan) e.ikutPelatihan = 'Wajib dipilih';
      if (!form.kontribusiPendidikan) e.kontribusiPendidikan = 'Wajib dipilih';
    }
    if (step === 4) {
      if (!form.bersediaNarasumber) e.bersediaNarasumber = 'Wajib dipilih';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tracer-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal mengirim formulir.');
      }
      setSubmitted(true);
      toast({
        title: 'Terima kasih!',
        description: 'Respons Tracer Study Anda berhasil disimpan.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description:
          err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi nanti.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Respons Anda Telah Diterima</h2>
        <p className="text-gray-500 mb-8">
          Terima kasih, <span className="font-semibold text-gray-700">{form.namaLengkap}</span>!
          Masukan Anda sangat berarti untuk pengembangan kurikulum FTT IPB.
        </p>
        <Button
          onClick={() => { setSubmitted(false); setStep(0); }}
          variant="outline"
          className="border-red-800 text-red-800 hover:bg-red-50"
        >
          Isi Ulang Formulir
        </Button>
      </div>
    );
  }

  const progressValue = ((step) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mb-4">
          <ClipboardList className="w-7 h-7 text-red-800" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Tracer Study Alumni</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
          Diperuntukkan bagi alumni yang lulus dalam 5 tahun terakhir. Data Anda membantu
          pengembangan kurikulum FTT IPB.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Bagian {step + 1} dari {STEPS.length}: <span className="font-medium text-gray-700">{STEPS[step]}</span></span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 mx-0.5 rounded-full transition-colors ${i < step ? 'bg-red-800' : i === step ? 'bg-red-400' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base text-red-900">
            {String.fromCharCode(65 + step)}. {STEPS[step]}
          </CardTitle>
          {step === 0 && (
            <CardDescription>Pastikan data yang Anda masukkan sesuai dengan identitas resmi Anda.</CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* ============ BAGIAN A ============ */}
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <Label>1. Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input
                  value={form.namaLengkap}
                  onChange={(e) => set('namaLengkap', e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                />
                {errors.namaLengkap && <FieldError msg={errors.namaLengkap} />}
              </div>

              <div className="space-y-1.5">
                <Label>2. Program Studi / Jurusan <span className="text-red-500">*</span></Label>
                <Select value={form.programStudi} onValueChange={(v) => set('programStudi', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih program studi" /></SelectTrigger>
                  <SelectContent>
                    {PRODI_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.programStudi && <FieldError msg={errors.programStudi} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>3. Angkatan (Tahun Masuk) <span className="text-red-500">*</span></Label>
                  <Select value={form.angkatan} onValueChange={(v) => set('angkatan', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih tahun" /></SelectTrigger>
                    <SelectContent>
                      {ANGKATAN_OPTIONS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.angkatan && <FieldError msg={errors.angkatan} />}
                </div>
                <div className="space-y-1.5">
                  <Label>4. Tahun Lulus <span className="text-red-500">*</span></Label>
                  <Select value={form.tahunLulus} onValueChange={(v) => set('tahunLulus', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih tahun" /></SelectTrigger>
                    <SelectContent>
                      {LULUS_OPTIONS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.tahunLulus && <FieldError msg={errors.tahunLulus} />}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>5. Alamat Email Aktif <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@contoh.com"
                />
                {errors.email && <FieldError msg={errors.email} />}
              </div>

              <div className="space-y-1.5">
                <Label>6. Nomor Telepon / WhatsApp <span className="text-red-500">*</span></Label>
                <Input
                  value={form.telepon}
                  onChange={(e) => set('telepon', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.telepon && <FieldError msg={errors.telepon} />}
              </div>
            </>
          )}

          {/* ============ BAGIAN B ============ */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>7. Status pekerjaan Anda saat ini <span className="text-red-500">*</span></Label>
                <RadioGroup value={form.statusPekerjaan} onValueChange={(v) => set('statusPekerjaan', v)} className="space-y-2">
                  {['Bekerja penuh waktu', 'Bekerja paruh waktu', 'Wirausaha', 'Pekerja lepas', 'Sedang studi lanjut', 'Belum bekerja'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`sp-${opt}`} />
                      <Label htmlFor={`sp-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.statusPekerjaan && <FieldError msg={errors.statusPekerjaan} />}
              </div>

              <div className="space-y-2">
                <Label>8. Berapa lama waktu yang Anda butuhkan untuk mendapat pekerjaan pertama setelah lulus? <span className="text-red-500">*</span></Label>
                <RadioGroup value={form.waktuPekerjaan} onValueChange={(v) => set('waktuPekerjaan', v)} className="space-y-2">
                  {['Kurang dari 3 bulan', '3 – 6 bulan', '6 – 12 bulan', 'Lebih dari 1 tahun', 'Belum pernah bekerja'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`wp-${opt}`} />
                      <Label htmlFor={`wp-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.waktuPekerjaan && <FieldError msg={errors.waktuPekerjaan} />}
              </div>

              <div className="space-y-1.5">
                <Label>9. Sudah berapa lama Anda bekerja di posisi / tempat kerja saat ini?</Label>
                <Input
                  value={form.lamaBekerjaSaatIni}
                  onChange={(e) => set('lamaBekerjaSaatIni', e.target.value)}
                  placeholder="Contoh: 2 tahun 3 bulan"
                />
              </div>

              <div className="space-y-1.5">
                <Label>10. Nama perusahaan / instansi tempat Anda bekerja saat ini</Label>
                <Input
                  value={form.namaPerusahaan}
                  onChange={(e) => set('namaPerusahaan', e.target.value)}
                  placeholder="Boleh dikosongkan"
                />
              </div>

              <div className="space-y-1.5">
                <Label>11. Jabatan / posisi Anda saat ini</Label>
                <Input
                  value={form.jabatan}
                  onChange={(e) => set('jabatan', e.target.value)}
                  placeholder="Contoh: Software Engineer, Peneliti, dll."
                />
              </div>

              <div className="space-y-1.5">
                <Label>12. Bidang / sektor pekerjaan Anda</Label>
                <Select value={form.sektor} onValueChange={(v) => set('sektor', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih sektor" /></SelectTrigger>
                  <SelectContent>
                    {['Pemerintahan / ASN', 'Swasta', 'BUMN / BUMD', 'NGO / Lembaga Nirlaba', 'Wirausaha / Mandiri', 'Lainnya'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.sektor === 'Lainnya' && (
                  <Input
                    className="mt-2"
                    value={form.sektorLain}
                    onChange={(e) => set('sektorLain', e.target.value)}
                    placeholder="Sebutkan sektor lainnya..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>13. Apakah pekerjaan Anda sesuai dengan bidang studi yang Anda tempuh? <span className="text-red-500">*</span></Label>
                <ScaleSelector
                  value={form.kesesuaianBidang}
                  onChange={(v) => set('kesesuaianBidang', v)}
                  leftLabel="Sangat tidak sesuai"
                  rightLabel="Sangat sesuai"
                />
                {errors.kesesuaianBidang && <FieldError msg={errors.kesesuaianBidang} />}
              </div>
            </>
          )}

          {/* ============ BAGIAN C ============ */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>14. Seberapa relevan kurikulum program studi Anda dengan kebutuhan pekerjaan? <span className="text-red-500">*</span></Label>
                <ScaleSelector
                  value={form.relevansiKurikulum}
                  onChange={(v) => set('relevansiKurikulum', v)}
                  leftLabel="Sangat tidak relevan"
                  rightLabel="Sangat relevan"
                />
                {errors.relevansiKurikulum && <FieldError msg={errors.relevansiKurikulum} />}
              </div>

              <div className="space-y-1.5">
                <Label>15. Mata kuliah atau kompetensi yang paling berguna di dunia kerja</Label>
                <Textarea
                  value={form.matakuliahBerguna}
                  onChange={(e) => set('matakuliahBerguna', e.target.value)}
                  placeholder="Tuliskan mata kuliah yang paling bermanfaat..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label>16. Mata kuliah yang menurut Anda kurang relevan atau bisa dikurangi</Label>
                <Textarea
                  value={form.matakuliahKurangRelevan}
                  onChange={(e) => set('matakuliahKurangRelevan', e.target.value)}
                  placeholder="Tuliskan jika ada..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label>17. Kompetensi yang dibutuhkan di dunia kerja namun tidak diperoleh dari perkuliahan</Label>
                <Textarea
                  value={form.kompetensiTidakDiperoleh}
                  onChange={(e) => set('kompetensiTidakDiperoleh', e.target.value)}
                  placeholder="Tuliskan jika ada..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>18. Seberapa memadai porsi praktik / magang dibandingkan teori dalam kurikulum? <span className="text-red-500">*</span></Label>
                <ScaleSelector
                  value={form.porsiPraktik}
                  onChange={(v) => set('porsiPraktik', v)}
                  leftLabel="Sangat tidak memadai"
                  rightLabel="Sangat memadai"
                />
                {errors.porsiPraktik && <FieldError msg={errors.porsiPraktik} />}
              </div>

              <div className="space-y-1.5">
                <Label>18b. Komentar tambahan mengenai porsi praktik / magang</Label>
                <Textarea
                  value={form.komentarPraktik}
                  onChange={(e) => set('komentarPraktik', e.target.value)}
                  placeholder="Opsional..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>19. Apakah soft skill cukup difasilitasi selama perkuliahan? <span className="text-red-500">*</span></Label>
                <p className="text-xs text-gray-400">Komunikasi, kerja tim, manajemen waktu, dll.</p>
                <ScaleSelector
                  value={form.softSkill}
                  onChange={(v) => set('softSkill', v)}
                  leftLabel="Sangat tidak cukup"
                  rightLabel="Sangat cukup"
                />
                {errors.softSkill && <FieldError msg={errors.softSkill} />}
              </div>

              <div className="space-y-2">
                <Label>20. Seberapa baik program studi mempersiapkan Anda untuk tantangan dunia kerja? <span className="text-red-500">*</span></Label>
                <ScaleSelector
                  value={form.kesiapanKerja}
                  onChange={(v) => set('kesiapanKerja', v)}
                  leftLabel="Sangat tidak siap"
                  rightLabel="Sangat siap"
                />
                {errors.kesiapanKerja && <FieldError msg={errors.kesiapanKerja} />}
              </div>
            </>
          )}

          {/* ============ BAGIAN D ============ */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>21. Kompetensi yang paling sering Anda gunakan dalam pekerjaan</Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {KOMPETENSI_OPTIONS.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`kd-${item}`}
                        checked={form.kompetensiDigunakan.includes(item)}
                        onCheckedChange={() => toggleKompetensi(item)}
                      />
                      <Label htmlFor={`kd-${item}`} className="font-normal cursor-pointer text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
                {form.kompetensiDigunakan.includes('Lainnya') && (
                  <Input
                    className="mt-2"
                    value={form.kompetensiLain}
                    onChange={(e) => set('kompetensiLain', e.target.value)}
                    placeholder="Sebutkan kompetensi lainnya..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>22. Apakah Anda mengikuti pelatihan atau sertifikasi tambahan setelah lulus? <span className="text-red-500">*</span></Label>
                <RadioGroup value={form.ikutPelatihan} onValueChange={(v) => set('ikutPelatihan', v)} className="flex gap-6">
                  {['Ya', 'Tidak'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`ip-${opt}`} />
                      <Label htmlFor={`ip-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.ikutPelatihan && <FieldError msg={errors.ikutPelatihan} />}
              </div>

              {form.ikutPelatihan === 'Ya' && (
                <div className="space-y-1.5">
                  <Label>22b. Sebutkan pelatihan atau sertifikasi yang diikuti</Label>
                  <Textarea
                    value={form.detailPelatihan}
                    onChange={(e) => set('detailPelatihan', e.target.value)}
                    placeholder="Contoh: Google Data Analytics, AWS Certified, dll."
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>23. Seberapa besar kontribusi pendidikan Anda terhadap pengembangan karier? <span className="text-red-500">*</span></Label>
                <ScaleSelector
                  value={form.kontribusiPendidikan}
                  onChange={(v) => set('kontribusiPendidikan', v)}
                  leftLabel="Sangat kecil"
                  rightLabel="Sangat besar"
                />
                {errors.kontribusiPendidikan && <FieldError msg={errors.kontribusiPendidikan} />}
              </div>
            </>
          )}

          {/* ============ BAGIAN E ============ */}
          {step === 4 && (
            <>
              <div className="space-y-1.5">
                <Label>24. Topik atau bidang baru yang sebaiknya ditambahkan ke dalam kurikulum</Label>
                <Textarea
                  value={form.topikBaru}
                  onChange={(e) => set('topikBaru', e.target.value)}
                  placeholder="Contoh: Kecerdasan buatan, Keberlanjutan lingkungan, dll."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>25. Apakah Anda bersedia dihubungi kembali sebagai narasumber / mitra magang atau kuliah tamu? <span className="text-red-500">*</span></Label>
                <RadioGroup value={form.bersediaNarasumber} onValueChange={(v) => set('bersediaNarasumber', v)} className="flex gap-6">
                  {['Ya', 'Tidak', 'Mungkin'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`bn-${opt}`} />
                      <Label htmlFor={`bn-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.bersediaNarasumber && <FieldError msg={errors.bersediaNarasumber} />}
              </div>

              <div className="space-y-1.5">
                <Label>26. Saran lain untuk peningkatan kualitas program studi</Label>
                <Textarea
                  value={form.saranLain}
                  onChange={(e) => set('saranLain', e.target.value)}
                  placeholder="Tuliskan saran Anda secara bebas..."
                  rows={4}
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                Dengan menekan <strong>Kirim Respons</strong>, Anda menyetujui bahwa data yang diisi
                akan digunakan untuk kepentingan pengembangan kurikulum FTT IPB.
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Navigasi */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelumnya
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} className="bg-red-800 hover:bg-red-700 text-white gap-2">
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-red-800 hover:bg-red-700 text-white gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Kirim Respons
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
