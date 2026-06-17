"use client";

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HomeView } from '@/components/views/Home';
import { NewsView } from '@/components/views/News';
import { CareerView } from '@/components/views/CareerView';
import { AlumniConnectView } from '@/components/views/AlumniConnectView';
import { ResearchForumView } from '@/components/views/ResearchForumView';
import { TracerStudyView } from '@/components/views/TracerStudyView';
import { ProtectedGate } from '@/components/views/protected/ProtectedGate';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { User, Message } from '@/lib/data';
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    toast({
      title: "Login Berhasil",
      description: `Selamat datang kembali, ${user.nama}!`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('beranda');
    toast({
      title: "Logged Out",
      description: "Anda telah keluar dari sistem.",
    });
  };

  const handleRegisterSubmit = (data: any) => {
    console.log("Registration submitted:", data);
    // In a real app, this would send data to the backend
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
            onStart={() => setIsLoginModalOpen(true)} 
            onNavigateToNews={() => setActiveView('berita')}
            onRegister={() => setIsRegisterModalOpen(true)}
          />
        );
      case 'berita':
        return <NewsView />;
      case 'career':
        return <CareerView currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)} />;
      case 'alumniconnect':
        return <AlumniConnectView currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)} messages={messages} setMessages={setMessages} />;
      case 'riset':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)}>
            <ResearchForumView currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)} />
          </ProtectedGate>
        );
      case 'expert':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)}>
            <EmptyPlaceholder name="Expert Registry" />
          </ProtectedGate>
        );
      case 'tracer':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)}>
            <TracerStudyView currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)} />
          </ProtectedGate>
        );
      case 'dashboard':
        return (
          <ProtectedGate currentUser={currentUser} onLoginClick={() => setIsLoginModalOpen(true)}>
            <EmptyPlaceholder name="Dashboard" />
          </ProtectedGate>
        );
      default:
        return (
          <HomeView 
            onStart={() => setIsLoginModalOpen(true)} 
            onNavigateToNews={() => setActiveView('berita')}
            onRegister={() => setIsRegisterModalOpen(true)}
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
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        unreadCount={unreadMessageCount}
      />
      
      <div className="pb-20">
        {renderView()}
      </div>

      {isLoginModalOpen && (
        <LoginModal 
          onLogin={handleLogin} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal 
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegister={handleRegisterSubmit}
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