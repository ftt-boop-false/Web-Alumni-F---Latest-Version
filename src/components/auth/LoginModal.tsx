"use client";

import React from 'react';
import { USERS, User } from '@/lib/data';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface LoginModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

export const LoginModal = ({ onLogin, onClose }: LoginModalProps) => {
  const [search, setSearch] = React.useState('');

  const filteredUsers = USERS.filter(u => 
    u.nama.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.prodi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="max-w-2xl w-full relative animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden bg-white">
        <div className="bg-green-900 p-8 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-green-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Simulasi Login Portal</h2>
          <p className="text-green-100/70 text-sm">Silakan pilih profil di bawah ini untuk mensimulasikan login sebagai pengguna yang berbeda.</p>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Cari nama, role, atau prodi..." 
              className="pl-10 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {filteredUsers.map((user) => (
              <Card 
                key={user.id} 
                className="group cursor-pointer hover:border-green-600 hover:bg-green-50 transition-all border-gray-100"
                onClick={() => onLogin(user)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-green-200 transition-all">
                    <AvatarFallback style={{ backgroundColor: user.avatar_color }} className="text-white font-bold">
                      {user.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-green-800">{user.nama}</h4>
                      <Badge className={
                        user.role === 'alumni' ? "bg-green-100 text-green-800" :
                        user.role === 'dosen' ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      }>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.jabatan}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{user.prodi} — Angkatan {user.angkatan}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};