"use client";

import React, { useState, useMemo } from 'react';
import { JOBS, USERS, JobListing, User, JobStatus, ApplyMethod } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Eye, 
  Users, 
  Plus, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Mail,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, isBefore, addDays, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface CareerViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

export const CareerView = ({ currentUser, onLoginClick }: CareerViewProps) => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobListing[]>(JOBS);
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'my'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [jobToReject, setJobToReject] = useState<number | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  // Form States
  const [formData, setFormData] = useState<Partial<JobListing>>({
    judul: '', perusahaan: '', lokasi: '', tipe: 'Full-time', bidang: '', gaji: '', deadline: '', deskripsi: '', syarat: [''], metode_lamaran: 'Portal'
  });

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (activeTab === 'admin') {
      result = result.filter(j => j.status === 'Menunggu Review');
    } else if (activeTab === 'my' && currentUser) {
      result = result.filter(j => j.posted_by === currentUser.id);
    } else {
      // For general users/guests, only show Active unless filtered
      if (currentUser?.role !== 'admin') {
        result = result.filter(j => j.status === 'Aktif' || (currentUser && j.posted_by === currentUser.id));
      }
    }

    if (searchTerm) {
      result = result.filter(j => 
        j.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.perusahaan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'Semua') {
      result = result.filter(j => j.tipe === filterType);
    }

    return result;
  }, [jobs, activeTab, searchTerm, filterType, currentUser]);

  const stats = useMemo(() => {
    if (!currentUser || currentUser.role !== 'alumni') return null;
    const myJobs = jobs.filter(j => j.posted_by === currentUser.id);
    return {
      total: myJobs.length,
      active: myJobs.filter(j => j.status === 'Aktif').length,
      applicants: myJobs.reduce((acc, curr) => acc + curr.applicants, 0)
    };
  }, [jobs, currentUser]);

  const handleCreateJob = () => {
    if (!currentUser) return;
    const newJob: JobListing = {
      ...formData as JobListing,
      id: jobs.length + 1,
      posted_by: currentUser.id,
      status: 'Menunggu Review',
      views: 0,
      applicants: 0,
      syarat: formData.syarat?.filter(s => s.trim() !== '') || []
    };
    setJobs([newJob, ...jobs]);
    setIsFormOpen(false);
    setFormData({ judul: '', perusahaan: '', lokasi: '', tipe: 'Full-time', bidang: '', gaji: '', deadline: '', deskripsi: '', syarat: [''], metode_lamaran: 'Portal' });
    toast({ title: "Loker Dikirim", description: "Loker sedang menunggu persetujuan admin." });
  };

  const handleUpdateStatus = (id: number, status: JobStatus, reason?: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status, rejection_reason: reason } : j));
    toast({ 
      title: status === 'Aktif' ? "Loker Disetujui" : "Loker Ditolak", 
      variant: status === 'Ditolak' ? "destructive" : "default" 
    });
    if (status === 'Ditolak') setIsRejectDialogOpen(false);
  };

  const handleDeleteJob = (id: number) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'Ditutup' } : j));
    toast({ title: "Loker Ditutup", description: "Loker tidak lagi terlihat oleh publik." });
  };

  const handleApply = (id: number) => {
    if (!currentUser) {
      onLoginClick();
      return;
    }
    setAppliedJobs([...appliedJobs, id]);
    setJobs(jobs.map(j => j.id === id ? { ...j, applicants: j.applicants + 1 } : j));
    toast({ title: "Lamaran Terkirim", description: "Profil Anda telah dikirim ke perusahaan." });
  };

  const renderJobCard = (job: JobListing) => {
    const isOwner = currentUser?.id === job.posted_by;
    const isAdmin = currentUser?.role === 'admin';
    const hasApplied = appliedJobs.includes(job.id);
    const deadlineDate = parseISO(job.deadline);
    const isNearDeadline = isBefore(deadlineDate, addDays(new Date(), 7));

    return (
      <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-gray-100 overflow-hidden group">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm`} style={{ backgroundColor: `hsl(${job.id * 40}, 60%, 40%)` }}>
                  {job.perusahaan.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedJob(job)}>
                    {job.judul}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <Briefcase className="w-3 h-3" /> {job.perusahaan}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={job.tipe === 'Full-time' ? 'default' : 'secondary'} className="rounded-md">
                  {job.tipe}
                </Badge>
                {isOwner || isAdmin ? (
                  <Badge className={
                    job.status === 'Aktif' ? "bg-red-100 text-red-800" :
                    job.status === 'Menunggu Review' ? "bg-amber-100 text-amber-800" :
                    job.status === 'Ditolak' ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }>
                    {job.status}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" /> {job.lokasi}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-gray-400" /> {job.gaji}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={isNearDeadline && job.status === 'Aktif' ? "text-red-600 font-semibold" : "text-gray-600"}>
                  Hingga {format(deadlineDate, 'd MMM yyyy', { locale: localeId })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{job.bidang}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {job.views} Views</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.applicants} Pelamar</span>
              </div>
              <div className="flex gap-2">
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setFormData(job); setIsFormOpen(true); }}>Edit Loker</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteJob(job.id)}>Tutup Loker</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {isAdmin && job.status === 'Menunggu Review' && (
                  <div className="flex gap-1">
                    <Button size="sm" className="bg-red-700 hover:bg-red-800 h-8" onClick={() => handleUpdateStatus(job.id, 'Aktif')}><CheckCircle className="w-4 h-4 mr-1" /> Setujui</Button>
                    <Button size="sm" variant="destructive" className="h-8" onClick={() => { setJobToReject(job.id); setIsRejectDialogOpen(true); }}><XCircle className="w-4 h-4 mr-1" /> Tolak</Button>
                  </div>
                )}
                {!isAdmin && !isOwner && job.status === 'Aktif' && (
                  <Button size="sm" onClick={() => setSelectedJob(job)} disabled={hasApplied} className={hasApplied ? "bg-gray-100 text-gray-500" : "bg-primary"}>
                    {hasApplied ? "Sudah Melamar" : "Lihat Detail"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Career Hub</h1>
            <p className="text-gray-600">Peluang karir eksklusif untuk alumni dan mahasiswa FTT IPB.</p>
          </div>
          {currentUser?.role === 'alumni' && (
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-5 h-5 mr-2" /> Posting Loker
            </Button>
          )}
        </div>
      </header>

      {/* Stats row for Alumni */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-primary text-white border-none">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium">Total Loker Saya</p>
                <h3 className="text-3xl font-bold">{stats.total}</h3>
              </div>
              <Briefcase className="w-10 h-10 opacity-20" />
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/10 shadow-sm">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium">Loker Aktif</p>
                <h3 className="text-3xl font-bold text-primary">{stats.active}</h3>
              </div>
              <CheckCircle className="w-10 h-10 text-primary opacity-10" />
            </CardContent>
          </Card>
          <Card className="bg-amber-500 text-white border-none">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Pelamar</p>
                <h3 className="text-3xl font-bold">{stats.applicants}</h3>
              </div>
              <Users className="w-10 h-10 opacity-20" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b">
          <div className="flex gap-8">
            <button onClick={() => setActiveTab('all')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'all' ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}>
              Semua Loker
              {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
            </button>
            {currentUser?.role === 'alumni' && (
              <button onClick={() => setActiveTab('my')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'my' ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}>
                Loker Saya
                {activeTab === 'my' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'admin' ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}>
                Antrian Review
                {jobs.filter(j => j.status === 'Menunggu Review').length > 0 && (
                  <Badge className="ml-2 bg-red-500">{jobs.filter(j => j.status === 'Menunggu Review').length}</Badge>
                )}
                {activeTab === 'admin' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Cari posisi atau perusahaan..." className="pl-10 rounded-xl bg-white border-gray-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2 text-gray-600 border-gray-200">
                  <Filter className="w-4 h-4" /> {filterType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['Semua', 'Full-time', 'Magang', 'Freelance'].map(t => (
                  <DropdownMenuItem key={t} onClick={() => setFilterType(t)}>{t}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(renderJobCard)
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">Tidak ada loker ditemukan</h3>
            <p className="text-gray-500">Sesuaikan kata kunci atau filter Anda.</p>
          </div>
        )}
      </div>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none">
          {selectedJob && (
            <div className="animate-in fade-in duration-300">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedJob.judul}</DialogTitle>
                <DialogDescription>Detail lowongan kerja di {selectedJob.perusahaan}</DialogDescription>
              </DialogHeader>
              <div className="bg-primary p-8 text-white relative">
                <Badge className="mb-4 bg-white/20 text-white border-none">{selectedJob.tipe}</Badge>
                <h2 className="text-3xl font-bold mb-2">{selectedJob.judul}</h2>
                <p className="text-primary-foreground/80 flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedJob.perusahaan} · {selectedJob.lokasi}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-900 mb-3">Deskripsi Pekerjaan</h4>
                    <p className="text-gray-600 leading-relaxed mb-6">{selectedJob.deskripsi}</p>
                    
                    <h4 className="font-bold text-gray-900 mb-3">Persyaratan</h4>
                    <ul className="space-y-2 mb-8">
                      {selectedJob.syarat.map((s, i) => (
                        <li key={i} className="flex gap-2 text-gray-600 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Card className="bg-gray-50 border-none shadow-none">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">Posted By</h4>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const poster = USERS.find(u => u.id === selectedJob.posted_by);
                            return (
                              <>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: poster?.avatar_color || '#ccc' }}>
                                  {poster?.nama.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">{poster?.nama}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{poster?.jabatan}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800">Loker ini khusus untuk alumni dan mahasiswa FTT IPB. Mohon lampirkan CV terbaru.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8">
                  {appliedJobs.includes(selectedJob.id) ? (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
                      <CheckCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-red-900">Lamaran Terkirim</h4>
                      <p className="text-red-700 text-sm">Terima kasih telah melamar. Perusahaan akan menghubungi Anda jika lolos seleksi.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h4 className="font-bold text-gray-900">Kirim Lamaran</h4>
                      {(selectedJob.metode_lamaran === 'Portal' || selectedJob.metode_lamaran === 'Keduanya') && (
                        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                          <Label>Pesan Singkat (Optional)</Label>
                          <Textarea placeholder="Kenapa Anda tertarik dengan posisi ini?..." className="bg-white border-gray-200" />
                          <div className="flex items-center justify-between gap-4">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-2 border-gray-300">Unggah CV (PDF/Doc)</Button>
                            <Button className="w-full h-12 rounded-xl bg-primary" onClick={() => handleApply(selectedJob.id)}>Kirim Via Portal</Button>
                          </div>
                        </div>
                      )}
                      {selectedJob.metode_lamaran === 'Keduanya' && <div className="text-center text-gray-400 text-sm font-medium">ATAU</div>}
                      {(selectedJob.metode_lamaran === 'Eksternal' || selectedJob.metode_lamaran === 'Keduanya') && (
                        <Button variant="outline" className="w-full h-12 rounded-xl border-primary text-primary hover:bg-primary/5" asChild>
                          <a href={selectedJob.link_eksternal} target="_blank" rel="noopener noreferrer">
                            Lamar via Website Perusahaan <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Posting Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Loker" : "Posting Lowongan Baru"}</DialogTitle>
            <DialogDescription>Isi detail lowongan kerja untuk jaringan alumni FTT IPB.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul Posisi</Label>
                <Input value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} placeholder="Contoh: Supply Chain Analyst" />
              </div>
              <div className="space-y-2">
                <Label>Nama Perusahaan</Label>
                <Input value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} placeholder="Contoh: PT IPB Mandiri" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} placeholder="Contoh: Jakarta / Remote" />
              </div>
              <div className="space-y-2">
                <Label>Tipe Pekerjaan</Label>
                <RadioGroup value={formData.tipe} onValueChange={(v: any) => setFormData({...formData, tipe: v})} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Full-time" id="ft" />
                    <Label htmlFor="ft">Full-time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Magang" id="in" />
                    <Label htmlFor="in">Magang</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bidang</Label>
                <Input value={formData.bidang} onChange={(e) => setFormData({...formData, bidang: e.target.value})} placeholder="Contoh: AgriTech" />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rentang Gaji</Label>
              <Input value={formData.gaji} onChange={(e) => setFormData({...formData, gaji: e.target.value})} placeholder="Contoh: Rp 7 - 9 Juta" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Pekerjaan</Label>
              <Textarea value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} placeholder="Tuliskan detail pekerjaan..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Persyaratan (Satu per baris)</Label>
              <Textarea 
                value={formData.syarat?.join('\n')} 
                onChange={(e) => setFormData({...formData, syarat: e.target.value.split('\n')})} 
                placeholder="Minimal S1 Teknik Pertanian&#10;IPK 3.0" 
                rows={4} 
              />
            </div>
            <div className="space-y-3">
              <Label>Metode Lamaran</Label>
              <RadioGroup value={formData.metode_lamaran} onValueChange={(v: any) => setFormData({...formData, metode_lamaran: v})} className="grid grid-cols-3 gap-2">
                <div className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer ${formData.metode_lamaran === 'Portal' ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"}`} onClick={() => setFormData({...formData, metode_lamaran: 'Portal'})}>Portal</div>
                <div className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer ${formData.metode_lamaran === 'Eksternal' ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"}`} onClick={() => setFormData({...formData, metode_lamaran: 'Eksternal'})}>Eksternal</div>
                <div className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer ${formData.metode_lamaran === 'Keduanya' ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"}`} onClick={() => setFormData({...formData, metode_lamaran: 'Keduanya'})}>Keduanya</div>
              </RadioGroup>
              {formData.metode_lamaran !== 'Portal' && (
                <div className="space-y-2 mt-2">
                  <Label>Link Eksternal</Label>
                  <Input value={formData.link_eksternal} onChange={(e) => setFormData({...formData, link_eksternal: e.target.value})} placeholder="https://..." />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button className="bg-primary" onClick={handleCreateJob}>Submit Loker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Lowongan</DialogTitle>
            <DialogDescription>Berikan alasan penolakan agar poster loker dapat memperbaikinya.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Alasan Penolakan</Label>
            <Textarea className="mt-2" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Contoh: Persyaratan kurang detail..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={() => jobToReject && handleUpdateStatus(jobToReject, 'Ditolak', rejectionReason)}>Tolak Loker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};