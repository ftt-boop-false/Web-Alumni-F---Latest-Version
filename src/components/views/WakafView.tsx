"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { User } from '@/lib/data';
import { auth } from '@/lib/firebase';
import {
  WakafRecord, WakafJenis, WAKAF_FUNDS, fundLabel, formatRupiah,
  fetchWakaf, addWakaf, confirmWakaf, deleteWakaf, summarize,
} from '@/lib/wakaf';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Landmark, HandCoins, ShieldCheck, Users, Loader2, Check, Trash2, Heart, Sparkles } from 'lucide-react';

interface WakafViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

const QUICK_AMOUNTS = [50_000, 100_000, 250_000, 500_000, 1_000_000];

type WakafForm = { nama: string; jumlah: string; dana: string; jenis: WakafJenis; pesan: string; anonim: boolean };

export const WakafView = ({ currentUser, onLoginClick }: WakafViewProps) => {
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  const [records, setRecords] = useState<WakafRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const emptyForm: WakafForm = { nama: currentUser?.nama || '', jumlah: '', dana: '', jenis: 'Donasi', pesan: '', anonim: false };
  const [form, setForm] = useState<WakafForm>(emptyForm);

  const load = async () => {
    setLoading(true);
    setRecords(await fetchWakaf());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const { confirmed, totalPokok, perFund, jumlahKontribusi } = useMemo(() => summarize(records), [records]);
  const pending = records.filter((r) => r.status === 'Menunggu Konfirmasi');

  const openDialog = () => {
    // Terbuka untuk semua — tidak wajib punya akun.
    setForm({ ...emptyForm, nama: currentUser?.nama || '' });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const jumlah = Number(form.jumlah);
    if (!form.dana) { toast({ variant: 'destructive', title: 'Pilih dana tujuan' }); return; }
    if (!jumlah || jumlah < 10000) { toast({ variant: 'destructive', title: 'Nominal tidak valid', description: 'Minimal Rp 10.000.' }); return; }
    if (!form.anonim && !form.nama.trim()) { toast({ variant: 'destructive', title: 'Nama wajib diisi' }); return; }

    setSubmitting(true);
    try {
      await addWakaf({
        uid: auth?.currentUser?.uid,
        nama: form.anonim ? 'Hamba Allah' : form.nama.trim(),
        jumlah,
        dana: form.dana,
        jenis: form.jenis,
        pesan: form.pesan.trim(),
      });
      toast({ title: 'Terima kasih!', description: 'Kontribusi Anda tercatat dan menunggu konfirmasi admin.' });
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal mengirim', description: err instanceof Error ? err.message : 'Coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id: string) => {
    setBusyId(id);
    try { await confirmWakaf(id); toast({ title: 'Kontribusi dikonfirmasi' }); await load(); }
    catch (err) { toast({ variant: 'destructive', title: 'Gagal', description: err instanceof Error ? err.message : 'Coba lagi.' }); }
    finally { setBusyId(null); }
  };

  const handleDelete = async (r: WakafRecord) => {
    if (!window.confirm(`Hapus kontribusi ${r.nama} (${formatRupiah(r.jumlah)})?`)) return;
    setBusyId(r.id);
    try { await deleteWakaf(r.id); toast({ title: 'Dihapus' }); await load(); }
    catch (err) { toast({ variant: 'destructive', title: 'Gagal', description: err instanceof Error ? err.message : 'Coba lagi.' }); }
    finally { setBusyId(null); }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 overflow-hidden text-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
            <Landmark className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Endowment Fund (Dana Abadi) FTT</h1>
          <p className="text-emerald-50/90 max-w-2xl mx-auto mb-6">
            Berwakaf untuk keberlanjutan pendidikan. Prinsip kami: <strong>pokok dijaga abadi,
            hanya hasilnya yang disalurkan</strong> untuk beasiswa dan riset — transparan dan dapat dipantau.
          </p>
          <Button onClick={openDialog} className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-8 py-6 text-lg rounded-xl gap-2">
            <HandCoins className="w-5 h-5" /> Donasi Sekarang
          </Button>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Transparansi ringkas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-20 relative z-10">
          <Card className="border-none shadow-xl">
            <CardContent className="p-6 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatRupiah(totalPokok)}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pokok Terhimpun</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardContent className="p-6 text-center">
              <Users className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{jumlahKontribusi}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kontribusi Terkonfirmasi</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardContent className="p-6 text-center">
              <Heart className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{WAKAF_FUNDS.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Program Dana</div>
            </CardContent>
          </Card>
        </div>

        {/* Dana tujuan + progress */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Program Endowment Fund (Dana Abadi)</h2>
          <p className="text-gray-500 mb-6 text-sm">Pilih ke mana kontribusi Anda dialokasikan.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WAKAF_FUNDS.map((f) => {
              const collected = perFund[f.key] || 0;
              const pct = Math.min(100, Math.round((collected / f.target) * 100));
              return (
                <Card key={f.key} className="border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-1">{f.label}</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">{f.desc}</p>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-700">{formatRupiah(collected)}</span>
                      <span className="text-gray-400"> terhimpun</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Panel Admin */}
        {isAdmin && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="text-base text-amber-900">Panel Admin — Verifikasi Kontribusi</CardTitle>
              <CardDescription>Konfirmasi kontribusi agar dihitung ke total transparansi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pending.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada kontribusi menunggu konfirmasi.</p>
              ) : pending.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 bg-white rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{r.nama} — {formatRupiah(r.jumlah)}</p>
                    <p className="text-xs text-gray-500">{r.jenis} · {fundLabel(r.dana)}{r.pesan ? ` · "${r.pesan}"` : ''}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleConfirm(r.id)} disabled={busyId === r.id} className="bg-emerald-700 hover:bg-emerald-600 text-white gap-1">
                      {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Konfirmasi
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(r)} disabled={busyId === r.id} className="text-red-600 border-red-200">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Donor wall */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Dinding Donatur
          </h2>
          <p className="text-gray-500 mb-6 text-sm">Terima kasih kepada para kontributor yang telah terkonfirmasi.</p>
          {loading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-emerald-700" /></div>
          ) : confirmed.length === 0 ? (
            <Card className="border-dashed border-gray-200">
              <CardContent className="p-10 text-center text-gray-500">
                Belum ada kontribusi terkonfirmasi. Jadilah yang pertama berkontribusi!
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {confirmed.slice(0, 12).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{r.nama}</p>
                    <p className="text-xs text-gray-500">
                      <Badge variant="outline" className="mr-1 text-[10px] border-emerald-200 text-emerald-700">{r.jenis}</Badge>
                      {fundLabel(r.dana)}
                    </p>
                    {r.pesan && <p className="text-xs text-gray-400 italic mt-1 truncate">"{r.pesan}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-700">{formatRupiah(r.jumlah)}</p>
                    {r.createdAt && <p className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString('id-ID')}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Dialog Donasi/Wakaf */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donasi / Wakaf</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jenis</Label>
                <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v as WakafJenis })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Donasi">Donasi</SelectItem>
                    <SelectItem value="Wakaf Tunai">Wakaf Tunai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dana Tujuan</Label>
                <Select value={form.dana} onValueChange={(v) => setForm({ ...form, dana: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>{WAKAF_FUNDS.map((f) => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nominal (Rp)</Label>
              <Input type="number" min={10000} placeholder="Contoh: 100000" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_AMOUNTS.map((a) => (
                  <button key={a} type="button" onClick={() => setForm({ ...form, jumlah: String(a) })}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-emerald-500 hover:text-emerald-700">
                    {formatRupiah(a)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nama Tampil</Label>
              <Input placeholder="Nama Anda" value={form.nama} disabled={form.anonim} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="anonim" checked={form.anonim} onCheckedChange={(c) => setForm({ ...form, anonim: !!c })} />
                <Label htmlFor="anonim" className="font-normal cursor-pointer text-sm">Sembunyikan nama (tampil sebagai "Hamba Allah")</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Pesan / Doa (opsional)</Label>
              <Textarea rows={2} value={form.pesan} onChange={(e) => setForm({ ...form, pesan: e.target.value })} placeholder="Semoga bermanfaat..." />
            </div>

            <div className="rounded-lg bg-gray-50 border p-3 text-xs text-gray-500">
              Setelah dikirim, kontribusi akan diverifikasi admin sebelum tampil di transparansi publik.
              Konfirmasi pembayaran dilakukan melalui kanal resmi fakultas.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Batal</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-700 hover:bg-emerald-600 text-white gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <><HandCoins className="w-4 h-4" /> Kirim Kontribusi</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
