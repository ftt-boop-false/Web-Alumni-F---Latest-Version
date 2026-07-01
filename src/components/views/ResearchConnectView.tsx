"use client";

import React, { useState } from 'react';
import { FlaskConical, MessageSquare } from 'lucide-react';
import { User, Message } from '@/lib/data';
import { ResearchForumView } from './ResearchForumView';
import { AlumniConnectView } from './AlumniConnectView';
import { cn } from '@/lib/utils';

export type RCTab = 'riset' | 'connect';

interface ResearchConnectViewProps {
  currentUser: User | null;
  onLoginClick: () => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  initialTab?: RCTab;
  unreadCount?: number;
}

/**
 * Gabungan dua papan dalam satu navigasi "Research & Alumni Connect":
 *  - Forum Riset (ResearchForumView)
 *  - AlumniConnect (AlumniConnectView)
 * Pengguna berpindah lewat tab di bagian atas.
 */
export const ResearchConnectView = ({
  currentUser, onLoginClick, messages, setMessages, initialTab = 'riset', unreadCount = 0,
}: ResearchConnectViewProps) => {
  const [tab, setTab] = useState<RCTab>(initialTab);

  const tabs: { id: RCTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'riset', label: 'Forum Riset', icon: <FlaskConical className="w-4 h-4" /> },
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

      {tab === 'riset' ? (
        <ResearchForumView currentUser={currentUser} onLoginClick={onLoginClick} />
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
