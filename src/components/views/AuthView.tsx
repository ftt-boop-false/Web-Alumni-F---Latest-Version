"use client";

import React, { useState } from 'react';
import { User } from '@/lib/data';
import { auth, db, isFirebaseConfigured, buildUser, fetchAppUser, fetchProfile, saveProfile } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,
  GoogleAuthProvider, signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, GraduationCap, Loader2 } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
  initialMode?: 'login' | 'register';
}

const FieldError = ({ msg }: { msg: string }) => (
  <p className="text-red-500 text-xs mt-1">{msg}</p>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-4 h-4">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

export const AuthView = ({ onLogin, initialMode = 'login' }: AuthViewProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  const [regForm, setRegForm] = useState({ nama: '', email: '', password: '' });
  const [regErrors, setRegErrors] = useState<{ nama?: string; email?: string; password?: string }>({});

  const notConfigured = () => {
    toast({
      variant: 'destructive',
      title: 'Firebase belum dikonfigurasi',
      description: 'Isi kredensial NEXT_PUBLIC_FIREBASE_* di .env.local.',
    });
  };

  const firebaseErrorMessage = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email atau password salah.';
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/email-already-in-use':
        return 'Email sudah terdaftar. Silakan masuk.';
      case 'auth/weak-password':
        return 'Password terlalu lemah (minimal 6 karakter).';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Coba lagi nanti.';
      case 'auth/account-exists-with-different-credential':
        return 'Akun sudah ada dengan metode masuk lain.';
      case 'auth/operation-not-allowed':
        return 'Metode masuk ini belum diaktifkan di Firebase.';
      default:
        return err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.';
    }
  };

  const handleGoogle = async () => {
    if (!auth) return notConfigured();
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const u = cred.user;

      // Isi informasi publik dari Google ke profil (hanya field yang masih kosong).
      const existing = await fetchProfile(u.uid);
      const patch: Record<string, unknown> = {};
      if (!existing?.nama && u.displayName) patch.nama = u.displayName;
      if (!existing?.email && u.email) patch.email = u.email;
      if (!existing?.foto && u.photoURL) patch.foto = u.photoURL;
      if (!existing) patch.createdAt = Date.now();
      if (db && Object.keys(patch).length) await saveProfile(u.uid, patch);

      onLogin(await fetchAppUser(u));
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      toast({ variant: 'destructive', title: 'Masuk dengan Google gagal', description: firebaseErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof loginErrors = {};
    if (!loginForm.email.trim()) errs.email = 'Email wajib diisi';
    if (!loginForm.password) errs.password = 'Password wajib diisi';
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!auth) return notConfigured();

    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginForm.email.trim(), loginForm.password);
      onLogin(await fetchAppUser(cred.user));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Login Gagal', description: firebaseErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof regErrors = {};
    if (!regForm.nama.trim()) errs.nama = 'Wajib diisi';
    if (!regForm.email.trim()) errs.email = 'Wajib diisi';
    if (!regForm.password) errs.password = 'Wajib diisi';
    else if (regForm.password.length < 6) errs.password = 'Minimal 6 karakter';
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!auth || !db) return notConfigured();

    setSubmitting(true);
    try {
      const email = regForm.email.trim();
      const cred = await createUserWithEmailAndPassword(auth, email, regForm.password);
      await updateProfile(cred.user, { displayName: regForm.nama.trim() });

      const profile = { nama: regForm.nama.trim(), email };
      await setDoc(doc(db, 'profiles', cred.user.uid), { ...profile, createdAt: Date.now() });

      toast({ title: 'Pendaftaran Berhasil', description: 'Lengkapi profil Anda di Dashboard.' });
      onLogin(buildUser(cred.user.uid, email, profile));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Pendaftaran Gagal', description: firebaseErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-red-50/50 to-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-800 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Alumni Hub F IPB</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun alumni baru'}
          </p>
        </div>

        {/* Toggle Masuk / Daftar */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors
              ${mode === 'login' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LogIn className="w-4 h-4" /> Masuk
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors
              ${mode === 'register' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus className="w-4 h-4" /> Daftar
          </button>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            Firebase belum dikonfigurasi. Isi kredensial <strong>NEXT_PUBLIC_FIREBASE_*</strong> di{' '}
            <code>.env.local</code>, lalu restart server.
          </div>
        )}

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-900">{mode === 'login' ? 'Masuk' : 'Daftar Akun Alumni'}</CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Gunakan email & password, atau akun Google.' : 'Cukup nama, email, dan password. Lengkapi sisanya di Dashboard.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tombol Google (kedua mode) */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full gap-2 border-gray-300"
            >
              <GoogleIcon /> {mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
            </Button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400">atau</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* ===== LOGIN ===== */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="email@contoh.com" value={loginForm.email}
                    onChange={(e) => { setLoginForm({ ...loginForm, email: e.target.value }); setLoginErrors((p) => ({ ...p, email: undefined })); }} />
                  {loginErrors.email && <FieldError msg={loginErrors.email} />}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="Masukkan password" value={loginForm.password}
                    onChange={(e) => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginErrors((p) => ({ ...p, password: undefined })); }} />
                  {loginErrors.password && <FieldError msg={loginErrors.password} />}
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-red-800 hover:bg-red-700 text-white gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><LogIn className="w-4 h-4" /> Masuk</>}
                </Button>
                <p className="text-center text-xs text-gray-500">
                  Belum punya akun?{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-red-800 font-semibold hover:underline">Daftar di sini</button>
                </p>
              </form>
            )}

            {/* ===== REGISTRASI ===== */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input id="reg-nama" placeholder="Contoh: Budi Santoso, S.T." value={regForm.nama} onChange={(e) => { setRegForm({ ...regForm, nama: e.target.value }); setRegErrors((p) => ({ ...p, nama: undefined })); }} />
                  {regErrors.nama && <FieldError msg={regErrors.nama} />}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email <span className="text-red-500">*</span></Label>
                  <Input id="reg-email" type="email" placeholder="email@contoh.com" value={regForm.email} onChange={(e) => { setRegForm({ ...regForm, email: e.target.value }); setRegErrors((p) => ({ ...p, email: undefined })); }} />
                  {regErrors.email && <FieldError msg={regErrors.email} />}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password <span className="text-red-500">*</span></Label>
                  <Input id="reg-password" type="password" placeholder="Minimal 6 karakter" value={regForm.password} onChange={(e) => { setRegForm({ ...regForm, password: e.target.value }); setRegErrors((p) => ({ ...p, password: undefined })); }} />
                  {regErrors.password && <FieldError msg={regErrors.password} />}
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-red-800 hover:bg-red-700 text-white gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><UserPlus className="w-4 h-4" /> Daftar</>}
                </Button>
                <p className="text-center text-xs text-gray-500">
                  Sudah punya akun?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-red-800 font-semibold hover:underline">Masuk di sini</button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
