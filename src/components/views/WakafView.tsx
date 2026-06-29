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
  onOpenFormulir: () => void;
}

const QUICK_AMOUNTS = [50_000, 100_000, 250_000, 500_000, 1_000_000];

// TODO(fakultas): ganti dengan rekening & QRIS resmi Dana Abadi FTT IPB.
const PAYMENT_INFO = {
  bank: 'Bank BNI',
  rekening: '123-00-1234567-8',
  atasNama: 'Dana Abadi FTT IPB University',
};

type WakafForm = { nama: string; jumlah: string; dana: string; jenis: WakafJenis; kontak: string; pesan: string; anonim: boolean };

type Receipt = { ref: string; nama: string; jumlah: number; dana: string; jenis: WakafJenis; tanggal: number };

export const WakafView = ({ currentUser, onLoginClick, onOpenFormulir }: WakafViewProps) => {
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  const [records, setRecords] = useState<WakafRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const emptyForm: WakafForm = { nama: currentUser?.nama || '', jumlah: '', dana: '', jenis: 'Donasi', kontak: '', pesan: '', anonim: false };
  const [form, setForm] = useState<WakafForm>(emptyForm);

  const load = async () => {
    setLoading(true);
    setRecords(await fetchWakaf());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const { confirmed, totalPokok, perFund, perFundCount, jumlahKontribusi } = useMemo(() => summarize(records), [records]);
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

    const namaTampil = form.anonim ? 'Anonim' : form.nama.trim();
    setSubmitting(true);
    try {
      await addWakaf({
        uid: auth?.currentUser?.uid,
        nama: namaTampil,
        jumlah,
        dana: form.dana,
        jenis: form.jenis,
        kontak: form.kontak.trim() || undefined,
        pesan: form.pesan.trim(),
      });
      setReceipt({
        ref: `FTT-${Date.now().toString(36).toUpperCase()}`,
        nama: namaTampil, jumlah, dana: form.dana, jenis: form.jenis, tanggal: Date.now(),
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

  // Cetak / simpan bukti kontribusi sebagai PDF lewat jendela print terpisah.
  const printReceipt = (r: Receipt) => {
    const tgl = new Date(r.tanggal).toLocaleString('id-ID');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bukti Kontribusi ${r.ref}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:520px;margin:40px auto;padding:0 24px}
      h1{font-size:18px;margin:0 0 4px}.sub{color:#666;font-size:12px;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;font-size:14px}td{padding:8px 0;border-bottom:1px solid #eee}
      td.k{color:#666;width:40%}td.v{text-align:right;font-weight:600}
      .amt{font-size:22px;color:#047857;font-weight:700}.badge{display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;padding:2px 8px;border-radius:999px}
      .foot{margin-top:24px;font-size:11px;color:#888;line-height:1.6}</style></head>
      <body><h1>Bukti Kontribusi — Dana Abadi FTT IPB</h1>
      <div class="sub">No. Referensi: ${r.ref} · ${tgl}</div>
      <table>
        <tr><td class="k">Nama</td><td class="v">${r.nama}</td></tr>
        <tr><td class="k">Jenis</td><td class="v">${r.jenis}</td></tr>
        <tr><td class="k">Dana Tujuan</td><td class="v">${fundLabel(r.dana)}</td></tr>
        <tr><td class="k">Nominal</td><td class="v"><span class="amt">${formatRupiah(r.jumlah)}</span></td></tr>
        <tr><td class="k">Status</td><td class="v"><span class="badge">Menunggu Verifikasi</span></td></tr>
      </table>
      <p class="foot">Dokumen ini adalah tanda terima awal dan belum merupakan bukti pembayaran lunas.
      Kontribusi akan diverifikasi oleh tim Fakultas Teknik dan Teknologi IPB University setelah pembayaran diterima.<br/>
      Terima kasih atas kontribusi Anda untuk keberlanjutan pendidikan FTT.</p>
      <script>window.onload=function(){window.print()}</script></body></html>`;
    const w = window.open('', '_blank', 'width=600,height=700');
    if (!w) { toast({ variant: 'destructive', title: 'Pop-up diblokir', description: 'Izinkan pop-up untuk mencetak bukti.' }); return; }
    w.document.write(html);
    w.document.close();
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
            Berkontribusi untuk keberlanjutan pendidikan. Prinsip kami: <strong>pokok dijaga,
            hanya hasilnya yang disalurkan</strong> untuk beasiswa dan riset — transparan, terbuka untuk semua,
            dan dapat dipantau.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onOpenFormulir} className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-8 py-6 text-lg rounded-xl gap-2">
              <HandCoins className="w-5 h-5" /> Donasi Sekarang
            </Button>
            <Button onClick={openDialog} variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold px-6 py-6 text-base rounded-xl gap-2">
              <Check className="w-5 h-5" /> Catat Kontribusi Langsung
            </Button>
          </div>
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
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700">{formatRupiah(collected)}</span>
                      <span className="text-gray-400">dari {formatRupiah(f.target)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span>{pct}% tercapai</span>
                      <span>{perFundCount[f.key] || 0} kontributor</span>
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
                    {r.kontak && <p className="text-xs text-emerald-700 truncate">Kontak: {r.kontak}</p>}
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
            <DialogTitle>Formulir Kontribusi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jenis</Label>
                <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v as WakafJenis })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Donasi">Donasi</SelectItem>
                    <SelectItem value="Dana Abadi">Dana Abadi</SelectItem>
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
                <Label htmlFor="anonim" className="font-normal cursor-pointer text-sm">Sembunyikan nama (tampil sebagai "Anonim")</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email / WhatsApp <span className="text-gray-400 font-normal">(untuk konfirmasi pembayaran)</span></Label>
              <Input placeholder="email@contoh.com atau 08xxxxxxxxxx" value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Pesan / Harapan (opsional)</Label>
              <Textarea rows={2} value={form.pesan} onChange={(e) => setForm({ ...form, pesan: e.target.value })} placeholder="Semoga bermanfaat..." />
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 space-y-1">
              <p className="font-semibold">Cara pembayaran (transfer ke rekening resmi):</p>
              <p>{PAYMENT_INFO.bank} · <span className="font-mono font-semibold">{PAYMENT_INFO.rekening}</span></p>
              <p>a.n. {PAYMENT_INFO.atasNama}</p>
              <p className="text-emerald-700/80 pt-1">Setelah transfer, simpan bukti. Tim fakultas akan mengonfirmasi kontribusi Anda sebelum tampil di transparansi publik.</p>
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

      {/* Bukti kontribusi (setelah kirim) */}
      <Dialog open={!!receipt} onOpenChange={(o) => { if (!o) setReceipt(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <Check className="w-5 h-5" /> Kontribusi Tercatat
            </DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4 py-1">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>No. Referensi</span><span className="font-mono font-semibold text-gray-700">{receipt.ref}</span>
                </div>
                <div className="text-center py-1">
                  <div className="text-3xl font-extrabold text-emerald-700">{formatRupiah(receipt.jumlah)}</div>
                  <div className="text-xs text-gray-500 mt-1">{receipt.jenis} · {fundLabel(receipt.dana)}</div>
                </div>
                <div className="flex justify-between text-sm border-t border-emerald-200 pt-2">
                  <span className="text-gray-500">Nama</span><span className="font-semibold text-gray-900">{receipt.nama}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">Menunggu Verifikasi</Badge>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border p-3 text-xs text-gray-600">
                Selesaikan pembayaran via transfer ke <strong>{PAYMENT_INFO.bank} {PAYMENT_INFO.rekening}</strong> a.n. {PAYMENT_INFO.atasNama}.
                Tim fakultas akan mengonfirmasi setelah pembayaran diterima.
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReceipt(null)}>Tutup</Button>
            <Button onClick={() => receipt && printReceipt(receipt)} className="bg-emerald-700 hover:bg-emerald-600 text-white gap-2">
              <HandCoins className="w-4 h-4" /> Cetak / Simpan PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
