"use client";

import React, { useEffect, useState } from 'react';
import { NEWS, User as UserType } from '@/lib/data';
import {
  NewsItem, NewsInput, NEWS_KATEGORI, fetchNews, addNews, updateNews, deleteNews, seedNewsFromStatic,
} from '@/lib/news';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { resizeImage } from "@/lib/image";
import { Search, Calendar, User, ChevronRight, X, Plus, Pencil, Trash2, Loader2, Download, ImagePlus } from 'lucide-react';

interface NewsViewProps {
  currentUser: UserType | null;
}

const seedFromId = (id: string) =>
  Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;

const imageFor = (item: NewsItem) =>
  item.gambar || `https://picsum.photos/seed/${seedFromId(item.id)}/800/600`;

const today = () => new Date().toISOString().slice(0, 10);

type NewsForm = {
  judul: string; kategori: string; penulis: string; tanggal: string;
  ringkasan: string; isi: string; tag: string; featured: boolean; gambar: string;
};

// Berita contoh statis -> bentuk NewsItem (read-only, sebelum di-import ke DB).
const staticAsItems = (): NewsItem[] =>
  NEWS.map((n) => ({
    id: `static-${n.id}`, judul: n.judul, kategori: n.kategori, penulis: n.penulis,
    tanggal: n.tanggal, ringkasan: n.ringkasan, isi: '', tag: n.tag, featured: n.featured, gambar: '',
  }));

