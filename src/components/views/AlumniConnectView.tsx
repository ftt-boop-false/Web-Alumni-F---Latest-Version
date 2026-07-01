"use client";

import React, { useState, useMemo } from 'react';
import { FORUM_THREADS, USERS, Thread, Reply, User, ThreadCategory, Message, Report } from '@/lib/data';
import { useBoard } from '@/lib/use-board';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  ThumbsUp, 
  CornerDownRight, 
  Flag, 
  CheckCircle2, 
  MoreVertical, 
  Pin, 
  Plus, 
  Search,
  Send,
  X,
  ShieldCheck,
  AlertTriangle,
  Lightbulb
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
import { cn } from "@/lib/utils";

interface AlumniConnectViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
}

const CATEGORIES: (ThreadCategory | 'Semua')[] = ['Semua', 'Rekrutmen', 'Mitra Bisnis', 'Cari Supplier', 'Cari Customer', 'Kolaborasi Riset', 'Diskusi Umum'];

export const AlumniConnectView = ({ currentUser, onLoginClick, messages, setMessages }: AlumniConnectViewProps) => {
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'admin';
  const [threads, setThreads] = useBoard<Thread>('connectThreads', FORUM_THREADS);
  const [activeCategory, setActiveCategory] = useState<ThreadCategory | 'Semua'>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDMModalOpen, setIsDMModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: number, type: 'thread' | 'reply' } | null>(null);
  const [solveTarget, setSolveTarget] = useState<number | null>(null); // threadId
  
  // Form States
  const [newThread, setNewThread] = useState({ title: '', category: 'Diskusi Umum' as ThreadCategory, content: '' });
  const [replyText, setReplyText] = useState('');
  const [nestedReplyTo, setNestedReplyTo] = useState<number | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState('');
  const [dmText, setDMText] = useState('');
  const [reportReason, setReportReason] = useState('Spam');
  const [reportNote, setReportNote] = useState('');

  const filteredThreads = useMemo(() => {
    let result = [...threads].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    
    if (activeCategory !== 'Semua') {
      result = result.filter(t => t.category === activeCategory);
    }
    
    if (searchTerm) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return result;
  }, [threads, activeCategory, searchTerm]);

  const handleCreateThread = () => {
    if (!currentUser) return;
    const thread: Thread = {
      id: Date.now(),
      authorId: currentUser.id,
      category: newThread.category,
      title: newThread.title,
      content: newThread.content,
      timestamp: "Baru saja",
      likes: 0,
      likedBy: [],
      replies: [],
      isPinned: false,
      isSolved: false,
      views: 0
    };
    setThreads([thread, ...threads]);
    setIsCreateModalOpen(false);
    setNewThread({ title: '', category: 'Diskusi Umum', content: '' });
    toast({ title: "Thread Terkirim", description: "Thread berhasil diposting di forum." });
  };

  const handleLikeThread = (threadId: number) => {
    if (!currentUser) { onLoginClick(); return; }
    setThreads(threads.map(t => {
      if (t.id === threadId) {
        const isLiked = t.likedBy.includes(currentUser.id);
        return {
          ...t,
          likes: isLiked ? t.likes - 1 : t.likes + 1,
          likedBy: isLiked ? t.likedBy.filter(id => id !== currentUser.id) : [...t.likedBy, currentUser.id]
        };
      }
      return t;
    }));
  };

  const handleLikeReply = (threadId: number, replyId: number) => {
    if (!currentUser) { onLoginClick(); return; }
    setThreads(threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies.map(r => {
            if (r.id === replyId) {
              const isLiked = r.likedBy.includes(currentUser.id);
              return {
                ...r,
                likes: isLiked ? r.likes - 1 : r.likes + 1,
                likedBy: isLiked ? r.likedBy.filter(id => id !== currentUser.id) : [...r.likedBy, currentUser.id]
              };
            }
            return r;
          })
        };
      }
      return t;
    }));
  };

  const handleSendReply = (threadId: number, parentId?: number) => {
    if (!currentUser) { onLoginClick(); return; }
    const text = parentId ? nestedReplyText : replyText;
    if (!text.trim()) return;

    const newReply: Reply = {
      id: Date.now(),
      authorId: currentUser.id,
      content: text,
      timestamp: "Baru saja",
      likes: 0,
      likedBy: [],
      parentId: parentId
    };

    setThreads(threads.map(t => t.id === threadId ? { ...t, replies: [...t.replies, newReply] } : t));
    
    if (parentId) {
      setNestedReplyTo(null);
      setNestedReplyText('');
    } else {
      setReplyText('');
    }
    toast({ title: "Balasan Terkirim", description: "Balasan Anda telah ditambahkan." });
  };

  const handleSolve = (threadId: number, replyId: number) => {
    setThreads(threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          isSolved: true,
          replies: t.replies.map(r => ({ ...r, isBestAnswer: r.id === replyId }))
        };
      }
      return t;
    }));
    setIsSolveModalOpen(false);
    toast({ title: "Diskusi Diselesaikan", description: "Jawaban terbaik telah ditandai." });
  };

  const handleReport = () => {
    if (!currentUser || !reportTarget) return;
    const report: Report = {
      id: Date.now(),
      reporterId: currentUser.id,
      targetId: reportTarget.id,
      targetType: reportTarget.type,
      reason: reportReason,
      note: reportNote,
      timestamp: "Baru saja",
      status: 'pending'
    };
    setReports([...reports, report]);
    setIsReportModalOpen(false);
    toast({ title: "Laporan Terkirim", description: "Moderator akan meninjau laporan Anda." });
  };

  const handleSendDM = () => {
    if (!currentUser || !selectedUser) return;
    const msg: Message = {
      id: Date.now(),
      fromId: currentUser.id,
      toId: selectedUser.id,
      content: dmText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setMessages([...messages, msg]);
    setDMText('');
    toast({ title: "Pesan Terkirim", description: `DM terkirim ke ${selectedUser.nama}` });
  };

  const handleModAction = (reportId: number, action: 'delete' | 'ignore') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'delete') {
      if (report.targetType === 'thread') {
        setThreads(threads.filter(t => t.id !== report.targetId));
      } else {
        setThreads(threads.map(t => ({
          ...t,
          replies: t.replies.filter(r => r.id !== report.targetId)
        })));
      }
      toast({ title: "Konten Dihapus", variant: "destructive" });
    }
    
    setReports(reports.map(r => r.id === reportId ? { ...r, status: action === 'delete' ? 'resolved' : 'ignored' } : r));
  };

  const getCategoryColor = (cat: ThreadCategory) => {
    switch (cat) {
      case 'Rekrutmen': return 'bg-red-100 text-red-800';
      case 'Mitra Bisnis': return 'bg-blue-100 text-blue-800';
      case 'Cari Supplier': return 'bg-orange-100 text-orange-800';
      case 'Cari Customer': return 'bg-amber-100 text-amber-800';
      case 'Kolaborasi Riset': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'alumni': return 'bg-red-100 text-red-700';
      case 'mahasiswa': return 'bg-blue-100 text-blue-700';
      case 'dosen': return 'bg-teal-100 text-teal-700';
      case 'moderator': return 'bg-red-950 text-red-100';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">AlumniConnect</h1>
          <p className="text-gray-600">Ruang kolaborasi, diskusi, dan networking civitas FTT IPB.</p>
        </div>
        <div className="flex gap-3">
          {currentUser && currentUser.role !== 'moderator' && (
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" /> Buat Thread
            </Button>
          )}
        </div>
      </header>

      {/* Sticky Category Bar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b mb-8">
        <div className="flex overflow-x-auto no-scrollbar py-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-3 text-sm font-bold whitespace-nowrap transition-all relative",
                activeCategory === cat ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {cat}
              {activeCategory === cat && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
            </button>
          ))}
          {currentUser?.role === 'moderator' && (
             <button
              onClick={() => setActiveCategory('Semua')} 
              className="px-6 py-3 text-sm font-bold text-red-600 hover:text-red-700"
              onClickCapture={() => setExpandedThreadId(-1)}
            >
              Moderasi
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {expandedThreadId === -1 && currentUser?.role === 'moderator' ? (
            <div className="space-y-8 animate-in slide-in-from-left-4">
              <section>
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" /> Laporan Masuk
                </h3>
                <div className="space-y-4">
                  {reports.filter(r => r.status === 'pending').length > 0 ? (
                    reports.filter(r => r.status === 'pending').map(rep => {
                      const reporter = USERS.find(u => u.id === rep.reporterId);
                      return (
                        <Card key={rep.id} className="border-red-100 bg-red-50/30">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold text-red-800">Alasan: {rep.reason}</p>
                              <p className="text-xs text-gray-500">Dilaporkan oleh {reporter?.nama} · {rep.timestamp}</p>
                              {rep.note && <p className="text-xs italic text-gray-600 mt-1">"{rep.note}"</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleModAction(rep.id, 'delete')}>Hapus</Button>
                              <Button size="sm" variant="ghost" className="h-8 text-gray-500" onClick={() => handleModAction(rep.id, 'ignore')}>Abaikan</Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed text-gray-400">Tidak ada laporan baru</div>
                  )}
                </div>
              </section>
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Semua Konten</h3>
                <div className="space-y-4">
                  {threads.map(t => (
                    <Card key={t.id} className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge className={getCategoryColor(t.category)}>{t.category}</Badge>
                        <h4 className="font-bold text-sm truncate max-w-md">{t.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setThreads(threads.map(thr => thr.id === t.id ? { ...thr, isPinned: !thr.isPinned } : thr))}>
                          {t.isPinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => setThreads(threads.filter(thr => thr.id !== t.id))}>Hapus</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            filteredThreads.map(thread => {
              const author = USERS.find(u => u.id === thread.authorId);
              const isExpanded = expandedThreadId === thread.id;
              
              return (
                <Card 
                  key={thread.id} 
                  className={cn(
                    "border-gray-100 transition-all duration-300",
                    isExpanded ? "ring-2 ring-primary/20 shadow-xl" : "hover:shadow-md cursor-pointer"
                  )}
                  onClick={() => !isExpanded && setExpandedThreadId(thread.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedUser(author || null); }}>
                          <AvatarFallback style={{ backgroundColor: author?.avatar_color }} className="text-white text-xs font-bold">
                            {author?.nama.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-sm hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedUser(author || null); }}>{author?.nama}</span>
                            <Badge className={cn("text-[10px] uppercase py-0 px-2", getRoleBadge(author?.role || ""))}>{author?.role}</Badge>
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{thread.timestamp} · {thread.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {thread.isPinned && <Pin className="w-4 h-4 text-primary fill-primary rotate-45" />}
                        {thread.isSolved && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Terjawab
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(thread.category)}>{thread.category}</Badge>
                      </div>
                    </div>

                    <h3 className={cn("font-bold text-gray-900 mb-2 leading-tight", isExpanded ? "text-2xl" : "text-lg")}>
                      {thread.title}
                    </h3>
                    
                    <p className={cn("text-gray-600 text-sm leading-relaxed mb-4", !isExpanded && "line-clamp-2")}>
                      {thread.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-6">
                        <button 
                          className={cn("flex items-center gap-1.5 text-xs font-bold transition-colors", thread.likedBy.includes(currentUser?.id || 0) ? "text-primary" : "text-gray-400 hover:text-primary")}
                          onClick={(e) => { e.stopPropagation(); handleLikeThread(thread.id); }}
                        >
                          <ThumbsUp className="w-4 h-4" /> {thread.likes}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                          <MessageSquare className="w-4 h-4" /> {thread.replies.length} Balasan
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded && (
                          <Button variant="ghost" size="sm" className="h-8 text-gray-400" onClick={(e) => { e.stopPropagation(); setExpandedThreadId(null); }}>Tutup</Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(currentUser?.id === thread.authorId || isAdmin) && (
                              <>
                                <DropdownMenuItem onClick={() => { setSolveTarget(thread.id); setIsSolveModalOpen(true); }}>Tandai Terjawab</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => setThreads(threads.filter(t => t.id !== thread.id))}>Hapus Thread{isAdmin && currentUser?.id !== thread.authorId ? ' (Admin)' : ''}</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => { setReportTarget({ id: thread.id, type: 'thread' }); setIsReportModalOpen(true); }}>
                              <Flag className="w-4 h-4 mr-2" /> Laporkan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Replies Section */}
                    {isExpanded && (
                      <div className="mt-8 space-y-6 pt-8 border-t animate-in fade-in duration-300">
                        <h4 className="font-bold text-gray-900 mb-4">Balasan ({thread.replies.length})</h4>
                        
                        <div className="space-y-6">
                          {thread.replies.filter(r => !r.parentId).map(reply => {
                            const rAuthor = USERS.find(u => u.id === reply.authorId);
                            const childReplies = thread.replies.filter(child => child.parentId === reply.id);
                            
                            return (
                              <div key={reply.id} className="space-y-4">
                                <div className={cn("p-4 rounded-xl", reply.isBestAnswer ? "bg-amber-50 border border-amber-100" : "bg-gray-50/50")}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                      <Avatar className="w-8 h-8 cursor-pointer" onClick={() => setSelectedUser(rAuthor || null)}>
                                        <AvatarFallback style={{ backgroundColor: rAuthor?.avatar_color }} className="text-white text-[10px] font-bold">
                                          {rAuthor?.nama.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-gray-900 text-xs hover:underline cursor-pointer" onClick={() => setSelectedUser(rAuthor || null)}>{rAuthor?.nama}</span>
                                          <Badge className={cn("text-[8px] uppercase py-0 px-1.5", getRoleBadge(rAuthor?.role || ""))}>{rAuthor?.role}</Badge>
                                          {reply.isBestAnswer && <Badge className="bg-amber-500 text-amber-950 text-[8px] uppercase">Jawaban Terbaik</Badge>}
                                        </div>
                                        <p className="text-[10px] text-gray-400">{reply.timestamp}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => { setReportTarget({ id: reply.id, type: 'reply' }); setIsReportModalOpen(true); }}>
                                        <Flag className="w-3 h-3 text-gray-300 hover:text-red-400" />
                                      </button>
                                      {(isAdmin || currentUser?.id === reply.authorId) && (
                                        <button
                                          title="Hapus balasan"
                                          onClick={() => setThreads(threads.map(t => t.id === thread.id ? { ...t, replies: t.replies.filter(r => r.id !== reply.id && r.parentId !== reply.id) } : t))}
                                        >
                                          <X className="w-3 h-3 text-gray-300 hover:text-red-500" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">{reply.content}</p>
                                  <div className="flex items-center gap-4">
                                    <button 
                                      className={cn("flex items-center gap-1 text-[10px] font-bold transition-colors", reply.likedBy.includes(currentUser?.id || 0) ? "text-primary" : "text-gray-400 hover:text-primary")}
                                      onClick={() => handleLikeReply(thread.id, reply.id)}
                                    >
                                      <ThumbsUp className="w-3 h-3" /> {reply.likes}
                                    </button>
                                    <button 
                                      className="text-[10px] font-bold text-gray-400 hover:text-primary"
                                      onClick={() => setNestedReplyTo(nestedReplyTo === reply.id ? null : reply.id)}
                                    >
                                      Balas
                                    </button>
                                  </div>

                                  {/* Nested Reply Input */}
                                  {nestedReplyTo === reply.id && (
                                    <div className="mt-4 flex gap-2">
                                      <Input 
                                        placeholder="Tulis balasan..." 
                                        className="h-8 text-xs bg-white" 
                                        value={nestedReplyText} 
                                        onChange={(e) => setNestedReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply(thread.id, reply.id)}
                                      />
                                      <Button size="sm" className="h-8 px-3" onClick={() => handleSendReply(thread.id, reply.id)}><Send className="w-3 h-3" /></Button>
                                    </div>
                                  )}
                                </div>

                                {/* Child Replies (Level 1) */}
                                {childReplies.map(child => {
                                  const cAuthor = USERS.find(u => u.id === child.authorId);
                                  return (
                                    <div key={child.id} className="flex gap-2 ml-10 animate-in slide-in-from-left-2">
                                      <CornerDownRight className="w-4 h-4 text-gray-200 shrink-0 mt-1" />
                                      <div className="bg-gray-50/30 p-3 rounded-xl flex-1 border-l-2 border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                          <div className="flex gap-2">
                                            <Avatar className="w-6 h-6">
                                              <AvatarFallback style={{ backgroundColor: cAuthor?.avatar_color }} className="text-white text-[8px] font-bold">
                                                {cAuthor?.nama.charAt(0)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-[10px]">{cAuthor?.nama}</span>
                                                <Badge className={cn("text-[8px] uppercase py-0 px-1", getRoleBadge(cAuthor?.role || ""))}>{cAuthor?.role}</Badge>
                                              </div>
                                              <p className="text-[8px] text-gray-400">{child.timestamp}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="text-gray-600 text-[11px] leading-normal">{child.content}</p>
                                        <button 
                                          className={cn("mt-2 flex items-center gap-1 text-[8px] font-bold transition-colors", child.likedBy.includes(currentUser?.id || 0) ? "text-primary" : "text-gray-400 hover:text-primary")}
                                          onClick={() => handleLikeReply(thread.id, child.id)}
                                        >
                                          <ThumbsUp className="w-2.5 h-2.5" /> {child.likes}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>

                        {/* Root Reply Input */}
                        <div className="mt-8 bg-gray-50 p-6 rounded-2xl">
                          <Label className="mb-2 block text-xs font-bold text-gray-500 uppercase">Kirim Balasan</Label>
                          <Textarea 
                            placeholder={currentUser ? "Apa pendapat Anda?..." : "Silakan masuk untuk membalas diskusi."} 
                            disabled={!currentUser}
                            className="bg-white border-gray-200 mb-4"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex justify-end">
                            <Button className="bg-primary px-8" disabled={!currentUser || !replyText.trim()} onClick={() => handleSendReply(thread.id)}>Kirim Balasan</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Pencarian</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Cari diskusi..." className="pl-10 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <ShieldCheck className="w-8 h-8" />
                <h4 className="font-bold">Panduan Forum</h4>
              </div>
              <ul className="space-y-3 text-xs text-primary/80">
                <li className="flex gap-2">✅ Gunakan bahasa yang sopan</li>
                <li className="flex gap-2">✅ Cantumkan subjek dengan jelas</li>
                <li className="flex gap-2">✅ Dilarang spam dan promosi ilegal</li>
                <li className="flex gap-2">✅ Hargai setiap pendapat</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Statistik Forum</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Thread</span>
                <span className="font-bold">{threads.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Diskusi Aktif</span>
                <span className="font-bold text-red-600">{threads.filter(t => !t.isSolved).length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Terselesaikan</span>
                <span className="font-bold text-amber-600">{threads.filter(t => t.isSolved).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Buat Thread Baru</DialogTitle>
            <DialogDescription>Bagikan pertanyaan, penawaran, atau topik diskusi ke jaringan alumni.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newThread.category}
                onChange={(e) => setNewThread({...newThread, category: e.target.value as ThreadCategory})}
              >
                {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Judul Thread</Label>
              <Input value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} placeholder="Judul yang jelas dan ringkas..." />
            </div>
            <div className="space-y-2">
              <Label>Isi Thread</Label>
              <Textarea value={newThread.content} onChange={(e) => setNewThread({...newThread, content: e.target.value})} placeholder="Jelaskan topik yang ingin Anda diskusikan..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
            <Button className="bg-primary" disabled={!newThread.title || !newThread.content} onClick={handleCreateThread}>Post Thread</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Chip / DM Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => { setSelectedUser(null); setIsDMModalOpen(false); }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-none">
          {selectedUser && (
            <div className="animate-in slide-in-from-bottom-4">
              <DialogHeader className="sr-only">
                <DialogTitle>Profil {selectedUser.nama}</DialogTitle>
                <DialogDescription>Detail profil dan pesan langsung untuk {selectedUser.nama}</DialogDescription>
              </DialogHeader>
              <div className="h-24 bg-primary relative">
                <Avatar className="w-20 h-20 absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-white shadow-lg">
                  <AvatarFallback style={{ backgroundColor: selectedUser.avatar_color }} className="text-white text-xl font-bold">
                    {selectedUser.nama.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-14 pb-6 px-6 text-center">
                <h3 className="font-bold text-lg text-gray-900">{selectedUser.nama}</h3>
                <Badge className={cn("mt-1 mb-2", getRoleBadge(selectedUser.role))}>{selectedUser.role}</Badge>
                <p className="text-xs text-gray-500 mb-4">{selectedUser.jabatan}</p>
                <p className="text-xs text-gray-400 mb-6 italic">"{selectedUser.bio}"</p>
                
                {isDMModalOpen ? (
                  <div className="space-y-4 text-left border-t pt-6">
                    <div className="max-h-[200px] overflow-y-auto space-y-3 mb-4 pr-2 text-xs">
                      {messages
                        .filter(m => (m.fromId === currentUser?.id && m.toId === selectedUser.id) || (m.fromId === selectedUser.id && m.toId === currentUser?.id))
                        .sort((a, b) => a.id - b.id)
                        .map(m => (
                          <div key={m.id} className={cn("flex", m.fromId === currentUser?.id ? "justify-end" : "justify-start")}>
                            <div className={cn("max-w-[80%] p-2 rounded-lg", m.fromId === currentUser?.id ? "bg-primary text-white" : "bg-gray-100 text-gray-800")}>
                              {m.content}
                            </div>
                          </div>
                        ))
                      }
                      {messages.filter(m => (m.fromId === currentUser?.id && m.toId === selectedUser.id) || (m.fromId === selectedUser.id && m.toId === currentUser?.id)).length === 0 && (
                        <p className="text-center text-gray-400 italic">Belum ada percakapan.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Tulis pesan..." 
                        className="h-10 text-xs" 
                        value={dmText} 
                        onChange={(e) => setDMText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendDM()}
                      />
                      <Button size="icon" className="shrink-0 h-10 w-10 bg-primary" onClick={handleSendDM}><Send className="w-4 h-4" /></Button>
                    </div>
                    <Button variant="ghost" className="w-full text-xs text-gray-400 h-8" onClick={() => setIsDMModalOpen(false)}>Kembali ke Profil</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" asChild>
                      <a href={selectedUser.linkedin} target="_blank">LinkedIn</a>
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl bg-primary" 
                      onClick={() => currentUser ? setIsDMModalOpen(true) : onLoginClick()}
                    >
                      Kirim Pesan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Laporkan Konten
            </DialogTitle>
            <DialogDescription>Membantu menjaga forum tetap aman dan profesional.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={reportReason} onValueChange={setReportReason}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="Spam" id="r1" /><Label htmlFor="r1">Spam / Iklan tidak relevan</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="Konten tidak pantas" id="r2" /><Label htmlFor="r2">Konten tidak pantas / SARA</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="Menyesatkan" id="r3" /><Label htmlFor="r3">Informasi palsu / Menyesatkan</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="Lainnya" id="r4" /><Label htmlFor="r4">Lainnya</Label></div>
            </RadioGroup>
            <div className="space-y-2">
              <Label>Catatan Tambahan (Opsional)</Label>
              <Textarea value={reportNote} onChange={(e) => setReportNote(e.target.value)} placeholder="Berikan alasan spesifik..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleReport}>Laporkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Solved Selection Modal */}
      <Dialog open={isSolveModalOpen} onOpenChange={setIsSolveModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Lightbulb className="w-5 h-5" /> Pilih Jawaban Terbaik
            </DialogTitle>
            <DialogDescription>Manakah dari balasan di bawah ini yang paling membantu menyelesaikan masalah Anda?</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3 py-4 pr-2">
            {solveTarget && threads.find(t => t.id === solveTarget)?.replies.map(r => {
              const rAuth = USERS.find(u => u.id === r.authorId);
              return (
                <Card 
                  key={r.id} 
                  className="cursor-pointer hover:border-amber-400 transition-colors"
                  onClick={() => handleSolve(solveTarget, r.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback style={{ backgroundColor: rAuth?.avatar_color }} className="text-white text-[10px] font-bold">
                        {rAuth?.nama.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-xs mb-1">{rAuth?.nama}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{r.content}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};