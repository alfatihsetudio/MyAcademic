'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import TeacherGlassDashboard from '@/components/Views/TeacherGlassDashboard';
import { getStoredUser, DEFAULT_USER, setStoredUser } from '@/lib/api';

export default function GuruPresensiPage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser() || DEFAULT_USER);
  const teacherUser = {
    ...user,
    role: 'guru',
    name: user.role === 'guru' ? user.name : 'Budi Santoso, M.Pd (Guru)',
  };

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

    if (newRole === 'guru') {
      router.push('/guru');
    } else if (newRole === 'murid') {
      router.push('/siswa');
    } else {
      router.push('/');
    }
  };

  return (
    <RoleGuard allowedRoles={['guru', 'admin']}>
      <TeacherGlassDashboard
        currentUser={teacherUser}
        defaultFeature="attendance"
        onSwitchRole={handleSwitchRole}
      />
    </RoleGuard>
  );
}
