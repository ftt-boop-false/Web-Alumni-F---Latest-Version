"use client";

import React, { useState } from 'react';
import { Briefcase, MessageSquare } from 'lucide-react';
import { User, Message } from '@/lib/data';
import { CareerView } from './CareerView';
import { AlumniConnectView } from './AlumniConnectView';
import { cn } from '@/lib/utils';

export type CommunityTab = 'career' | 'connect';

interface CommunityViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  initialTab?: CommunityTab;
  unreadCount?: number;
}

/**
 * Gabungan dua halaman komunitas dalam satu navigasi:
 *  - Career Hub  (lowongan kerja)
 *  - AlumniConnect (forum diskusi & networking)
 * Pengguna berpindah lewat tab di bagian atas, tanpa menambah item navbar.
 */
export const CommunityView = ({
  currentUser, onLoginClick, messages, setMessages, initialTab = 'career', unreadCount = 0,
}: CommunityViewProps) => {
  const [tab, setTab] = useState<CommunityTab>(initialTab);

  const tabs: { id: CommunityTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'career', label: 'Career Hub', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'connect', label: 'AlumniConnect', icon: <MessageSquare className="w-4 h-4" />, badge: unreadCount },
  ];

  return (
    <div>
      {/* Tab switcher */}
      <div className="border-b bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-sm font-bold transition-colors relative",
                tab === t.id ? "text-primary" : "text-gray-400 hover:text-gray-600",
              )}
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="ml-1 bg-red-500 text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                  {t.badge}
                </span>
              ) : null}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'career' ? (
        <CareerView currentUser={currentUser} onLoginClick={onLoginClick} />
      ) : (
        <AlumniConnectView
          currentUser={currentUser}
          onLoginClick={onLoginClick}
          messages={messages}
          setMessages={setMessages}
        />
      )}
    </div>
  );
};
