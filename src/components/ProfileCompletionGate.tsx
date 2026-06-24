"use client";

import React, { useState } from 'react';
import { User } from '@/lib/data';
import { auth, saveProfile } from '@/lib/firebase';
import { STATUS_OPTIONS, PRODI_OPTIONS } from '@/lib/profile-options';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Loader2, LogOut } from 'lucide-react';

export type MandatoryProfile = { status: string; angkatan: string; prodi: string };

interface ProfileCompletionGateProps {
  currentUser: User;
  onComplete: (data: MandatoryProfile) => void;
  onLogout: () => void;
}

const FieldError = ({ msg }: { msg: string }) => (
  <p className="text-red-500 text-xs mt-1">{msg}</p>
);

export const ProfileCompletionGate = ({ currentUser, onComplete, onLogout }: ProfileCompletionGateProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MandatoryProfile>({ status: '', angkatan: '', prodi: '' });
  const [errors, setErrors] = useState<Partial<MandatoryProfile>>({});

  const set = (key: keyof MandatoryProfile, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<MandatoryProfile> = {};
    if (!form.status) errs.status = 'Wajib dipilih';
    if (!form.angkatan.trim()) errs.angkatan = 'Wajib diisi';
    if (!form.prodi) errs.prodi = 'Wajib dipilih';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const uid = auth?.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    try {
      const data: MandatoryProfile = { status: form.status, angkatan: form.angkatan.trim(), prodi: form.prodi };
      await saveProfile(uid, data);
      toast({ title: 'Profil dilengkapi', description: 'Terima kasih! Anda kini bisa mengakses portal.' });
      onComplete(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description: err instanceof Error ? err.message : 'Coba lagi.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-gray-200">
        <CardHeader>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mb-2">
            <ClipboardCheck className="w-6 h-6 text-red-800" />
          </div>
          <CardTitle className="text-lg text-red-900">Lengkapi Profil Anda</CardTitle>
          <CardDescription>
            Halo <span className="font-semibold text-gray-700">{currentUser.nama}</span>! Sebelum melanjutkan,
            mohon lengkapi data wajib berikut. Data ini tidak dapat dilewati.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status <span className="text-red-500">*</span></Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.status && <FieldError msg={errors.status} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gate-angkatan">Angkatan <span className="text-red-500">*</span></Label>
              <Input id="gate-angkatan" placeholder="Contoh: 57" value={form.angkatan} onChange={(e) => set('angkatan', e.target.value)} />
              {errors.angkatan && <FieldError msg={errors.angkatan} />}
            </div>

            <div className="space-y-1.5">
              <Label>Program Studi <span className="text-red-500">*</span></Label>
              <Select value={form.prodi} onValueChange={(v) => set('prodi', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih program studi" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {PRODI_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.prodi && <FieldError msg={errors.prodi} />}
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-red-800 hover:bg-red-700 text-white gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan & Lanjutkan'}
            </Button>
            <button type="button" onClick={onLogout} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
              <LogOut className="w-3 h-3" /> Keluar
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
