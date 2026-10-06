'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { getStoredUser, setStoredUser } from '@/lib/api';

interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isSubmitModalOpen: boolean;
  setIsSubmitModalOpen: (open: boolean) => void;
  selectedTaskId: number;
  setSelectedTaskId: (id: number) => void;
  handleQuickAction: (action: string) => void;
}

const defaultUser: User = {
  id: 1,
  name: 'Ahmad Siswa',
  email: 'ahmad@myacademic.test',
  role: 'murid',
  school_id: 1,
  class_id: 1,
};

const DashboardContext = createContext<DashboardContextType>({
  activeTab: 'journey',
  setActiveTab: () => {},
  currentUser: defaultUser,
  setCurrentUser: () => {},
  switchRole: () => {},
  isSettingsOpen: false,
  setIsSettingsOpen: () => {},
  isSubmitModalOpen: false,
  setIsSubmitModalOpen: () => {},
  selectedTaskId: 1,
  setSelectedTaskId: () => {},
  handleQuickAction: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('journey');
  const [currentUser, setCurrentUserState] = useState<User>(() => getStoredUser() || defaultUser);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(1);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setStoredUser(user);
  };

  const switchRole = (role: string) => {
    let name = 'Ahmad Siswa';
    if (role === 'admin') name = 'Super Administrator';
    else if (role === 'kepsek') name = 'Dr. H. Sulaiman, M.Si (Kepsek)';
    else if (role === 'guru') name = 'Budi Santoso, M.Pd (Guru)';
    else if (role === 'walikelas') name = 'Siti Aminah, M.Pd (Wali Kelas)';
    else if (role === 'bk') name = 'Nurul Hidayah, S.Psi (Konselor BK)';
    else if (role === 'tu') name = 'Hendra Pratama (Staff TU)';
    else if (role === 'parent') name = 'Bambang Trianto (Wali Murid)';

    const updated: User = {
      ...currentUser,
      role,
      name,
    };
    setCurrentUser(updated);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'grid':
        setActiveTab('catalog');
        break;
      case 'database':
        setActiveTab('space-belajar');
        break;
      case 'calendar':
        setActiveTab('schedule');
        break;
      case 'upload':
        setIsSubmitModalOpen(true);
        break;
      case 'plus':
        setActiveTab('assignments');
        break;
      case 'star':
        setActiveTab('gradebook');
        break;
      case 'send':
        setActiveTab('attendance');
        break;
      case 'alert':
        setActiveTab('walikelas-bk');
        break;
      default:
        setActiveTab('catalog');
        break;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        switchRole,
        isSettingsOpen,
        setIsSettingsOpen,
        isSubmitModalOpen,
        setIsSubmitModalOpen,
        selectedTaskId,
        setSelectedTaskId,
        handleQuickAction,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