export const NewsView = ({ currentUser }: NewsViewProps) => {
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  const [items, setItems] = useState<NewsItem[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Dialog tambah/edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const emptyForm: NewsForm = {
    judul: '', kategori: '', penulis: currentUser?.nama || 'Admin FTT', tanggal: today(),
    ringkasan: '', isi: '', tag: '', featured: false, gambar: '',
  };
  const [form, setForm] = useState<NewsForm>(emptyForm);

  const load = async () => {
    setLoading(true);
    const data = await fetchNews();
    if (data.length === 0) {
      setItems(staticAsItems());
      setUsingFallback(true);
    } else {
      setItems(data);
      setUsingFallback(false);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = ['Semua', ...NEWS_KATEGORI];
  const filtered = items.filter((n) => {
    const matchCat = filter === 'Semua' || n.kategori === filter;
    const matchSearch = n.judul.toLowerCase().includes(search.toLowerCase()) ||
      n.ringkasan.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setForm({
      judul: item.judul, kategori: item.kategori, penulis: item.penulis, tanggal: item.tanggal,
      ringkasan: item.ringkasan, isi: item.isi || '', tag: item.tag.join(', '),
      featured: !!item.featured, gambar: item.gambar || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.judul.trim() || !form.kategori || !form.ringkasan.trim()) {
      toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Judul, kategori, dan ringkasan wajib diisi.' });
      return;
    }
    setSaving(true);
    try {
      const payload: NewsInput = {
        judul: form.judul.trim(), kategori: form.kategori, penulis: form.penulis.trim() || 'Admin FTT',
        tanggal: form.tanggal || today(), ringkasan: form.ringkasan.trim(), isi: form.isi.trim(),
        tag: form.tag.split(',').map((t) => t.trim()).filter(Boolean),
        featured: form.featured, gambar: form.gambar.trim(),
      };
      if (editingId) {
        await updateNews(editingId, payload);
        toast({ title: 'Berita diperbarui' });
      } else {
        await addNews(payload);
        toast({ title: 'Berita ditambahkan' });
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan', description: err instanceof Error ? err.message : 'Coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NewsItem) => {
    if (!window.confirm(`Hapus berita "${item.judul}"?`)) return;
    try {
      await deleteNews(item.id);
      toast({ title: 'Berita dihapus' });
      await load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal menghapus', description: err instanceof Error ? err.message : 'Coba lagi.' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // izinkan unggah file yang sama lagi
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'File harus berupa gambar' });
      return;
    }
    setUploadingImg(true);
    try {
      const dataUrl = await resizeImage(file, 1000, 0.75);
      setForm((f) => ({ ...f, gambar: dataUrl }));
    } catch {
      toast({ variant: 'destructive', title: 'Gagal memproses gambar' });
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedNewsFromStatic();
      toast({ title: 'Berita contoh diimpor', description: 'Sekarang bisa diedit/dihapus.' });
      await load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal impor', description: err instanceof Error ? err.message : 'Coba lagi.' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Berita Alumni</h1>
          <p className="text-gray-600">Jejak kiprah dan prestasi alumni FTT IPB di seluruh dunia.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {usingFallback && (
              <Button variant="outline" onClick={handleSeed} disabled={seeding} className="gap-2 border-red-700 text-red-800">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Impor Contoh
              </Button>
            )}
            <Button onClick={openAdd} className="bg-red-800 hover:bg-red-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Tambah Berita
            </Button>
          </div>
        )}
      </div>

      {isAdmin && usingFallback && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          Menampilkan berita contoh (belum di database). Klik <strong>Impor Contoh</strong> agar bisa diedit, atau <strong>Tambah Berita</strong> untuk membuat baru.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat ? "bg-red-800 text-white shadow-md shadow-red-200" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Cari berita..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-800" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? filtered.map((article) => (
            <Card key={article.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group relative">
              {isAdmin && !usingFallback && (
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(article); }} className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow text-gray-700" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(article); }} className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow text-red-600" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="h-56 overflow-hidden relative cursor-pointer" onClick={() => setSelectedArticle(article)}>
                <img src={imageFor(article)} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-4 left-4 bg-amber-500 text-amber-950 font-bold border-none">{article.kategori}</Badge>
              </div>
              <CardContent className="p-6 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.tanggal}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-red-800">{article.judul}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">{article.ringkasan}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-1 flex-wrap">
                    {article.tag.map((t) => (
                      <span key={t} className="text-[10px] bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-full border border-red-100">#{t}</span>
                    ))}
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900">Tidak ada berita ditemukan</h3>
              <p className="text-gray-500">Coba kata kunci atau kategori lain.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button onClick={() => setSelectedArticle(null)} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-md z-10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-full bg-gray-100 flex items-center justify-center">
              <img src={imageFor(selectedArticle)} alt="Banner" className="w-full max-h-[70vh] object-contain" />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <Badge className="bg-red-800">{selectedArticle.kategori}</Badge>
                <div className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedArticle.tanggal}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> {selectedArticle.penulis}</div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">{selectedArticle.judul}</h2>
              <div className="prose prose-red max-w-none text-gray-700 leading-loose">
                <p className="text-lg font-medium text-gray-900 mb-4">{selectedArticle.ringkasan}</p>
                {selectedArticle.isi && <p className="whitespace-pre-line">{selectedArticle.isi}</p>}
              </div>
              <div className="mt-10 pt-6 border-t flex flex-wrap gap-2">
                {selectedArticle.tag.map((t) => <Badge key={t} variant="outline" className="text-gray-500 border-gray-200">#{t}</Badge>)}
              </div>
              <div className="mt-10">
                <Button onClick={() => setSelectedArticle(null)} className="bg-red-800 w-full py-6 text-lg font-bold rounded-xl shadow-lg shadow-red-200">Tutup Berita</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add / Edit Dialog (admin) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Judul *</Label>
              <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Judul berita" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategori *</Label>
                <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>{NEWS_KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal</Label>
                <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Penulis</Label>
              <Input value={form.penulis} onChange={(e) => setForm({ ...form, penulis: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Ringkasan *</Label>
              <Textarea rows={2} value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} placeholder="Ringkasan singkat" />
            </div>
            <div className="space-y-1.5">
              <Label>Isi Berita</Label>
              <Textarea rows={4} value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} placeholder="Isi lengkap (opsional)" />
            </div>
            <div className="space-y-1.5">
              <Label>Tag (pisahkan dengan koma)</Label>
              <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Prestasi, AgriTech" />
            </div>
            <div className="space-y-1.5">
              <Label>Gambar</Label>
              {form.gambar && (
                <div className="relative">
                  <img src={form.gambar} alt="Pratinjau" className="w-full h-36 object-cover rounded-md border" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gambar: '' })}
                    className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-md shadow text-red-600"
                    title="Hapus gambar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {form.gambar ? 'Ganti Gambar' : 'Unggah Gambar'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <Input
                value={form.gambar.startsWith('data:') ? '' : form.gambar}
                onChange={(e) => setForm({ ...form, gambar: e.target.value })}
                placeholder="atau tempel URL gambar (https://...)"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="featured" checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: !!c })} />
              <Label htmlFor="featured" className="font-normal cursor-pointer">Tandai sebagai unggulan (featured)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-red-800 hover:bg-red-700 text-white gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : (editingId ? 'Simpan' : 'Tambah')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
