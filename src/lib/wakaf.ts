import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Modul Dana Abadi & Wakaf — bentuk paling sederhana (Fase 1):
 * menghimpun pokok (donasi/wakaf), menampilkan transparansi publik, dan
 * konfirmasi oleh admin. Prinsip "jaga pokok, salurkan hasil" diwakili dengan
 * mencatat & menampilkan pokok terhimpun secara transparan.
 *
 * Investasi pokok, spending rule, sertifikat, dan CWLS/sukuk = fase berikutnya.
 */

export type WakafStatus = 'Menunggu Konfirmasi' | 'Terkonfirmasi';
// Netral & inklusif (selaras PRD): "Donasi" disalurkan untuk program,
// "Dana Abadi" pokoknya dijaga, hanya hasilnya yang dipakai.
export type WakafJenis = 'Donasi' | 'Dana Abadi';

export type WakafRecord = {
  id: string;
  uid?: string;
  nama: string;          // nama tampil (atau "Anonim" bila disembunyikan)
  jumlah: number;        // dalam Rupiah
  dana: string;          // key dari WAKAF_FUNDS
  jenis: WakafJenis;
  kontak?: string;       // email/WhatsApp untuk konfirmasi (tidak ditampilkan publik)
  pesan?: string;
  status: WakafStatus;
  createdAt?: number;
};

export type WakafInput = Omit<WakafRecord, 'id' | 'status' | 'createdAt'>;

// Dana tujuan (sederhana, ditetapkan di kode). Target hanya indikatif.
export const WAKAF_FUNDS = [
  { key: 'beasiswa', label: 'Dana Beasiswa', desc: 'Beasiswa & bantuan biaya kuliah mahasiswa FTT.', target: 100_000_000 },
  { key: 'riset', label: 'Dana Riset & Inovasi', desc: 'Pendanaan riset, prototipe, dan inovasi.', target: 75_000_000 },
  { key: 'umum', label: 'Dana Abadi Umum', desc: 'Kebutuhan operasional & pengembangan fakultas.', target: 50_000_000 },
];

export const fundLabel = (key: string) =>
  WAKAF_FUNDS.find((f) => f.key === key)?.label ?? key;

export const formatRupiah = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export async function fetchWakaf(): Promise<WakafRecord[]> {
  if (!db) return [];
  const q = query(collection(db, 'wakaf'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WakafRecord, 'id'>) }));
}

export async function addWakaf(data: WakafInput): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  // Buang field undefined (mis. uid untuk donatur tanpa akun) — Firestore menolak undefined.
  const clean: Record<string, unknown> = {
    status: 'Menunggu Konfirmasi' as WakafStatus, // WAJIB agar lolos Security Rules.
    createdAt: Date.now(),
  };
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) clean[k] = v;
  }
  await addDoc(collection(db, 'wakaf'), clean);
}

export async function confirmWakaf(id: string): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  await updateDoc(doc(db, 'wakaf', id), { status: 'Terkonfirmasi' });
}

export async function deleteWakaf(id: string): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  await deleteDoc(doc(db, 'wakaf', id));
}

/** Hitung total pokok terkonfirmasi per dana (+ jumlah kontributor per dana). */
export function summarize(records: WakafRecord[]) {
  const confirmed = records.filter((r) => r.status === 'Terkonfirmasi');
  const totalPokok = confirmed.reduce((s, r) => s + (r.jumlah || 0), 0);
  const perFund: Record<string, number> = {};
  const perFundCount: Record<string, number> = {};
  for (const f of WAKAF_FUNDS) { perFund[f.key] = 0; perFundCount[f.key] = 0; }
  for (const r of confirmed) {
    perFund[r.dana] = (perFund[r.dana] || 0) + (r.jumlah || 0);
    perFundCount[r.dana] = (perFundCount[r.dana] || 0) + 1;
  }
  return { confirmed, totalPokok, perFund, perFundCount, jumlahKontribusi: confirmed.length };
}
