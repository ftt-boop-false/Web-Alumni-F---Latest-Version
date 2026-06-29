"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HomeView } from '@/components/views/Home';
import { NewsView } from '@/components/views/News';
import { CommunityView } from '@/components/views/CommunityView';
import { ResearchForumView } from '@/components/views/ResearchForumView';
import { TracerStudyView } from '@/components/views/TracerStudyView';
import { AuthView } from '@/components/views/AuthView';
import { DashboardView } from '@/components/views/DashboardView';
import { WakafView } from '@/components/views/WakafView';
import { DanaFormulirView } from '@/components/views/DanaFormulirView';
import { ProtectedGate } from '@/components/views/protected/ProtectedGate';
import { ProfileCompletionGate, MandatoryProfile } from '@/components/ProfileCompletionGate';
import { User, Message } from '@/lib/data';
import { auth, fetchProfile, buildUser, isAdminEmail, isProfileComplete } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const EmptyPlaceholder = ({ name }: { name: string }) => (
  <div className="max-w-4xl mx-auto py-20 text-center">
    <div className="text-6xl mb-6">🚧</div>
    <h2 className="text-3xl font-bold mb-4">{name}</h2>
    <p className="text-gray-500">Fitur ini sedang dalam pengembangan sebagai bagian dari prototipe.</p>
  </div>
);

export default function AlumniPortal() {
  const [activeView, setActiveView] = useState('beranda');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [needsProfile, setNeedsProfile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  // Pulihkan sesi login dari Firebase saat halaman dibuka, dan ikuti perubahannya.
  // Sekaligus cek apakah profil wajib (status, angkatan, prodi) sudah lengkap.
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setCurrentUser(null);
        setNeedsProfile(false);
        return;
      }
      const profile = (await fetchProfile(fbUser.uid)) ?? {};
      setCurrentUser(buildUser(fbUser.uid, fbUser.email, profile));
      setNeedsProfile(!isAdminEmail(fbUser.email) && !isProfileComplete(profile));
    });
    return () => unsub();
  }, []);

  const goToAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setActiveView('auth');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView('dashboard');
    toast({
      title: "Login Berhasil",
      description: `Selamat datang kembali, ${user.nama}!`,
    });
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setCurrentUser(null);
    setNeedsProfile(false);
    setActiveView('beranda');
    toast({
      title: "Logged Out",
      description: "Anda telah keluar dari sistem.",
    });
  };

  const handleProfileComplete = (data: MandatoryProfile) => {
    setNeedsProfile(false);
    setCurrentUser((prev) => prev ? {
      ...prev,
      role: data.status as User['role'],
      angkatan: data.angkatan,
      prodi: data.prodi,
    } : prev);
    setActiveView('dashboard');
  };

  const unreadMessageCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(m => m.toId === currentUser.id && !m.isRead).length;
  }, [messages, currentUser]);

  const renderView = () => {
    switch (activeView) {
      case 'beranda':
        return (
          <HomeView
            onStart={() => goToAuth('login')}
            onNavigateToNews={() => setActiveView('berita')}
            onRegister={() => goToAuth('register')}
            currentUser={currentUser}
            onOpenDashboard={() => setActiveView('dashboard')}
            onNavigate={setActiveView}
          />
        );
      case 'auth':
        return (
          <AuthView
            onLogin={handleLogin}
            initialMode={authMode}
          />
        );
      case 'berita':
        return <NewsView currentUser={currentUser} />;
      case 'wakaf':
        return <WakafView currentUser={currentUser} onLoginClick={() => goToAuth('login')} onOpenFormulir={() => setActiveView('dana-formulir')} />;
      case 'dana-formulir':
        return <DanaFormulirView onBack={() => setActiveView('wakaf')} />;
      case 'community':
      case 'career':
      case 'alumniconnect':
        return (
          <CommunityView
            key={activeView}
            currentUser={currentUser}
            onLoginClick={() => goToAuth('login')}
            messages={messages}
            setMessages={setMessages}
            initialTab={activeView === 'alumniconnect' ? 'connect' : 'career'}
            unreadCount={unreadMessageCount}
          />
        );
      case 'riset':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => goToAuth('login')}>
            <ResearchForumView currentUser={currentUser} onLoginClick={() => goToAuth('login')} />
          </ProtectedGate>
        );
      case 'expert':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => goToAuth('login')}>
            <EmptyPlaceholder name="Expert Registry" />
          </ProtectedGate>
        );
      case 'tracer':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => goToAuth('login')}>
            <TracerStudyView currentUser={currentUser} onLoginClick={() => goToAuth('login')} />
          </ProtectedGate>
        );
      case 'dashboard':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => goToAuth('login')}>
            <DashboardView currentUser={currentUser} />
          </ProtectedGate>
        );
      default:
        return (
          <HomeView
            onStart={() => goToAuth('login')}
            onNavigateToNews={() => setActiveView('berita')}
            onRegister={() => goToAuth('register')}
            currentUser={currentUser}
            onOpenDashboard={() => setActiveView('dashboard')}
            onNavigate={setActiveView}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onLoginClick={() => goToAuth('login')}
        onLogout={handleLogout}
        unreadCount={unreadMessageCount}
      />

      <div className="pb-20">
        {renderView()}
      </div>

      {needsProfile && currentUser && (
        <ProfileCompletionGate
          currentUser={currentUser}
          onComplete={handleProfileComplete}
          onLogout={handleLogout}
        />
      )}

      <Toaster />

      <footer className="bg-red-950 py-12 px-4 text-white border-t border-red-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">⚙️ Alumni Hub F</h3>
            <p className="text-red-300 text-sm max-w-xs">Portal kolaborasi dan inovasi untuk alumni Fakultas Teknik dan Teknologi IPB.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-amber-400 transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Hubungi Kami</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Kebijakan Privasi</a>
          </div>
          <div className="text-xs text-red-500">
            © 2026 Alumni Hub F IPB University. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
