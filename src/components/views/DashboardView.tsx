"use client";

import React, { useEffect, useState } from 'react';
import { User } from '@/lib/data';
import { auth, fetchProfile, saveProfile, Profile } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { resizeImage } from "@/lib/image";
import { STATUS_OPTIONS, PRODI_OPTIONS } from "@/lib/profile-options";
import { Camera, Save, Loader2, Mail, Phone, GraduationCap, MapPin, Building2, Briefcase, Calendar } from 'lucide-react';

interface DashboardViewProps {
  currentUser: User | null;
}

const statusLabel = (s?: string) =>
  s === 'mahasiswa' ? 'Mahasiswa' : s === 'alumni' ? 'Alumni' : '';

export const DashboardView = ({ currentUser }: DashboardViewProps) => {
  const { toast } = useToast();
  const uid = auth?.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const [form, setForm] = useState({
    nama: '',
    status: '',
    prodi: '',
    angkatan: '',
    whatsapp: '',
    foto: '',
    tempatTanggalLahir: '',
    domisili: '',
    tempatBekerja: '',
    posisi: '',
  });

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    fetchProfile(uid).then((p) => {
      if (p) {
        setProfile(p);
        setForm({
          nama: p.nama || currentUser?.nama || '',
          status: p.status || '',
          prodi: p.prodi || '',
          angkatan: p.angkatan || '',
          whatsapp: p.whatsapp || '',
          foto: p.foto || '',
          tempatTanggalLahir: p.tempatTanggalLahir || '',
          domisili: p.domisili || '',
          tempatBekerja: p.tempatBekerja || '',
          posisi: p.posisi || '',
        });
      } else {
        setForm((f) => ({ ...f, nama: currentUser?.nama || '' }));
      }
      setLoading(false);
    });
  }, [uid]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'File harus berupa gambar' });
      return;
    }
    try {
      const dataUrl = await resizeImage(file, 256);
      setForm((f) => ({ ...f, foto: dataUrl }));
    } catch {
      toast({ variant: 'destructive', title: 'Gagal memproses gambar' });
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    if (!form.nama.trim()) {
      toast({ variant: 'destructive', title: 'Nama wajib diisi' });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Profile> = {
        nama: form.nama.trim(),
        status: (form.status || undefined) as Profile['status'],
        prodi: form.prodi,
        angkatan: form.angkatan,
        whatsapp: form.whatsapp,
        foto: form.foto,
        tempatTanggalLahir: form.tempatTanggalLahir,
        domisili: form.domisili,
        tempatBekerja: form.tempatBekerja,
        posisi: form.posisi,
      };
      await saveProfile(uid, payload);
      setProfile((p) => ({ ...p, ...payload }));
      toast({ title: 'Tersimpan', description: 'Informasi profil Anda berhasil diperbarui.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description: err instanceof Error ? err.message : 'Coba lagi nanti.',
      });
    } finally {
      setSaving(false);
    }
  };

  const nama = profile.nama || currentUser?.nama || 'Pengguna';
  const initials = nama.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const tag = [statusLabel(profile.status), profile.angkatan].filter(Boolean).join(' - ');

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-800" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Kelola profil dan informasi Anda.</p>
      </div>

      {/* ===== Kartu Profil ===== */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-900 to-red-700 h-20" />
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              {form.foto ? <AvatarImage src={form.foto} alt={nama} /> : null}
              <AvatarFallback style={{ backgroundColor: currentUser?.avatar_color || '#c30010' }} className="text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900">{nama}</h2>
              {tag && <p className="text-sm font-medium text-red-800">{tag}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="w-4 h-4 text-gray-400" /> {profile.prodi || '—'}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" /> {profile.email || currentUser?.nama || '—'}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" /> {profile.whatsapp || '—'}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" /> {profile.posisi || '—'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Informasi Tambahan (editable) ===== */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-base text-red-900">Informasi Tambahan</CardTitle>
          <CardDescription>Lengkapi data berikut untuk memperkaya profil Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="nama" placeholder="Nama lengkap dan gelar" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </div>

          {/* Upload foto */}
          <div className="space-y-2">
            <Label>Foto Profil</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                {form.foto ? <AvatarImage src={form.foto} alt="Preview" /> : null}
                <AvatarFallback style={{ backgroundColor: currentUser?.avatar_color || '#c30010' }} className="text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Camera className="w-4 h-4" /> Unggah Foto
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
            <p className="text-xs text-gray-400">Gambar otomatis diperkecil sebelum disimpan.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="angkatan">Angkatan</Label>
              <Input id="angkatan" placeholder="Contoh: 57" value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label><GraduationCap className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Program Studi</Label>
            <Select value={form.prodi} onValueChange={(v) => setForm({ ...form, prodi: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih program studi" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {PRODI_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wa"><Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Nomor WhatsApp</Label>
            <Input id="wa" placeholder="08xxxxxxxxxx" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ttl"><Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Tempat, Tanggal Lahir</Label>
            <Input id="ttl" placeholder="Contoh: Bogor, 17 Agustus 1999" value={form.tempatTanggalLahir} onChange={(e) => setForm({ ...form, tempatTanggalLahir: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="domisili"><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Domisili</Label>
            <Input id="domisili" placeholder="Contoh: Jakarta Selatan" value={form.domisili} onChange={(e) => setForm({ ...form, domisili: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kerja"><Building2 className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Tempat Saat Ini Bekerja</Label>
            <Input id="kerja" placeholder="Contoh: PT Indofood Sukses Makmur" value={form.tempatBekerja} onChange={(e) => setForm({ ...form, tempatBekerja: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="posisi"><Briefcase className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Posisi Saat Ini</Label>
            <Input id="posisi" placeholder="Contoh: Supply Chain Analyst" value={form.posisi} onChange={(e) => setForm({ ...form, posisi: e.target.value })} />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-red-800 hover:bg-red-700 text-white gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
