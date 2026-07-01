import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { USERS, User } from './data';

/**
 * Penyimpanan generik untuk "papan" demo (Career, AlumniConnect, Forum Riset).
 * Strategi: setiap item (thread/loker) disimpan sebagai satu dokumen utuh
 * (id = item.id). Ini mempertahankan SEMUA fitur (likes, reply bersarang,
 * proposal, dsb.) tanpa mengubah logika komponen — komponen tetap memakai
 * useState seperti biasa, lalu perubahan dipersist otomatis (lihat useBoard).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyItem = { id: any };

export async function loadBoard<T extends AnyItem>(name: string, seed: T[]): Promise<T[]> {
  if (!db) return seed;
  try {
    const snap = await getDocs(collection(db, name));
    if (snap.empty) {
      // Seed data demo sekali (best-effort; butuh user login sesuai rules).
      await Promise.allSettled(seed.map((s) => setDoc(doc(db!, name, String(s.id)), s as object)));
      return seed;
    }
    return snap.docs.map((d) => d.data() as T);
  } catch {
    return seed;
  }
}

export async function saveBoardItem<T extends AnyItem>(name: string, item: T): Promise<void> {
  if (!db) return;
  try { await setDoc(doc(db, name, String(item.id)), item as object); } catch { /* abaikan */ }
}

export async function removeBoardItem(name: string, id: unknown): Promise<void> {
  if (!db) return;
  try { await deleteDoc(doc(db, name, String(id))); } catch { /* abaikan */ }
}

// ---- Registry penulis: agar nama/avatar penulis ASLI tampil di UI yang
// mengandalkan daftar USERS (data demo). USERS dimutasi saat runtime. ----

function mergeUser(u: Partial<User> & { id: User['id'] }) {
  if (u.id === undefined || u.id === null) return;
  if (USERS.some((x) => x.id === u.id)) return;
  USERS.push({
    id: u.id,
    nama: u.nama || 'Pengguna',
    angkatan: u.angkatan ?? '',
    prodi: u.prodi || '',
    role: (u.role as User['role']) || 'alumni',
    jabatan: u.jabatan || '',
    keahlian: u.keahlian || [],
    lokasi: u.lokasi || '',
    avatar_color: u.avatar_color || '#c30010',
    linkedin: u.linkedin || '#',
    bio: u.bio || '',
    tersedia_narasumber: false,
    tersedia_penguji: false,
    tracer_filled: false,
  });
}

export async function registerForumUser(u: User): Promise<void> {
  mergeUser(u);
  if (!db) return;
  try {
    await setDoc(doc(db, 'forumUsers', String(u.id)), {
      id: u.id, nama: u.nama, role: u.role, avatar_color: u.avatar_color || '#c30010',
      jabatan: u.jabatan || '', lokasi: u.lokasi || '', bio: u.bio || '',
      angkatan: u.angkatan ?? '', prodi: u.prodi || '',
    });
  } catch { /* abaikan */ }
}

export async function loadForumUsers(): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(collection(db, 'forumUsers'));
    snap.docs.forEach((d) => mergeUser(d.data() as User));
  } catch { /* abaikan */ }
}
