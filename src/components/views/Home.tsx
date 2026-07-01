"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NEWS, User } from '@/lib/data';
import { NewsItem, fetchNews } from '@/lib/news';
import { ArrowRight, Trophy, Briefcase, FlaskConical, Users, GraduationCap, Building } from 'lucide-react';

const seedFromId = (id: string) => Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0) % 1000;
const newsImage = (item: NewsItem) => item.gambar || `https://picsum.photos/seed/${seedFromId(item.id)}/600/400`;

// Berita demo (fallback bila koleksi Firestore masih kosong).
const fallbackNews: NewsItem[] = NEWS.filter((n) => n.featured).slice(0, 3).map((n) => ({
  id: `static-${n.id}`, judul: n.judul, kategori: n.kategori, penulis: n.penulis,
  tanggal: n.tanggal, ringkasan: n.ringkasan, isi: '', tag: n.tag, featured: n.featured, gambar: '',
}));

interface HomeViewProps {
  onStart: () => void;
  onNavigateToNews: () => void;
  onRegister: () => void;
  currentUser: User | null;
  onOpenDashboard: () => void;
  onNavigate: (view: string) => void;
}

export const HomeView = ({ onStart, onNavigateToNews, onRegister, currentUser, onOpenDashboard, onNavigate }: HomeViewProps) => {
  const [latestNews, setLatestNews] = useState<NewsItem[]>(fallbackNews);

  useEffect(() => {
    fetchNews().then((data) => {
      if (data.length > 0) setLatestNews(data.slice(0, 3));
    });
  }, []);

  const stats = [
    { label: "Alumni Terdaftar", value: "2.847", icon: <Users className="text-red-600" /> },
    { label: "Loker Aktif", value: "156", icon: <Briefcase className="text-amber-600" /> },
    { label: "Kolaborasi Riset", value: "48", icon: <FlaskConical className="text-blue-600" /> },
    { label: "Serapan Kerja", value: "93%", icon: <GraduationCap className="text-red-700" /> },
  ];

  const features = [
    { title: "Career Hub", desc: "Temukan peluang karir eksklusif dari jaringan alumni FTT.", icon: "💼", view: "career" },
    { title: "Expert Registry", desc: "Hubungi pakar dan narasumber untuk kolaborasi profesional.", icon: "🎓", view: "expert" },
    { title: "Tracer Study", desc: "Bantu kami meningkatkan kualitas pendidikan FTT IPB.", icon: "📝", view: "tracer" },
    { title: "Forum Riset", desc: "Ruang kolaborasi teknis antara alumni dan akademisi.", icon: "🔬", view: "riset" },
    { title: "AlumniConnect", desc: "Diskusi santai dan networking antar angkatan.", icon: "🤝", view: "alumniconnect" },
    { title: "Dashboard", desc: "Kelola portofolio dan kontribusi Anda di ekosistem.", icon: "📊", view: "dashboard" },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-red-900 via-red-800 to-red-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <img src="/logo.svg" alt="Logo Alumni Hub F" className="h-28 w-28 mx-auto mb-5 drop-shadow-xl" />
          <Badge className="mb-6 bg-amber-500/20 text-amber-200 border-amber-500/30 hover:bg-amber-500/30 px-4 py-1 inline-flex items-center">
            Portal Resmi Alumni Hub <span className="text-xl font-black ml-1 text-amber-400 drop-shadow-sm">F</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Ekosistem Alumni <span className="text-amber-400">yang Hidup</span>
          </h1>
          <p className="text-lg md:text-xl text-red-50 mb-10 leading-relaxed max-w-2xl mx-auto opacity-90">
            Menghubungkan 2.400+ Alumni Fatemeta, Fateta, dan FTT IPB dengan industri, riset, dan generasi berikutnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={currentUser ? onOpenDashboard : onStart} size="lg" className="bg-amber-500 hover:bg-amber-600 text-red-950 font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 shadow-lg shadow-amber-900/20">
              {currentUser ? 'Buka Dashboard' : 'Masuk Portal Alumni'}
            </Button>
            <Button onClick={onNavigateToNews} size="lg" className="bg-white hover:bg-red-50 text-red-900 font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 shadow-lg shadow-black/10">
              Selengkapnya
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-xl bg-white/95 backdrop-blur">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-2xl">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured News */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Berita Terkini</h2>
            <p className="text-gray-500">Ikuti perkembangan terbaru dari almamater dan rekan alumni.</p>
          </div>
          <Button variant="link" onClick={onNavigateToNews} className="text-red-700 font-semibold group">
            Lihat Semua Berita <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <Card key={article.id} onClick={onNavigateToNews} className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 border-gray-100">
              <div className="h-48 bg-gray-200 relative">
                <img src={newsImage(article)} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-4 left-4 bg-red-800">{article.kategori}</Badge>
              </div>
              <CardContent className="p-6">
                <div className="text-xs text-gray-400 mb-2">{article.tanggal}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-red-800 transition-colors">{article.judul}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">{article.ringkasan}</p>
                <div className="flex flex-wrap gap-1">
                  {article.tag.map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Utama Alumni Hub</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Dirancang khusus untuk memenuhi kebutuhan pengembangan profesional dan kolaborasi sosial alumni FTT IPB.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} onClick={() => onNavigate(f.view)} className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{f.desc}</p>
                  <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onNavigate(f.view); }}
                    className="w-full border-red-700 text-red-800 hover:bg-red-50 rounded-lg font-semibold"
                  >
                    Buka Fitur
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA — hanya untuk pengunjung yang belum login */}
      {!currentUser && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto bg-red-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-700/50 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
            <h2 className="text-3xl font-bold mb-6 relative z-10">Alumni baru? Segera bergabung.</h2>
            <p className="text-red-100 mb-8 max-w-lg mx-auto relative z-10">Daftarkan diri Anda setelah wisuda dan mulailah terhubung dengan ribuan rekan alumni di seluruh penjuru dunia.</p>
            <Button onClick={onRegister} className="bg-white text-red-900 hover:bg-red-50 font-bold px-8 py-6 text-lg rounded-xl relative z-10">Daftar Sekarang</Button>
          </div>
        </section>
      )}
    </div>
  );
};