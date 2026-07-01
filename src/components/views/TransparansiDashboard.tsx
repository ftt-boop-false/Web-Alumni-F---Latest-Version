"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { GraduationCap, FlaskConical, TrendingUp, User2, Building2, ArrowUpRight } from 'lucide-react';

/**
 * Dashboard Transparansi Dana Abadi (data DUMMY untuk peraga).
 * Dua tab: Transparansi Beasiswa & Transparansi Dana Riset.
 * Ganti angka di bawah dengan data resmi fakultas saat siap.
 */

const PALETTE = ['#047857', '#0f766e', '#d97706', '#15803d', '#b45309', '#64748b', '#0ea5e9'];

// ===== Data DUMMY: BEASISWA =====
const BEASISWA_STATS = [
  { label: 'Total Dana Beasiswa', value: 'Rp 28,7 M', note: 'Akumulasi sejak 2019', trend: '↑ 18% vs tahun lalu', accent: 'emerald' },
  { label: 'Penerima Aktif', value: '327', note: 'Semester genap 2024/2025', trend: '↑ 12% vs tahun lalu', accent: 'teal' },
  { label: 'Total Alumni Penerima', value: '1.842', note: 'Sejak program dimulai', trend: 'Kumulatif', accent: 'amber' },
  { label: 'Rata-rata / Penerima', value: 'Rp 6,5 Jt', note: 'Per semester', trend: 'Stabil', accent: 'slate' },
];

const BEASISWA_PRODI = [
  { name: 'Teknologi Pangan', value: 82 },
  { name: 'Teknik Pertanian & Biosistem', value: 68 },
  { name: 'Teknik Industri Pertanian', value: 54 },
  { name: 'Teknik Sipil & Lingkungan', value: 48 },
  { name: 'Teknik Mesin', value: 41 },
  { name: 'Lainnya', value: 34 },
];

const BEASISWA_DEPT = [
  { name: 'TIN', value: 85 },
  { name: 'SIL', value: 72 },
  { name: 'TMB', value: 61 },
  { name: 'TPG', value: 54 },
  { name: 'TKM', value: 48 },
  { name: 'TPB', value: 39 },
];

// ===== Data DUMMY: RISET =====
const RISET_STATS = [
  { label: 'Total Dana Riset', value: 'Rp 38,5 M', note: 'Akumulasi sejak 2018', trend: '↑ 24% vs tahun lalu', accent: 'emerald' },
  { label: 'Hibah Pemerintah', value: 'Rp 20,1 M', note: 'DIKTI, BRIN, Kemristek', trend: '52,2% dari total', accent: 'teal' },
  { label: 'Hibah Industri', value: 'Rp 12,3 M', note: '17 mitra industri', trend: '↑ 39% vs tahun lalu', accent: 'amber' },
  { label: 'Crowdfunding & Lainnya', value: 'Rp 6,1 M', note: 'Donasi publik', trend: 'Skema baru 2023', accent: 'slate' },
];

const RISET_SEKTOR = [
  { name: 'Energi Terbarukan & Lingkungan', amount: 'Rp 5,20 M', pct: 88, color: '#047857' },
  { name: 'Kecerdasan Buatan & Machine Learning', amount: 'Rp 4,25 M', pct: 72, color: '#0f766e' },
  { name: 'Bioteknologi & Pangan', amount: 'Rp 3,60 M', pct: 61, color: '#15803d' },
  { name: 'Material Canggih & Nanoteknologi', amount: 'Rp 3,05 M', pct: 52, color: '#d97706' },
  { name: 'Pertanian & Ketahanan Pangan', amount: 'Rp 2,35 M', pct: 40, color: '#b45309' },
  { name: 'Rekayasa Infrastruktur & Smart City', amount: 'Rp 2,00 M', pct: 34, color: '#64748b' },
  { name: 'Topik Lintas Disiplin Lainnya', amount: 'Rp 1,30 M', pct: 22, color: '#94a3b8' },
];

