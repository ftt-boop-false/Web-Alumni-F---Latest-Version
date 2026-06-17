"use client";

import React, { useState } from 'react';
import { NEWS } from '@/lib/data';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NewsView = () => {
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const categories = ['Semua', 'Prestasi', 'Kiprah', 'Wirausaha', 'Pengumuman'];

  const filteredNews = NEWS.filter(n => {
    const matchesCategory = filter === 'Semua' || n.kategori === filter;
    const matchesSearch = n.judul.toLowerCase().includes(search.toLowerCase()) || 
                          n.ringkasan.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Berita Alumni</h1>
        <p className="text-gray-600">Jejak kiprah dan prestasi alumni FTT IPB di seluruh dunia.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat 
                  ? "bg-red-800 text-white shadow-md shadow-red-200" 
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Cari berita..." 
            className="pl-10 rounded-xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNews.length > 0 ? (
          filteredNews.map((article) => (
            <Card 
              key={article.id} 
              className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/${article.id + 10}/600/400`} 
                  alt="News" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <Badge className="absolute top-4 left-4 bg-amber-500 text-amber-950 font-bold border-none">
                  {article.kategori}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {article.tanggal}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-red-800">
                  {article.judul}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                  {article.ringkasan}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-1">
                    {article.tag.map(t => (
                      <span key={t} className="text-[10px] bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-full border border-red-100">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">Tidak ada berita ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci atau kategori lain.</p>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-md z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-80 w-full">
              <img 
                src={`https://picsum.photos/seed/${selectedArticle.id + 10}/800/600`} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-red-800">{selectedArticle.kategori}</Badge>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {selectedArticle.tanggal}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <User className="w-4 h-4" /> {selectedArticle.penulis}
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                {selectedArticle.judul}
              </h2>
              <div className="prose prose-red max-w-none text-gray-700 leading-loose">
                <p className="text-lg font-medium text-gray-900 mb-4">{selectedArticle.ringkasan}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  Penghargaan ini menjadi motivasi bagi kami semua untuk terus berkontribusi bagi kemajuan teknik pertanian di Indonesia.
                </p>
              </div>
              <div className="mt-10 pt-6 border-t flex flex-wrap gap-2">
                {selectedArticle.tag.map((t: string) => (
                  <Badge key={t} variant="outline" className="text-gray-500 border-gray-200">#{t}</Badge>
                ))}
              </div>
              <div className="mt-10">
                <Button onClick={() => setSelectedArticle(null)} className="bg-red-800 w-full py-6 text-lg font-bold rounded-xl shadow-lg shadow-red-200">
                  Tutup Berita
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};