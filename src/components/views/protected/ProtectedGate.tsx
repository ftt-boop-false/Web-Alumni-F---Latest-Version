"use client";

import React from 'react';
import { User } from '@/lib/data';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from 'lucide-react';

interface ProtectedGateProps {
  currentUser: User | null;
  onLoginClick: () => void;
  children: React.ReactNode;
}

export const ProtectedGate = ({ currentUser, onLoginClick, children }: ProtectedGateProps) => {
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-600">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Zona Terproteksi</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-10 leading-relaxed">
          Maaf, halaman ini hanya dapat diakses oleh civitas akademika dan alumni FTT IPB yang terdaftar. Silakan masuk ke akun Anda.
        </p>
        <Card className="border-dashed border-red-200 bg-red-50/30 max-w-sm w-full mb-8">
          <CardContent className="p-6">
            <ul className="text-left text-sm text-red-800 space-y-2">
              <li className="flex items-center gap-2">✅ Akses Career Hub & Lowongan</li>
              <li className="flex items-center gap-2">✅ Networking via Expert Registry</li>
              <li className="flex items-center gap-2">✅ Forum Kolaborasi Riset</li>
              <li className="flex items-center gap-2">✅ Pengisian Tracer Study</li>
            </ul>
          </CardContent>
        </Card>
        <Button 
          onClick={onLoginClick} 
          size="lg" 
          className="bg-red-800 hover:bg-red-700 text-white px-10 py-6 rounded-xl shadow-lg"
        >
          Masuk ke Portal
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};