const RISET_SUMBER = [
  { name: 'Hibah Pemerintah', value: 52.2 },
  { name: 'Hibah Industri', value: 31.9 },
  { name: 'Crowdfunding', value: 9.9 },
  { name: 'Dana Abadi', value: 6.0 },
];

const RISET_STATUS_CHART = [
  { name: 'Konstruksi', value: 8 },
  { name: 'Pengujian', value: 11 },
  { name: 'Ambil Data', value: 9 },
  { name: 'Analisis', value: 7 },
  { name: 'Selesai', value: 7 },
];

type Proyek = {
  id: string; judul: string; status: string; step: number;
  peneliti: string; mitra: string; abstrak: string; dana: string; tahun: string;
};

const PROYEK: Proyek[] = [
  {
    id: 'FTT-RI-2024-001', judul: 'Pengembangan Panel Surya Berbasis Perovskite Efisiensi Tinggi untuk Daerah Terpencil',
    status: 'Pengambilan Data', step: 2, peneliti: 'Prof. Dr. Hendra Kusuma, M.T.', mitra: 'IPB University',
    abstrak: 'Sel surya perovskite dengan efisiensi konversi di atas 25% menggunakan material ramah lingkungan, ditargetkan untuk elektrifikasi desa terpencil di Indonesia timur.',
    dana: 'Rp 850 Jt', tahun: '2023–2025',
  },
  {
    id: 'FTT-RI-2024-002', judul: 'Sistem Deteksi Dini Penyakit Tanaman Padi Menggunakan Deep Learning dan Citra Satelit',
    status: 'Analisis Data', step: 3, peneliti: 'Dr. Rina Andriani, M.Sc.', mitra: 'IPB University',
    abstrak: 'Model CNN dilatih pada 50.000+ citra lapangan, mengidentifikasi 12 patogen padi dengan akurasi 94,7%. Integrasi data Sentinel-2 untuk pemantauan skala lahan luas.',
    dana: 'Rp 720 Jt', tahun: '2022–2025',
  },
  {
    id: 'FTT-RI-2024-003', judul: 'Fabrikasi Nanokomposit Kitosan-Zeolit untuk Penyerapan Logam Berat di Perairan Sungai',
    status: 'Pengujian Lab', step: 1, peneliti: 'Dr. Bagus Prasetyo, M.Eng.', mitra: 'IPB University',
    abstrak: 'Material hibrida biopolimer menyerap ion Pb²⁺, Cd²⁺, dan Hg²⁺ hingga 98,3%. Memanfaatkan limbah cangkang udang sebagai bahan baku utama.',
    dana: 'Rp 540 Jt', tahun: '2024–2026',
  },
  {
    id: 'FTT-RI-2023-017', judul: 'Rancang Bangun Robot Rehabilitasi Pasca Stroke Berbasis Kontrol EMG-AI Adaptif',
    status: 'Konstruksi Alat', step: 0, peneliti: 'Prof. Ir. Siti Nurhayati, Ph.D.', mitra: 'IPB University',
    abstrak: 'Eksoskeleton tangan membaca sinyal EMG permukaan dan memakai reinforcement learning untuk adaptasi realtime. Target 60 unit prototipe untuk 5 RSUD mitra.',
    dana: 'Rp 1,25 M', tahun: '2024–2027',
  },
  {
    id: 'FTT-RI-2022-009', judul: 'Pengembangan Vaksin Subunit Berbasis Protein Rekombinan untuk Avian Influenza H5N1',
    status: 'Selesai', step: 4, peneliti: 'Dr. Ahmad Fauzi Nasution, M.Biomed.', mitra: 'IPB University',
    abstrak: 'Antigen HA H5N1 diekspresikan dalam Pichia pastoris dengan yield 98 mg/L. Uji praklinis menunjukkan titer antibodi protektif ≥1:320 pada 89% hewan uji. Dua paten didaftarkan.',
    dana: 'Rp 680 Jt', tahun: '2022–2024',
  },
  {
    id: 'FTT-RI-2024-011', judul: 'Optimasi Jaringan Smart Grid Menggunakan Multi-Agent Reinforcement Learning',
    status: 'Pengujian Lab', step: 1, peneliti: 'Dr. Yusuf Hartanto, M.T.', mitra: 'Kolaborasi PT PLN',
    abstrak: 'Algoritma MARL untuk distribusi beban jaringan listrik cerdas, mengurangi losses 18,4% dan meningkatkan stabilitas tegangan pada simulasi grid 500+ node.',
    dana: 'Rp 920 Jt', tahun: '2024–2026',
  },
];

