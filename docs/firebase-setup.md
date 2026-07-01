# Setup Firebase (Authentication + Cloud Firestore)

Halaman Auth (`src/components/views/AuthView.tsx`) memakai **Firebase Authentication**
(email + password). Data profil (nama, WhatsApp, prodi, angkatan) disimpan ke
**Cloud Firestore** pada koleksi `profiles/{uid}`.

```
Form Daftar ─▶ createUserWithEmailAndPassword(email, password)
                       │
                       ├─▶ Firebase Auth  (akun + password ter-hash)
                       └─▶ Firestore profiles/{uid}  (nama, whatsapp, prodi, angkatan, email)
Form Masuk  ─▶ signInWithEmailAndPassword(email, password) ─▶ baca profiles/{uid}
```

---

## Langkah 1 — Buat project Firebase

1. Buka <https://console.firebase.google.com> → **Add project** → beri nama
   (mis. `alumni-hub-f`) → ikuti wizard (Google Analytics boleh dimatikan).

## Langkah 2 — Tambahkan Web App & salin config

1. Di project, klik ikon **</> (Web)** untuk "Add app to get started".
2. Beri nickname (mis. `alumni-web`), **Register app**.
3. Akan muncul object `firebaseConfig`. Salin nilainya ke `.env.local`:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...                 (apiKey)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com (authDomain)
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx                  (projectId)
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com  (storageBucket)
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000       (messagingSenderId)
   NEXT_PUBLIC_FIREBASE_APP_ID=1:000:web:xxxx            (appId)
   ```

   > Nilai-nilai ini memang tampil di browser dan itu normal — keamanan dijaga
   > oleh Security Rules (Langkah 5), bukan oleh kerahasiaan API key.

## Langkah 3 — Aktifkan metode Authentication

1. Menu kiri: **Build → Authentication → Get started**.
2. Tab **Sign-in method**:
   - **Email/Password** → **Enable** → **Save**. (Biarkan "Email link" mati.)
   - **Google** → **Enable** → pilih email dukungan → **Save**.
     Diperlukan agar tombol "Masuk/Daftar dengan Google" berfungsi.
3. Tab **Settings → Authorized domains**: `localhost` sudah ada secara default.
   Untuk produksi, tambahkan domain Vercel Anda di sini.

## Langkah 4 — Buat Cloud Firestore

1. Menu kiri: **Build → Firestore Database → Create database**.
2. Pilih lokasi terdekat (mis. `asia-southeast1` / Singapore).
3. Mulai dengan **Production mode** (kita atur rules di Langkah 5).

## Langkah 5 — Pasang Security Rules

Di **Firestore → Rules**, ganti isinya menjadi:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Email administrator (samakan dengan ADMIN_EMAILS di src/lib/firebase.ts).
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == 'fakultasteknikteknologi@gmail.com';
    }

    // Tiap user hanya boleh membaca/menulis dokumen profilnya sendiri.
    match /profiles/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Berita: semua boleh baca; hanya admin boleh tambah/edit/hapus.
    match /news/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Dana Abadi & Wakaf:
    //  - semua boleh baca (dashboard transparansi publik & dinding donatur)
    //  - SIAPA PUN (tanpa akun) boleh membuat kontribusi, TAPI wajib status
    //    "Menunggu Konfirmasi" + field valid (mencegah penyalahgunaan)
    //  - hanya admin boleh konfirmasi/ubah/hapus
    match /wakaf/{id} {
      allow read: if true;
      allow create: if request.resource.data.status == 'Menunggu Konfirmasi'
        && request.resource.data.nama is string
        && request.resource.data.jumlah is number
        && request.resource.data.jumlah > 0;
      allow update, delete: if isAdmin();
    }

    // Forum demo (Career Hub, AlumniConnect, Forum Riset). Model "dokumen utuh":
    // satu thread/loker = satu dokumen (likes, reply, proposal tersimpan di dalamnya).
    //  - baca: publik
    //  - buat/ubah: user login (like/reply orang lain pun mengubah dok induk)
    //  - hapus: admin atau pemilik
    match /jobs/{id} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if isAdmin() || (request.auth != null && resource.data.posted_by == request.auth.uid);
    }
    match /connectThreads/{id} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if isAdmin() || (request.auth != null && resource.data.authorId == request.auth.uid);
    }
    match /risetThreads/{id} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if isAdmin() || (request.auth != null && resource.data.postedBy == request.auth.uid);
    }
    // Registry penulis forum (nama/peran/avatar) agar tampil di UI.
    match /forumUsers/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

> Jika nanti email admin diganti, perbarui di **dua** tempat: fungsi `isAdmin()`
> di rules ini dan `ADMIN_EMAILS` di `src/lib/firebase.ts`.

Klik **Publish**.

## Langkah 6 — Restart & uji

1. Restart server dev (`npm run dev`) agar env terbaca.
2. Buka app → **Masuk → Daftar**, isi form, **Daftar**.
   Firebase langsung me-login-kan setelah daftar (tanpa konfirmasi email).
3. Cek Firebase Console:
   - **Authentication → Users** → ada user baru.
   - **Firestore → Data → profiles** → ada dokumen berisi nama/whatsapp/prodi/angkatan.
4. **Logout**, lalu **Masuk** dengan email & password → login berhasil
   (sesi bertahan walau halaman di-refresh).

## Produksi (Vercel)

Tambahkan keenam env var `NEXT_PUBLIC_FIREBASE_*` di
**Vercel → Project → Settings → Environment Variables**, lalu redeploy.
Tambahkan juga domain Vercel Anda di **Firebase → Authentication → Settings →
Authorized domains**.

### Troubleshooting

| Gejala | Solusi |
| --- | --- |
| Banner "Firebase belum dikonfigurasi" | Env kosong / server belum di-restart. |
| `auth/operation-not-allowed` | Email/Password belum di-Enable (Langkah 3). |
| `Missing or insufficient permissions` | Security Rules belum di-publish (Langkah 5). |
| `auth/invalid-credential` saat login | Email/password salah, atau akun belum dibuat. |
| Profil tidak tersimpan | Firestore belum dibuat (Langkah 4) atau rules menolak. |
