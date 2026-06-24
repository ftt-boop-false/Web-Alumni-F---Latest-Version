"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { User } from '@/lib/data';
import { 
  Home,
  Newspaper,
  Briefcase,
  Users,
  ClipboardCheck,
  FlaskConical,
  LayoutDashboard,
  Landmark,
  Lock,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  unreadCount?: number;
}

export const Navbar = ({ activeView, setActiveView, currentUser, onLoginClick, onLogout, unreadCount = 0 }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // 'community' juga aktif saat halaman lama 'career'/'alumniconnect' dibuka (mis. dari kartu Beranda).
  const isActive = (id: string) =>
    activeView === id ||
    (id === 'community' && (activeView === 'career' || activeView === 'alumniconnect'));

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: <Home className="w-4 h-4" />, protected: false },
    { id: 'berita', label: 'Berita', icon: <Newspaper className="w-4 h-4" />, protected: false },
    { id: 'community', label: 'Career & Connect', icon: <Briefcase className="w-4 h-4" />, protected: false },
    { id: 'expert', label: 'Expert Registry', icon: <Users className="w-4 h-4" />, protected: true },
    { id: 'tracer', label: 'Tracer Study', icon: <ClipboardCheck className="w-4 h-4" />, protected: true },
    { id: 'riset', label: 'Forum Riset', icon: <FlaskConical className="w-4 h-4" />, protected: true },
    { id: 'wakaf', label: 'Dana Abadi', icon: <Landmark className="w-4 h-4" />, protected: false },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('beranda')}>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">
              ⚙️ Alumni Hub F
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                  isActive(item.id)
                    ? "text-red-800 bg-red-50"
                    : "text-gray-600 hover:text-red-700 hover:bg-gray-50",
                  item.protected && !currentUser && "opacity-70"
                )}
              >
                {item.icon}
                {item.label}
                {item.id === 'community' && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
                {item.protected && !currentUser && <Lock className="w-3 h-3 ml-1 text-red-600" />}
                {isActive(item.id) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-800 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-gray-900 leading-none">{currentUser.nama}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{currentUser.role}</p>
                </div>
                <Avatar className="h-8 w-8 cursor-pointer border-2 border-red-100" onClick={() => setActiveView('dashboard')}>
                  <AvatarFallback style={{ backgroundColor: currentUser.avatar_color }} className="text-white text-xs">
                    {currentUser.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={onLoginClick} className="bg-red-800 hover:bg-red-700 text-white shadow-sm">
                Masuk
              </Button>
            )}

            <button className="lg:hidden p-2 rounded-md text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t px-4 py-4 space-y-1 shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium",
                isActive(item.id) ? "bg-red-50 text-red-800" : "text-gray-600"
              )}
            >
              {item.icon}
              {item.label}
              {item.id === 'community' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              {item.protected && !currentUser && <Lock className="w-4 h-4 ml-auto text-red-600" />}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