const STATUS_FILTERS = ['Semua', 'Konstruksi Alat', 'Pengujian Lab', 'Pengambilan Data', 'Analisis Data', 'Selesai'];
const PROGRESS_LABELS = ['Konstruksi', 'Pengujian', 'Ambil Data', 'Analisis'];

const statusPill = (s: string) => {
  switch (s) {
    case 'Konstruksi Alat': return 'bg-amber-100 text-amber-800';
    case 'Pengujian Lab': return 'bg-blue-100 text-blue-800';
    case 'Pengambilan Data': return 'bg-emerald-100 text-emerald-800';
    case 'Analisis Data': return 'bg-purple-100 text-purple-800';
    case 'Selesai': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const accentBar = (a: string) =>
  a === 'teal' ? 'bg-teal-600' : a === 'amber' ? 'bg-amber-500' : a === 'slate' ? 'bg-slate-400' : 'bg-emerald-600';

const StatCard = ({ s }: { s: typeof BEASISWA_STATS[number] }) => (
  <Card className="border-gray-200 shadow-sm relative overflow-hidden">
    <div className={`absolute top-0 inset-x-0 h-1 ${accentBar(s.accent)}`} />
    <CardContent className="p-5">
      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">{s.label}</p>
      <p className="text-2xl font-bold text-gray-900 font-mono leading-none mb-1.5">{s.value}</p>
      <p className="text-xs text-gray-500">{s.note}</p>
      <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        <TrendingUp className="w-3 h-3" /> {s.trend}
      </span>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="border-gray-200 shadow-sm">
    <CardContent className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{title}</p>
      <div className="h-[240px] w-full">{children}</div>
    </CardContent>
  </Card>
);

export const TransparansiDashboard = () => {
  const [filter, setFilter] = useState('Semua');
  const proyekTampil = filter === 'Semua' ? PROYEK : PROYEK.filter((p) => p.status === filter);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Transparansi</h2>
      <p className="text-gray-500 mb-6 text-sm">Data publik penggunaan Dana Abadi (angka peraga / dummy).</p>

      <Tabs defaultValue="beasiswa" className="w-full">
        <TabsList className="bg-emerald-50 mb-6">
          <TabsTrigger value="beasiswa" className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 gap-2">
            <GraduationCap className="w-4 h-4" /> Transparansi Beasiswa
          </TabsTrigger>
          <TabsTrigger value="riset" className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 gap-2">
            <FlaskConical className="w-4 h-4" /> Transparansi Dana Riset
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB BEASISWA ============ */}
        <TabsContent value="beasiswa" className="space-y-8">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-6">
            <p className="text-[11px] uppercase tracking-widest text-amber-300 font-semibold mb-1">Dana Beasiswa · Transparansi Publik</p>
            <h3 className="text-2xl font-extrabold mb-2">Dana Beasiswa Abadi FTT</h3>
            <p className="text-emerald-50/80 text-sm max-w-2xl">
              Seluruh data beasiswa dikelola transparan dan dapat diakses publik. Dana bersumber dari APBN/D,
              mitra korporat melalui CSR, serta donatur individu & alumni.
            </p>
            <p className="text-xs text-emerald-100/50 mt-3">Data per semester genap <span className="text-amber-300 font-mono">2024/2025</span> · diaudit KAP independen</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BEASISWA_STATS.map((s) => <StatCard key={s.label} s={s} />)}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <ChartCard title="Program Studi Penerima">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={BEASISWA_PRODI} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {BEASISWA_PRODI.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Penerima per Departemen FTT">
              <ResponsiveContainer>
                <BarChart data={BEASISWA_DEPT}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {BEASISWA_DEPT.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* ============ TAB RISET ============ */}
        <TabsContent value="riset" className="space-y-8">
          <div className="rounded-2xl bg-gradient-to-br from-teal-900 to-teal-700 text-white p-6">
            <p className="text-[11px] uppercase tracking-widest text-teal-200 font-semibold mb-1">Dana Riset · Transparansi Publik</p>
            <h3 className="text-2xl font-extrabold mb-2">Dana Riset Abadi FTT</h3>
            <p className="text-teal-50/80 text-sm max-w-2xl">
              Seluruh proyek riset yang didanai terdaftar terbuka — mencakup peneliti utama, alokasi anggaran,
              dan progres pelaksanaan secara berkala.
            </p>
            <p className="text-xs text-teal-100/50 mt-3">Data per kuartal II <span className="text-teal-200 font-mono">2025</span> · 42 proyek aktif terdaftar</p>
          </div>

          {/* Fund meter */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500">Realisasi Dana Riset Tahun Berjalan</span>
                <span className="font-mono text-sm font-semibold text-teal-700">Rp 18,6 M / Rp 22,0 M</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400" style={{ width: '84.5%' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[
                  ['Rp 18,6 M', 'Dana Terserap'], ['Rp 3,4 M', 'Sisa Anggaran'],
                  ['84,5%', 'Tingkat Realisasi'], ['42', 'Proyek Aktif'],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="font-mono font-semibold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {RISET_STATS.map((s) => <StatCard key={s.label} s={s} />)}
          </div>

          {/* Alokasi per sektor */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Alokasi Dana per Sektor / Topik Riset</p>
              <p className="text-xs text-gray-400 mb-4">Distribusi pendanaan ke bidang keilmuan 2024/2025</p>
              <div className="space-y-3">
                {RISET_SEKTOR.map((s, i) => (
                  <div key={s.name} className="grid grid-cols-[1.5rem_1fr_auto] gap-3 items-center">
                    <span className="font-mono text-[11px] text-gray-400 text-right">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{s.name}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-sm text-gray-900 whitespace-nowrap">{s.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-5">
            <ChartCard title="Distribusi Dana per Sumber (%)">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={RISET_SUMBER} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {RISET_SUMBER.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Status Proyek Berjalan">
              <ResponsiveContainer>
                <BarChart data={RISET_STATUS_CHART}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {RISET_STATUS_CHART.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Direktori proyek */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Direktori Proyek Riset Terbuka</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filter === f ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {proyekTampil.map((p) => (
                <Card key={p.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-mono text-[11px] text-gray-400 mb-1">{p.id}</p>
                        <h4 className="font-semibold text-gray-900 text-sm leading-snug">{p.judul}</h4>
                      </div>
                      <Badge className={`shrink-0 ${statusPill(p.status)}`}>{p.status}</Badge>
                    </div>

                    {/* progress steps */}
                    <div className="flex gap-1">
                      {PROGRESS_LABELS.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${
                          i < p.step ? 'bg-teal-600' : i === p.step ? 'bg-amber-500' : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="flex items-center gap-1.5"><User2 className="w-3.5 h-3.5 text-gray-400" /> <strong className="text-gray-700 font-medium">{p.peneliti}</strong></p>
                      <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {p.mitra}</p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{p.abstrak}</p>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-auto">
                      <div>
                        <p className="font-mono font-semibold text-gray-900">{p.dana}</p>
                        <p className="text-[10px] text-gray-400">Nilai Pendanaan</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                        <ArrowUpRight className="w-3 h-3" /> {p.tahun}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
