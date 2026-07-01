"use client";

import React, { useState, useMemo } from 'react';
import { 
  RESEARCH_THREADS, 
  USERS, 
  ResearchThread, 
  ResearchProposal, 
  User, 
  ResearchStatus, 
  ResearchCategory,
  ResearchOutput,
  Reply
} from '@/lib/data';
import { useBoard } from '@/lib/use-board';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Beaker, 
  Clock, 
  Database, 
  Users, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  MoreVertical,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  GraduationCap,
  Building,
  Info,
  Trash2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";

interface ResearchForumViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

const CATEGORIES: ResearchCategory[] = ['Logistik & Supply Chain', 'Agro-Informatics', 'Bioteknologi Pangan', 'Teknologi Pangan', 'Teknik Lingkungan'];
const STATUSES: (ResearchStatus | 'Semua')[] = ['Semua', 'Open', 'In Progress', 'Completed'];
const OUTPUTS: ResearchOutput[] = ['Skripsi', 'Tesis', 'Paper Jurnal', 'Prototipe', 'Laporan'];

export const ResearchForumView = ({ currentUser, onLoginClick }: ResearchForumViewProps) => {
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'admin';
  const [threads, setThreads] = useBoard<ResearchThread>('risetThreads', RESEARCH_THREADS);
  const [activeStatus, setActiveStatus] = useState<ResearchStatus | 'Semua'>('Semua');
  const [activeCategory, setActiveCategory] = useState<ResearchCategory | 'Semua'>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isApplicantsSheetOpen, setIsApplicantsSheetOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  
  // Forms
  const [newProposal, setNewProposal] = useState({ judul: '', pendekatan: '', relevansi: '' });
  const [outcomeNote, setOutcomeNote] = useState('');
  const [newThread, setNewThread] = useState<Partial<ResearchThread>>({
    title: '', category: 'Logistik & Supply Chain', description: '', needs: '', 
    dataAvailable: false, fieldVisitAvailable: false, outputs: [], duration: '4–6 bln'
  });

  const filteredThreads = useMemo(() => {
    let result = threads;
    if (activeStatus !== 'Semua') result = result.filter(t => t.status === activeStatus);
    if (activeCategory !== 'Semua') result = result.filter(t => t.category === activeCategory);
    if (searchTerm) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [threads, activeStatus, activeCategory, searchTerm]);

  const handlePostThread = () => {
    if (!currentUser) return;
    const thread: ResearchThread = {
      ...newThread as ResearchThread,
      id: Date.now(),
      postedBy: currentUser.id,
      status: 'Open',
      proposals: [],
      pendingAcademicSupervisorIds: [],
      replies: []
    };
    setThreads([thread, ...threads]);
    setIsCreateModalOpen(false);
    toast({ title: "Masalah Diposting", description: "Problem Statement Anda kini dapat diakses oleh civitas FTT IPB." });
  };

  const handleApplyProposal = (threadId: number) => {
    if (!currentUser) { onLoginClick(); return; }
    const proposal: ResearchProposal = {
      id: Date.now(),
      studentId: currentUser.id,
      judul: newProposal.judul,
      pendekatan: newProposal.pendekatan,
      relevansi: newProposal.relevansi,
      timestamp: "Baru saja"
    };
    setThreads(threads.map(t => t.id === threadId ? { ...t, proposals: [...t.proposals, proposal] } : t));
    setIsProposalModalOpen(false);
    setNewProposal({ judul: '', pendekatan: '', relevansi: '' });
    toast({ title: "Proposal Terkirim ✓", description: "Proposal Anda telah dikirim ke poster industri." });
  };

  const handleOfferSupervision = (threadId: number) => {
    if (!currentUser || currentUser.role !== 'dosen') return;
    setThreads(threads.map(t => {
      if (t.id === threadId && !t.academicSupervisorId && !t.pendingAcademicSupervisorIds.includes(currentUser.id)) {
        return { ...t, pendingAcademicSupervisorIds: [...t.pendingAcademicSupervisorIds, currentUser.id] };
      }
      return t;
    }));
    toast({ title: "Penawaran Terkirim", description: "Anda telah menawarkan diri sebagai Supervisor Akademik." });
  };

  const handleAcceptSupervisor = (threadId: number, dosenId: number) => {
    setThreads(threads.map(t => t.id === threadId ? { 
      ...t, 
      academicSupervisorId: dosenId, 
      pendingAcademicSupervisorIds: [] 
    } : t));
    toast({ title: "Supervisor Diterima", description: "Kolaborasi akademik telah disetujui." });
  };

  const handleMatchStudent = (threadId: number, studentId: number) => {
    setThreads(threads.map(t => t.id === threadId ? { 
      ...t, 
      status: 'In Progress', 
      matchedStudentId: studentId 
    } : t));
    setIsApplicantsSheetOpen(false);
    toast({ title: "Kolaborasi Dimulai", description: "Mahasiswa terpilih telah ditetapkan untuk topik ini." });
  };

  const handleCompleteThread = (threadId: number) => {
    setThreads(threads.map(t => t.id === threadId ? { 
      ...t, 
      status: 'Completed', 
      outcome: outcomeNote 
    } : t));
    setIsOutcomeModalOpen(false);
    setOutcomeNote('');
    toast({ title: "Topik Diselesaikan", description: "Hasil kolaborasi telah diarsipkan." });
  };

  const getStatusBadge = (status: ResearchStatus) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (cat: ResearchCategory) => {
    switch (cat) {
      case 'Logistik & Supply Chain': return 'bg-rose-50 text-rose-700';
      case 'Agro-Informatics': return 'bg-cyan-50 text-cyan-700';
      case 'Bioteknologi Pangan': return 'bg-pink-50 text-pink-700';
      case 'Teknologi Pangan': return 'bg-amber-50 text-amber-700';
      case 'Teknik Lingkungan': return 'bg-indigo-50 text-indigo-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Forum Kolaborasi Riset</h1>
          <p className="text-gray-600">Jembatan masalah industri dengan solusi akademik FTT IPB.</p>
        </div>
        {(currentUser?.role === 'alumni' || currentUser?.role === 'dosen') && (
          <Button size="lg" className="bg-primary rounded-xl shadow-lg" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> Posting Masalah
          </Button>
        )}
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex overflow-x-auto no-scrollbar border-b pb-px">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                "px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative",
                activeStatus === s ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {s}
              {activeStatus === s && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Cari topik atau bidang riset..." className="pl-10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select 
            className="h-10 px-4 rounded-xl border border-input bg-background text-sm font-medium"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as any)}
          >
            <option value="Semua">Semua Bidang</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Thread Grid */}
      <div className="space-y-4">
        {filteredThreads.map(thread => {
          const poster = USERS.find(u => u.id === thread.postedBy);
          const isExpanded = expandedThreadId === thread.id;
          const hasApplied = thread.proposals.some(p => p.studentId === currentUser?.id);
          const academicSupervisor = USERS.find(u => u.id === thread.academicSupervisorId);
          const matchedStudent = USERS.find(u => u.id === thread.matchedStudentId);

          return (
            <Card 
              key={thread.id} 
              className={cn(
                "border-gray-100 transition-all duration-300",
                isExpanded ? "ring-2 ring-primary/20 shadow-xl" : "hover:shadow-md cursor-pointer"
              )}
              onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={cn("font-bold", getStatusBadge(thread.status))}>
                        {thread.status}
                      </Badge>
                      <Badge className={cn("border-none", getCategoryColor(thread.category))}>
                        {thread.category}
                      </Badge>
                      {thread.dataAvailable && (
                        <Badge variant="secondary" className="bg-red-50 text-red-700 gap-1">
                          <Database className="w-3 h-3" /> Data Tersedia
                        </Badge>
                      )}
                      {(isAdmin || currentUser?.id === thread.postedBy) && (
                        <button
                          title="Hapus topik"
                          onClick={(e) => { e.stopPropagation(); if (window.confirm('Hapus topik riset ini?')) setThreads(threads.filter(t => t.id !== thread.id)); }}
                          className="ml-1 text-gray-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h3 className={cn("font-bold text-gray-900 leading-tight mb-2", isExpanded ? "text-2xl" : "text-lg")}>
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback style={{ backgroundColor: poster?.avatar_color }} className="text-white text-[8px] font-bold">
                            {poster?.nama.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{poster?.nama} · {poster?.role === 'alumni' ? poster.jabatan : 'Dosen'}</span>
                      </div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {thread.duration}</div>
                      <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {thread.proposals.length} Peminat</div>
                    </div>
                  </div>
                  {!isExpanded && (
                    <p className="text-gray-500 text-sm line-clamp-2 md:max-w-xs">
                      {thread.description}
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-8 pt-8 border-t grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-300">
                    <div className="lg:col-span-2 space-y-8">
                      <section>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-primary" /> Latar Masalah
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{thread.description}</p>
                      </section>

                      <section>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                          <Beaker className="w-5 h-5 text-primary" /> Yang Dibutuhkan
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{thread.needs}</p>
                      </section>

                      <section className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-gray-900 mb-4">Data & Fasilitas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Akses Data</span>
                            <div className="flex items-center gap-2">
                              {thread.dataAvailable ? <CheckCircle2 className="w-4 h-4 text-red-600" /> : <MoreVertical className="w-4 h-4 text-gray-300" />}
                              <span className="text-sm font-medium">{thread.dataAvailable ? "Tersedia" : "Tidak Tersedia"}</span>
                            </div>
                            {thread.dataType && <p className="text-xs text-gray-500 ml-6">{thread.dataType}</p>}
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Kunjungan Lapangan</span>
                            <div className="flex items-center gap-2">
                              {thread.fieldVisitAvailable ? <CheckCircle2 className="w-4 h-4 text-red-600" /> : <MoreVertical className="w-4 h-4 text-gray-300" />}
                              <span className="text-sm font-medium">{thread.fieldVisitAvailable ? "Dapat Dilakukan" : "Tidak Direncanakan"}</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h4 className="font-bold text-gray-900 mb-3">Ekspektasi Output</h4>
                        <div className="flex flex-wrap gap-2">
                          {thread.outputs.map(o => <Badge key={o} variant="outline" className="rounded-lg py-1 px-3 border-primary/20 bg-primary/5 text-primary">{o}</Badge>)}
                        </div>
                      </section>

                      {thread.status === 'Completed' && thread.outcome && (
                        <section className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                          <h4 className="font-bold text-amber-900 mb-2">Hasil Kolaborasi</h4>
                          <p className="text-sm text-amber-800 italic leading-relaxed">"{thread.outcome}"</p>
                        </section>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-white border rounded-2xl shadow-sm">
                        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Pembimbing Industri</h4>
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback style={{ backgroundColor: poster?.avatar_color }} className="text-white font-bold">
                              {poster?.nama.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{poster?.nama}</p>
                            <p className="text-xs text-gray-500 truncate">{poster?.jabatan}</p>
                            <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter">{poster?.role === 'alumni' ? poster.lokasi : 'IPB'}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal border-t pt-4 italic">"{poster?.bio}"</p>
                      </div>

                      <div className="p-6 bg-white border rounded-2xl shadow-sm">
                        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Pembimbing Akademik</h4>
                        {academicSupervisor ? (
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback style={{ backgroundColor: academicSupervisor.avatar_color }} className="text-white font-bold">
                                {academicSupervisor.nama.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{academicSupervisor.nama}</p>
                              <p className="text-xs text-gray-500">Dosen FTT IPB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-xs italic">Belum ada pembimbing akademik ditetapkan</div>
                        )}
                        {currentUser?.role === 'dosen' && thread.status === 'Open' && !academicSupervisor && (
                          <Button 
                            className="w-full mt-4 text-xs h-9 bg-red-600 hover:bg-red-700"
                            disabled={thread.pendingAcademicSupervisorIds.includes(currentUser.id)}
                            onClick={(e) => { e.stopPropagation(); handleOfferSupervision(thread.id); }}
                          >
                            {thread.pendingAcademicSupervisorIds.includes(currentUser.id) ? "Penawaran Terkirim ✓" : "Tawarkan Jadi Supervisor"}
                          </Button>
                        )}
                        {currentUser?.id === thread.postedBy && thread.pendingAcademicSupervisorIds.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                              <Info className="w-3 h-3" /> Ada penawaran dari Dosen
                            </p>
                            {thread.pendingAcademicSupervisorIds.map(dId => {
                              const dosen = USERS.find(u => u.id === dId);
                              return (
                                <div key={dId} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-bold truncate">{dosen?.nama}</span>
                                  <Button size="sm" className="h-6 text-[10px] px-2" onClick={(e) => { e.stopPropagation(); handleAcceptSupervisor(thread.id, dId); }}>Terima</Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        {currentUser?.id === thread.postedBy ? (
                          <>
                            <Button className="w-full bg-primary" onClick={(e) => { e.stopPropagation(); setIsApplicantsSheetOpen(true); }}>
                              Lihat Peminat ({thread.proposals.length})
                            </Button>
                            {thread.status === 'Open' && thread.proposals.length > 0 && (
                              <p className="text-[10px] text-center text-gray-400">Pilih salah satu mahasiswa untuk mulai riset</p>
                            )}
                            {thread.status === 'In Progress' && (
                              <Button variant="outline" className="w-full border-red-600 text-red-700" onClick={(e) => { e.stopPropagation(); setIsOutcomeModalOpen(true); }}>
                                Tandai Selesai
                              </Button>
                            )}
                          </>
                        ) : currentUser?.role === 'mahasiswa' ? (
                          <>
                            {thread.status === 'Open' ? (
                              <Button 
                                className="w-full bg-primary" 
                                disabled={hasApplied} 
                                onClick={(e) => { e.stopPropagation(); setIsProposalModalOpen(true); }}
                              >
                                {hasApplied ? "Proposal Terkirim ✓" : "Ajukan Proposal"}
                              </Button>
                            ) : (
                              <Badge className="w-full py-2 justify-center bg-gray-100 text-gray-500 border-none">
                                {thread.status === 'In Progress' ? "Sedang Dikerjakan" : "Selesai"}
                              </Badge>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Proposals Sheet (Poster Only) */}
              <Sheet open={isApplicantsSheetOpen && expandedThreadId === thread.id} onOpenChange={setIsApplicantsSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Peminat Topik Riset</SheetTitle>
                    <SheetDescription>Daftar mahasiswa yang tertarik berkolaborasi untuk topik: {thread.title}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-8 space-y-4">
                    {thread.proposals.length > 0 ? (
                      thread.proposals.map(prop => {
                        const student = USERS.find(u => u.id === prop.studentId);
                        return (
                          <Card key={prop.id} className="border-gray-100 shadow-none">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback style={{ backgroundColor: student?.avatar_color }} className="text-white font-bold">
                                    {student?.nama.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-sm">{student?.nama}</p>
                                  <p className="text-[10px] text-gray-500 uppercase">Angkatan {student?.angkatan} · {student?.prodi}</p>
                                </div>
                              </div>
                              <div className="space-y-3 mb-4">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Judul Proposal</p>
                                  <p className="text-xs text-gray-700 font-medium">{prop.judul}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ringkasan Pendekatan</p>
                                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{prop.pendekatan}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1 bg-red-700 h-8 text-xs" onClick={() => handleMatchStudent(thread.id, prop.studentId)}>Setujui</Button>
                                <Button variant="ghost" className="flex-1 h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => toast({ title: "Proposal Ditolak" })}>Tolak</Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="py-20 text-center text-gray-400 italic">Belum ada peminat untuk topik ini</div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Proposal Modal (Student) */}
              <Dialog open={isProposalModalOpen && expandedThreadId === thread.id} onOpenChange={setIsProposalModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajukan Proposal Kolaborasi</DialogTitle>
                    <DialogDescription>Jelaskan pendekatan Anda untuk menyelesaikan tantangan ini.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Judul Proposal</Label>
                      <Input placeholder="Contoh: Optimasi Heuristik untuk Rute Indofood..." value={newProposal.judul} onChange={(e) => setNewProposal({...newProposal, judul: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ringkasan Pendekatan (Max 300 char)</Label>
                      <Textarea maxLength={300} placeholder="Jelaskan metode yang akan Anda gunakan..." value={newProposal.pendekatan} onChange={(e) => setNewProposal({...newProposal, pendekatan: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Relevansi dengan Studi</Label>
                      <Textarea placeholder="Kenapa Anda adalah orang yang tepat?..." value={newProposal.relevansi} onChange={(e) => setNewProposal({...newProposal, relevansi: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Lampiran CV</Label>
                      <Button variant="outline" className="w-full border-dashed border-2 py-8 text-gray-400">Klik untuk upload (PDF)</Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsProposalModalOpen(false)}>Batal</Button>
                    <Button className="bg-primary" disabled={!newProposal.judul || !newProposal.pendekatan} onClick={() => handleApplyProposal(thread.id)}>Kirim Proposal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Outcome Modal (Poster) */}
              <Dialog open={isOutcomeModalOpen && expandedThreadId === thread.id} onOpenChange={setIsOutcomeModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Selesaikan Topik Riset</DialogTitle>
                    <DialogDescription>Berikan ringkasan hasil kolaborasi yang telah dicapai.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Output/Hasil Akhir</Label>
                    <Textarea className="mt-2" placeholder="Contoh: Algoritma berhasil memangkas biaya bbm sebesar 15%..." value={outcomeNote} onChange={(e) => setOutcomeNote(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOutcomeModalOpen(false)}>Batal</Button>
                    <Button className="bg-primary" disabled={!outcomeNote} onClick={() => handleCompleteThread(thread.id)}>Simpan & Tutup</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          );
        })}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Posting Masalah Riset Baru</DialogTitle>
            <DialogDescription>Definisikan tantangan industri Anda dalam format Problem Statement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Judul Masalah</Label>
              <Input placeholder="Contoh: Analisis Kebutuhan Gizi..." value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select className="w-full h-10 px-3 rounded-md border" value={newThread.category} onChange={(e) => setNewThread({...newThread, category: e.target.value as any})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Durasi Estimasi</Label>
                <select className="w-full h-10 px-3 rounded-md border" value={newThread.duration} onChange={(e) => setNewThread({...newThread, duration: e.target.value})}>
                  <option>1–3 bln</option>
                  <option>4–6 bln</option>
                  <option>7–12 bln</option>
                  <option>&gt;12 bln</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Latar Masalah (Pernyataan Masalah)</Label>
              <Textarea rows={4} placeholder="Jelaskan kendala teknis yang dihadapi industri..." value={newThread.description} onChange={(e) => setNewThread({...newThread, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Yang Dibutuhkan (Ekspektasi Solusi)</Label>
              <Textarea rows={3} placeholder="Apa yang ingin dicapai dari riset ini?..." value={newThread.needs} onChange={(e) => setNewThread({...newThread, needs: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
              <div className="space-y-4">
                <Label className="block">Ketersediaan Data</Label>
                <RadioGroup value={newThread.dataAvailable ? 'yes' : 'no'} onValueChange={(v) => setNewThread({...newThread, dataAvailable: v === 'yes'})} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="d1" /><Label htmlFor="d1">Ya</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="d2" /><Label htmlFor="d2">Tidak</Label></div>
                </RadioGroup>
                {newThread.dataAvailable && <Input placeholder="Jenis data..." value={newThread.dataType} onChange={(e) => setNewThread({...newThread, dataType: e.target.value})} />}
              </div>
              <div className="space-y-4">
                <Label className="block">Kunjungan Lapangan</Label>
                <RadioGroup value={newThread.fieldVisitAvailable ? 'yes' : 'no'} onValueChange={(v) => setNewThread({...newThread, fieldVisitAvailable: v === 'yes'})} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="v1" /><Label htmlFor="v1">Ya</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="v2" /><Label htmlFor="v2">Tidak</Label></div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ekspektasi Output (Bisa pilih lebih dari satu)</Label>
              <div className="flex flex-wrap gap-2">
                {OUTPUTS.map(o => (
                  <Button 
                    key={o} 
                    size="sm" 
                    variant={newThread.outputs?.includes(o) ? 'default' : 'outline'} 
                    onClick={() => {
                      const current = newThread.outputs || [];
                      setNewThread({...newThread, outputs: current.includes(o) ? current.filter(x => x !== o) : [...current, o]});
                    }}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
            <Button className="bg-primary" disabled={!newThread.title || !newThread.description} onClick={handlePostThread}>Posting Masalah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};