import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from './data';

/**
 * Firebase: Authentication (email + password) + Cloud Firestore.
 *
 * Konfigurasi diambil dari env (semua NEXT_PUBLIC_ karena dipakai di browser).
 * API key Firebase memang BUKAN rahasia — keamanan dijaga oleh Firestore
 * Security Rules. Cara setup lengkap: lihat docs/firebase-setup.md.
 *
 * Jika env belum diisi, `auth`/`db` bernilai null sehingga aplikasi tetap bisa
 * di-build; halaman Auth menampilkan pesan konfigurasi.
 */
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

// Hindari inisialisasi ganda saat hot-reload Next.js.
const app: FirebaseApp | null = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(cfg))
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;

// ignoreUndefinedProperties: agar objek dengan field undefined (mis. data demo
// forum yang dipersist apa adanya) tidak ditolak Firestore. initializeFirestore
// hanya boleh dipanggil sekali per app — saat hot-reload, fallback ke getFirestore.
function makeDb(a: FirebaseApp): Firestore {
  try {
    return initializeFirestore(a, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(a);
  }
}
export const db: Firestore | null = app ? makeDb(app) : null;

export type Profile = {
  nama?: string;
  email?: string;
  whatsapp?: string;
  prodi?: string;
  angkatan?: string;
  status?: 'alumni' | 'mahasiswa';
  // Informasi tambahan (diisi di Dashboard).
  foto?: string;            // data URL gambar (hasil resize)
  tempatTanggalLahir?: string;
  domisili?: string;
  tempatBekerja?: string;
  posisi?: string;
};

// Email yang diperlakukan sebagai administrator (juga ditegakkan di Firestore Rules).
export const ADMIN_EMAILS = ['fakultasteknikteknologi@gmail.com'];
export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());

// Profil dianggap lengkap bila field wajib terisi: status, angkatan, program studi.
export const isProfileComplete = (p?: Profile | null): boolean =>
  !!(p && p.status && p.angkatan && p.prodi);

/** Bangun objek User aplikasi dari uid + profil Firestore. */
export function buildUser(uid: string, email: string | null, p: Profile): User {
  return {
    id: uid as unknown as number, // Firebase pakai UID string; cukup sebagai identitas unik.
    nama: p.nama || email || 'Alumni',
    angkatan: p.angkatan || '',
    prodi: p.prodi || '',
    role: isAdminEmail(email) ? 'admin' : ((p.status as User['role']) || 'alumni'),
    jabatan: isAdminEmail(email) ? 'Administrator' : (p.posisi || (p.status === 'mahasiswa' ? 'Mahasiswa' : 'Alumni')),
    keahlian: [],
    lokasi: '',
    avatar_color: '#c30010',
    linkedin: '#',
    bio: '',
    tersedia_narasumber: false,
    tersedia_penguji: false,
    tracer_filled: false,
  };
}

/** Ambil profil dari Firestore lalu bangun User. Dipakai saat login & restore sesi. */
export async function fetchAppUser(fbUser: FirebaseUser): Promise<User> {
  const profile = (await fetchProfile(fbUser.uid)) ?? {};
  return buildUser(fbUser.uid, fbUser.email, profile);
}

/** Ambil dokumen profil lengkap dari Firestore. */
export async function fetchProfile(uid: string): Promise<Profile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? (snap.data() as Profile) : null;
  } catch {
    return null;
  }
}

/** Simpan/perbarui sebagian field profil (merge). */
export async function saveProfile(uid: string, data: Partial<Profile>): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  await setDoc(doc(db, 'profiles', uid), data, { merge: true });
}
