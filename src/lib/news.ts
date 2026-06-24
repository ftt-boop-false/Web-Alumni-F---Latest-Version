import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { NEWS } from './data';

/** Satu item berita di koleksi Firestore `news`. */
export type NewsItem = {
  id: string;
  judul: string;
  kategori: string;
  penulis: string;
  tanggal: string;
  ringkasan: string;
  isi?: string;
  tag: string[];
  featured?: boolean;
  gambar?: string;
};

export type NewsInput = Omit<NewsItem, 'id'>;

export const NEWS_KATEGORI = ['Prestasi', 'Kiprah', 'Wirausaha', 'Pengumuman'];

/** Ambil semua berita, terbaru di atas. */
export async function fetchNews(): Promise<NewsItem[]> {
  if (!db) return [];
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsItem, 'id'>) }));
}

export async function addNews(data: NewsInput): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  await addDoc(collection(db, 'news'), { ...data, createdAt: Date.now() });
}

export async function updateNews(id: string, data: Partial<NewsInput>): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  await updateDoc(doc(db, 'news', id), data);
}

export async function deleteNews(id: string): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  await deleteDoc(doc(db, 'news', id));
}

/**
 * Impor berita contoh (dari data statis) ke Firestore satu kali, agar konten
 * demo yang sudah ada bisa dikelola admin. Dipanggil dari tombol admin.
 */
export async function seedNewsFromStatic(): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  let i = 0;
  for (const n of NEWS) {
    await addDoc(collection(db, 'news'), {
      judul: n.judul,
      kategori: n.kategori,
      penulis: n.penulis,
      tanggal: n.tanggal,
      ringkasan: n.ringkasan,
      isi: '',
      tag: n.tag,
      featured: !!n.featured,
      gambar: '',
      // jaga urutan asli saat di-import.
      createdAt: Date.now() + i++,
    });
  }
}
