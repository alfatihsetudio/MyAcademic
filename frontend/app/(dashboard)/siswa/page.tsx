'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import StudentGlassDashboard from '@/components/Views/StudentGlassDashboard';
import StudentSettingsModal from '@/components/Modals/StudentSettingsModal';
import { getStoredUser, DEFAULT_USER, setStoredUser } from '@/lib/api';

export default function SiswaMasterPage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser() || DEFAULT_USER);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSwitchRole = (newRole: string) => {
    let name = 'Ahmad Siswa';
    if (newRole === 'superadmin') name = 'Super Admin (Platform Owner)';
    else if (newRole === 'admin') name = 'Hendra Pratama, S.Kom (Admin Sekolah)';
    else if (newRole === 'kepsek') name = 'Dr. H. Sulaiman, M.Si (Kepsek)';
    else if (newRole === 'guru') name = 'Budi Santoso, M.Pd (Guru)';
    else if (newRole === 'walikelas') name = 'Siti Aminah, M.Pd (Wali Kelas)';
    else if (newRole === 'bk') name = 'Nurul Hidayah, S.Psi (Konselor BK)';
    else if (newRole === 'tu') name = 'Hendra Pratama (Staff TU)';
    else if (newRole === 'parent') name = 'Bambang Trianto (Wali Murid)';

    const updated = {
      ...user,
      role: newRole,
      name,
    };
    setUser(updated);
    setStoredUser(updated);

    if (newRole === 'murid') {
      // Stay on /siswa
    } else if (newRole === 'admin') {
      router.push('/admin');
    } else if (newRole === 'guru') {
      router.push('/guru');
    } else if (newRole === 'tu') {
      router.push('/tu');
    } else {
      router.push('/');
    }
  };

  return (
    <RoleGuard allowedRoles={['murid', 'admin']}>
      <StudentGlassDashboard
        currentUser={user}
        onSwitchRole={handleSwitchRole}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <StudentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={user}
        onUserUpdated={(updated) => {
          setUser(updated);
          setStoredUser(updated);
        }}
      />
    </RoleGuard>
  );
}
